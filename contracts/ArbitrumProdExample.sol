// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@redstone-finance/evm-connector/contracts/data-services/ArbitrumProdDataServiceConsumerBase.sol";

contract ArbitrumProdExample is ArbitrumProdDataServiceConsumerBase {
  function getLatestPrice(bytes32 dataFeedId) public view returns (uint256) {
    return getOracleNumericValueFromTxMsg(dataFeedId);
  }
}
