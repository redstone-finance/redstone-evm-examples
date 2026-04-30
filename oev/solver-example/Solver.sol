// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IMorpho.sol";

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

interface IWHYPE {
    function deposit() external payable;

    function withdraw(uint wad) external;

    function balanceOf(address account) external view returns (uint256);
}

// Example Solver compatible with Morpho-like protocols on HyperEVM.
// Not meant to be used in production environment.
contract Solver is IMorphoLiquidateCallback {
    address payable public owner;
    address public morpho;
    address payable public whype;
    address payable public executor;

    event LiquidateCalled(uint256 bidAmount, address solver);
    event PayBidCalled(uint256 bidAmount);
    event LiquidationFailed(uint256 index, address borrower, string reason);
    event PositionMismatch(
        address borrower,
        Id marketId,
        uint128 onChainBorrowShares,
        uint256 paramRepaidShares,
        uint128 onChainCollateral,
        uint256 paramSeizedAssets
    );

    struct SwapStep {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address router;
    }

    struct LiquidationParams {
        Id marketId;
        address borrower;
        uint256 seizedAssets;
        uint256 repaidShares;
        SwapStep[] swapSteps;
    }

    struct CallbackData {
        address loanToken;
        SwapStep[] swapSteps;
    }

    constructor(
        address _owner,
        address _morpho,
        address _whype,
        address _executor
    ) {
        owner = payable(_owner);
        morpho = _morpho;
        whype = payable(_whype);
        executor = payable(_executor);
    }

    receive() external payable {}

    fallback() external payable {}

    modifier onlyExecutor() {
        require(msg.sender == executor, "Only executor");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function withdraw() external onlyOwner {
        (bool ok,) = owner.call{value: address(this).balance}("");
        require(ok, "Transfer failed");
    }

    function withdrawERC20(address _erc20Address) external onlyOwner {
        IERC20 token = IERC20(_erc20Address);
        uint256 contractBalance = token.balanceOf(address(this));
        token.transfer(owner, contractBalance);
    }

    function liquidate(uint256 bidAmount, address solver, bytes calldata operationData) external onlyExecutor {
        emit LiquidateCalled(bidAmount, solver);

        LiquidationParams[] memory params = abi.decode(operationData, (LiquidationParams[]));

        uint256 successCount = 0;
        string memory lastReason;

        for (uint256 i = 0; i < params.length; i++) {
            LiquidationParams memory param = params[i];

            (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) =
                                    IMorpho(morpho).idToMarketParams(param.marketId);

            bytes memory callbackData = abi.encode(CallbackData({
                loanToken: loanToken,
                swapSteps: param.swapSteps
            }));

            (, uint128 onChainBorrowShares, uint128 onChainCollateral) =
                                    IMorpho(morpho).position(param.marketId, param.borrower);

            if (
                (param.repaidShares > 0 && uint256(onChainBorrowShares) != param.repaidShares) ||
                (param.seizedAssets > 0 && uint256(onChainCollateral) != param.seizedAssets)
            ) {
                emit PositionMismatch(
                    param.borrower,
                    param.marketId,
                    onChainBorrowShares,
                    param.repaidShares,
                    onChainCollateral,
                    param.seizedAssets
                );
            }

            uint256 actualRepaidShares = param.repaidShares > 0 ? uint256(onChainBorrowShares) : 0;

            try IMorpho(morpho).liquidate(
                MarketParams(loanToken, collateralToken, oracle, irm, lltv),
                param.borrower,
                param.seizedAssets,
                actualRepaidShares,
                callbackData
            ) {
                successCount++;
            } catch Error(string memory reason) {
                lastReason = reason;
                emit LiquidationFailed(i, param.borrower, reason);
            } catch (bytes memory returnData) {
                string memory extractedReason = _extractRevertReason(returnData);
                lastReason = extractedReason;
                emit LiquidationFailed(i, param.borrower, extractedReason);
            }
        }

        require(successCount > 0, lastReason);

        // note: you should verify the actual profit according to your own rules
        // to prevent unprofitable liquidations and protect against MEV sandwich attacks

        // Convert remaining WHYPE to HYPE
        uint256 whypeBalance = IWHYPE(whype).balanceOf(address(this));
        if (whypeBalance > 0) {
            IWHYPE(whype).withdraw(whypeBalance);
        }

    }

    function payBid(uint256 bidAmount) external onlyExecutor {
        emit PayBidCalled(bidAmount);
        (bool ok,) = payable(msg.sender).call{value: bidAmount}("");
        require(ok, "Transfer failed");

    }

    function _extractRevertReason(bytes memory ret) internal pure returns (string memory) {
        if (ret.length < 68) return "";
        assembly {ret := add(ret, 0x04)}
        return abi.decode(ret, (string));
    }

    function onMorphoLiquidate(uint256 repaidAssets, bytes calldata data) external override {
        require(msg.sender == morpho, "Only morpho");

        CallbackData memory decoded = abi.decode(data, (CallbackData));

        for (uint256 i = 0; i < decoded.swapSteps.length; i++) {
            SwapStep memory step = decoded.swapSteps[i];
            uint256 balance = IERC20(step.tokenIn).balanceOf(address(this));

            if (IERC20(step.tokenIn).allowance(address(this), step.router) < balance) {
                IERC20(step.tokenIn).approve(step.router, type(uint256).max);
            }
            ISwapRouter(step.router).exactInputSingle(ISwapRouter.ExactInputSingleParams({
                tokenIn: step.tokenIn,
                tokenOut: step.tokenOut,
                fee: step.fee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: balance,
                // note: allows any slippage, should be only used with manual profit check
                // otherwise - set to a preferred value
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            }));
        }

        uint256 loanBalance = IERC20(decoded.loanToken).balanceOf(address(this));
        require(loanBalance >= repaidAssets, "Insufficient swap output");

        IERC20(decoded.loanToken).approve(morpho, repaidAssets);
    }
}
