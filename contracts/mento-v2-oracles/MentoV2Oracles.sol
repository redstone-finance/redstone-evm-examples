// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import {RedstoneConsumerNumericBase, NumericArrayLib} from "@redstone-finance/evm-connector/contracts/core/RedstoneConsumerNumericBase.sol";

contract MentoV2Oracles is RedstoneConsumerNumericBase {
  error InvalidProviderForRateFeed(address rateFeedId, address provider);
  error TimestampFromFutureIsNotAllowed(uint256 receivedTimestampMilliseconds, uint256 blockTimestamp);
  error DataIsNotFresh(uint256 receivedTimestampMilliseconds, uint256 minAllowedTimestampForNewDataSeconds);
  error CertaintyThresholdNotReached(uint8 receivedCertainties, uint8 certaintyThreshold);
  error MinAndMaxValuesDeviateTooMuch(uint256 minVal, uint256 maxVal);

  // Some uint256 types can be changed to smaller ones later to optimise storage usage
  struct RateFeedDetails {
    uint256 value;
    uint256 latestTimestamp;
    uint256 allowedStaleness;
    uint256 allowedDeviation;
    uint8 certaintyThreshold;
    uint8 quorum;
    bool hasFreshness;
    bytes32 dataFeedId;
  }

  mapping(address => mapping(address => bool)) rateFeedProviders;
  mapping(address => bytes32) rateFeedAddressesToIds;
  mapping(address => RateFeedDetails) rateFeeds;

  address internal currentlyUpdatedRateFeedId;

  function report(address rateFeedId) public {
    currentlyUpdatedRateFeedId = rateFeedId;
    RateFeedDetails storage details = rateFeeds[rateFeedId];
    details.value = getOracleNumericValueFromTxMsg(rateFeedAddressesToIds[rateFeedId]);

    // We still would need to decide how to select the latest data timestamp
    // Because currently we assume providers provide the same timestamp
    // If not - we need to discuss the way to calculate its aggregated value (e.g. median or min)
    details.latestTimestamp = extractTimestampsAndAssertAllAreEqual();
  }

  function getUniqueSignersThreshold() public view virtual override returns (uint8) {
    return rateFeeds[currentlyUpdatedRateFeedId].quorum;
  }

  function validateTimestamp(uint256 receivedTimestampMilliseconds) public view override {
    uint256 receivedTimestampSeconds = receivedTimestampMilliseconds / 1000;
    RateFeedDetails storage rateFeed = rateFeeds[currentlyUpdatedRateFeedId];
    uint256 previousDataTimestampSeconds = rateFeed.latestTimestamp;
    uint256 minAllowedTimestampForNewDataInSeconds = previousDataTimestampSeconds + rateFeed.allowedStaleness;

    if (receivedTimestampSeconds <= minAllowedTimestampForNewDataInSeconds) {
      revert DataIsNotFresh(receivedTimestampMilliseconds, minAllowedTimestampForNewDataInSeconds);
    }

    if (receivedTimestampSeconds > block.timestamp) {
      revert TimestampFromFutureIsNotAllowed(receivedTimestampMilliseconds, block.timestamp);
    }
  }

  function aggregateValues(uint256[] memory valuesWithCertainties) public view virtual override returns (uint256) {
    RateFeedDetails storage details = rateFeeds[currentlyUpdatedRateFeedId];

    uint256[] memory values = new uint256[](valuesWithCertainties.length);
    uint8 certainties = 0;
    uint256 maxVal = 0;
    uint256 minVal = type(uint256).max;

    for (uint256 i = 0; i < valuesWithCertainties.length; i++) {
      (bool certainty, uint256 value) = parseValueWithCertainty(valuesWithCertainties[i]);
      values[i] = value;
      if (certainty) {
        certainties++;
      }
      if (value > maxVal) {
        maxVal = value;
      }
      if (value < minVal) {
        minVal = value;
      }
    }

    if (certainties < details.certaintyThreshold) {
      revert CertaintyThresholdNotReached(certainties, details.certaintyThreshold);
    }

    if ((maxVal - minVal) > details.allowedDeviation) {
      revert MinAndMaxValuesDeviateTooMuch(minVal, maxVal);
    }

    // In this implementation, we do not require sorted values, but we can add it
    return NumericArrayLib.pickMedian(values);
  }

  function parseValueWithCertainty(uint256 valueWithCertainty) public pure returns (bool certainty, uint256 value) {
    certainty = valueWithCertainty >= 2**255; // most significant bit
    value = valueWithCertainty & ((2**255) - 1); // 255 least significant bits
  }

  function getAuthorisedSignerIndex(
    address signerAddress
  ) public view virtual override returns (uint8) {
    if (!rateFeedProviders[currentlyUpdatedRateFeedId][signerAddress]) {
      revert InvalidProviderForRateFeed(currentlyUpdatedRateFeedId, signerAddress);
    }

    if (signerAddress == 0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774) {
      return 0;
    } else if (signerAddress == 0xdEB22f54738d54976C4c0fe5ce6d408E40d88499) {
      return 1;
    } else if (signerAddress == 0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202) {
      return 2;
    } else if (signerAddress == 0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE) {
      return 3;
    } else if (signerAddress == 0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de) {
      return 4;
    } else {
      revert SignerNotAuthorised(signerAddress);
    }
  }
}
