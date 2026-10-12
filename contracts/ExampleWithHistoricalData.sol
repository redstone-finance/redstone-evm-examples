// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@redstone-finance/evm-connector/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";

contract ExampleWithHistoricalData is PrimaryProdDataServiceConsumerBase {

  error InvalidTimestamp(uint256 receivedTimestampSeconds, uint256 expectedTimestamp);

  function validateTimestamp(uint256 receivedTimestampMilliseconds) public view virtual override {
    // We disable timestamp verification here
    // as we validate timestamp in the getHistoricalBtcPrice function
  }
  
  function getHistoricalBtcPrice(uint256 allowedTimestamp) public view returns (uint256) {
    uint256 receivedTimestamp = extractTimestampsAndAssertAllAreEqual();
    if (allowedTimestamp != receivedTimestamp) {
      revert InvalidTimestamp(receivedTimestamp, allowedTimestamp);
    }
    return getOracleNumericValueFromTxMsg(bytes32("BTC"));
  }
}
