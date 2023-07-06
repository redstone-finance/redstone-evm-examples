// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";

contract MainExample is MainDemoConsumerBase {
  /**
   * Returns the latest price of STX stocks
   */
  function getLatestStxPrice() public view returns (uint256) {
    bytes32 dataFeedId = bytes32("STX");
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }

  function getLatestValueForDataFeed(bytes32 dataFeedId) public view returns (uint256) {
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }

  function getLatestValueWithManualPayload(bytes32 dataFeedId, bytes calldata) public view returns (uint256) {
    getLatestValueForDataFeed(dataFeedId);
  }
}
