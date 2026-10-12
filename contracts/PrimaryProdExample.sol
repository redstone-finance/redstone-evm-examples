// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@redstone-finance/evm-connector/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";

contract PrimaryProdExample is PrimaryProdDataServiceConsumerBase {
  function getLatestPrice(bytes32 dataFeedId) public view returns (uint256) {
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }

  function getLatestPriceWithManualPayload(bytes32 dataFeedId, bytes calldata) public view returns (uint256) {
    return getLatestPrice(dataFeedId);
  }
}
