// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.4;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SimplePriceFeedConsumer {
  AggregatorV3Interface private priceFeed;
  int256 public latestSavedPrice;

  constructor(AggregatorV3Interface priceFeed_) {
    priceFeed = priceFeed_;
  }

  function doSomethingWithPrice() public {
    (, int256 price, , , ) = priceFeed.latestRoundData();

    // We can do whatever logic with the price
    // In this example, we just save it in a storage variable
    latestSavedPrice = price;
  }
}
