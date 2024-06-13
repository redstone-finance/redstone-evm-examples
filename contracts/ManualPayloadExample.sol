// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";
import "./MainExample.sol";

contract ManualPayloadExample is MainDemoConsumerBase {
  MainExample externalContract;

  constructor() {
    externalContract = new MainExample();
  }

  /**
   * Returns the latest price of the given asset
   * Doesn't need to be called on a wrapped contract instance
   * But requires to pass a valid manual payload
   */
  function getLatestPrice(bytes32 assetDataFeedId, bytes calldata) public view returns (uint256) {
    return getOracleNumericValueFromTxMsg(assetDataFeedId);
  }

  // Extracting oracle data in another contract
  function getLatestPriceFromAnotherContract(
    bytes32 assetDataFeedId,
    bytes calldata payload
  ) public view returns (uint256) {
    return externalContract.getLatestValueWithManualPayload(assetDataFeedId, payload);
  }
}
