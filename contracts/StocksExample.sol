// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "redstone-evm-connector-exp/dist/contracts/data-services/StocksDemoConsumerBase.sol";

contract StocksExample is StocksDemoConsumerBase {
  /**
   * Returns the latest price of TSLA stocks
   */
  function getLatestTslaPrice() public view returns (uint256) {
    bytes32 dataFeedId = bytes32("TSLA");
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }

  function isTimestampValid(uint256 receivedTimestamp) public view override returns (bool) {
    console.log("Timestamp: ", receivedTimestamp);
    receivedTimestamp;
    return true;
  }
}
