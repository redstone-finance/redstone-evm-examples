// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@redstone-finance/evm-connector/contracts/data-services/PrimaryDemoDataServiceConsumerBase.sol";

contract PrimaryDemoExample is PrimaryDemoDataServiceConsumerBase {
  function getLatestPrice(bytes32 dataFeedId) public view returns (uint256) {
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }
}
