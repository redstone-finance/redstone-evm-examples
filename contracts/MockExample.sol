// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@redstone-finance/evm-connector/contracts/mocks/RedstoneConsumerNumericMock.sol";

contract MockExample is RedstoneConsumerNumericMock {
  /**
   * Returns the latest price of AVAX
   */
  function getLatestAvaxPrice() public view returns (uint256) {
    bytes32 dataFeedId = bytes32("AVAX");
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }

  /**
   * Returns prices for the given dataFeedIds
   */
  function getLatestPricesForManyAssets(bytes32[] memory dataFeedIds)
    public
    view
    returns (uint256[] memory)
  {
    return getOracleNumericValuesFromTxMsg(dataFeedIds);
  }
}
