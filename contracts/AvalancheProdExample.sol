// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@redstone-finance/evm-connector/contracts/data-services/AvalancheDataServiceConsumerBase.sol";

contract AvalancheProdExample is AvalancheDataServiceConsumerBase {
  // TODO: remove
  function getUniqueSignersThreshold() public view virtual override returns (uint8) {
    return 3;
  }

  /**
   * Returns the latest price of AVAX
   */
  function getLatestAvaxPrice() public view returns (uint256) {
    bytes32 dataFeedId = bytes32("AVAX");
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }

  function getLatestPricesForManyAssets(
    bytes32[] memory dataFeedIds
  ) public view returns (uint256[] memory) {
    return getOracleNumericValuesFromTxMsg(dataFeedIds);
  }

  function getLatestPricesForManyAssetsWithDuplicates(
    bytes32[] memory dataFeedIdsWithDuplicates
  ) public view returns (uint256[] memory) {
    return getOracleNumericValuesWithDuplicatesFromTxMsg(dataFeedIdsWithDuplicates);
  }
}
