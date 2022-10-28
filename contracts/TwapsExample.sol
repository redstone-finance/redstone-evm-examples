// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@redstone-finance/evm-connector/contracts/data-services/TwapsDemoConsumerBase.sol";

contract TwapsExample is TwapsDemoConsumerBase {
  /**
   * Returns the time-weighted average price of ETH
   */
  function getTwapEthPrice() public view returns (uint256) {
    bytes32 dataFeedId = bytes32("ETH-TWAP-60");
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }
}
