// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "redstone-evm-connector-exp/dist/contracts/data-services/AvalancheDataServiceConsumerBase.sol";

contract AvalancheProdExample is AvalancheDataServiceConsumerBase {
  /**
   * Returns the latest price of AVAX
   */
  function getLatestAvaxPrice() public view returns (uint256) {
    bytes32 dataFeedId = bytes32("AVAX");
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }

  function getLatestPricesForManyAssets(bytes32[] memory dataFeedIds)
    public
    view
    returns (uint256[] memory)
  {
    return getOracleNumericValuesFromTxMsg(dataFeedIds);
  }
}
