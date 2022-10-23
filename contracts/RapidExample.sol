// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "redstone-evm-connector-exp/dist/contracts/data-services/RapidDemoConsumerBase.sol";

contract RapidExample is RapidDemoConsumerBase {
  /**
   * Returns the latest price of ETH
   */
  function getLatestEthPrice() public view returns (uint256) {
    bytes32 dataFeedId = bytes32("ETH");
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }
}
