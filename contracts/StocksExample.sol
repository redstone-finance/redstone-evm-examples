// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@redstone-finance/evm-connector/contracts/data-services/StocksDemoConsumerBase.sol";

contract StocksExample is StocksDemoConsumerBase {
  /**
   * Returns the latest price of TSLA stocks
   */
  function getLatestTslaPrice() public view returns (uint256) {
    bytes32 dataFeedId = bytes32("TSLA");
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }

  // function isTimestampValid(uint256 receivedTimestamp) public view override returns (bool) {
  //   // Getting data timestamp from future seems quite unlikely
  //   // But we've already spent too much time with different cases
  //   // Where block.timestamp was less than dataPackage.timestamp.
  //   // Some blockchains may case this problem as well.
  //   // That's why we add MAX_BLOCK_TIMESTAMP_DELAY
  //   // and allow data "from future" but with a small delay
  //   // require(
  //   //   (block.timestamp + DEFAULT_MAX_DATA_TIMESTAMP_AHEAD_IN_SECONDS) > receivedTimestamp,
  //   //   "Data with future timestamps is not allowed"
  //   // );
  //   // return
  //   //   block.timestamp * 1000 < receivedTimestamp ||
  //   //   block.timestamp * 1000 - receivedTimestamp < DEFAULT_MAX_DATA_TIMESTAMP_DELAY_IN_SECONDS;
  //   // console.log("Received Timestamp", receivedTimestamp);
  //   return true;
  // }
}
