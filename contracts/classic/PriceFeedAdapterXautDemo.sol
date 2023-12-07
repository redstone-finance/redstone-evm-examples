// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.4;

import "./RedStoneBaseContracts/redstone-oracles-monorepo/packages/on-chain-relayer/contracts/price-feeds/without-rounds/PriceFeedsAdapterWithoutRounds.sol";

contract PriceFeedAdapterXautDemo is PriceFeedsAdapterWithoutRounds {

  bytes32 constant private XAUT_ID = bytes32("XAUT");

  error UpdaterNotAuthorised(address signer);

  function getDataFeedIds() public pure override returns (bytes32[] memory dataFeedIds) {
    dataFeedIds = new bytes32[](1);
    dataFeedIds[0] = XAUT_ID;
  }

  // By default, we have 3 seconds between the updates, but in the Tangible Use Case
  // We need to set it to 0 to avoid conflicts between users
  function getMinIntervalBetweenUpdates() public view virtual override returns (uint256) {
    return 0;
  }

  // In production contract we strongly recommend to set it at least to 3
  function getUniqueSignersThreshold() public view virtual override returns (uint8) {
    return 1;
  }

  function requireAuthorisedUpdater(address updater) public view override virtual {
    // We leave it empty so that any sender with properly signed oracle data can update the price
  }

  function getDataFeedIndex(bytes32 dataFeedId) public view override virtual returns (uint256) {
    if (dataFeedId == XAUT_ID) { return 0; }
    revert DataFeedIdNotFound(dataFeedId);
  }

  // In production contract this function will have 5 signers
  function getAuthorisedSignerIndex(
    address signerAddress
  ) public view virtual override returns (uint8) {
    if (signerAddress == 0x0C39486f770B26F5527BBBf942726537986Cd7eb) {
      return 0;
    } else {
      revert SignerNotAuthorised(signerAddress);
    }
  }
}
