// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";

contract ExamplePseudoRandom is MainDemoConsumerBase {
  uint256[] generatedNFTIndexes;

  function getPseudoRandomness() private view returns(uint256) {
    bytes32 dataFeedId = bytes32("ENTROPY");
    uint256 randomValue = getOracleNumericValueFromTxMsg(dataFeedId);

    return uint256(
      keccak256(
        abi.encodePacked(
          randomValue,
          block.timestamp,
          blockhash(block.number - 1),
          blockhash(block.number)
        )
      )
    );
  }

  // Generates a random number from 1 to maxValue
  function generateRandomNumber(uint256 maxValue) public view returns(uint256) {
    uint256 randomness = getPseudoRandomness();
    return (randomness % maxValue) + 1;
  }

  // Firstly it generates a single random number (e.g. number of NFTs in a box)
  // Then it generates the specified number of random numbers
  function generateManyRandomNumbers(uint256 maxRandomNumbersCount, uint256 maxValue) public {
    uint256 randomness = getPseudoRandomness();
    uint256 randomNumbersCount = generateRandomNumber(maxRandomNumbersCount);
    generatedNFTIndexes = new uint256[](randomNumbersCount);
    for (uint256 i = 0; i < randomNumbersCount; i++) {
      generatedNFTIndexes[i] = uint256(keccak256(abi.encode(randomness, i))) % maxValue + 1;
    }
  }

  function getGeneratedNFTIndexes() public view returns(uint256[] memory) {
    return generatedNFTIndexes;
  }
}