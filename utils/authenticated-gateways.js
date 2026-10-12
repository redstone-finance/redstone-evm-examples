const DOCS_URL =
  "https://docs.redstone.finance/docs/stage1-market-data/price-feeds/pull-model/#authenticated-gateways";

const getAuthenticatedGateways = () => {
  const apiKey = process.env.REDSTONE_API_KEY;
  if (!apiKey) {
    throw new Error(`REDSTONE_API_KEY is not set. Get an API key from RedStone: ${DOCS_URL}`);
  }

  return [{ url: process.env.REDSTONE_GATEWAY_URL || undefined, apiKey }];
};

module.exports = { getAuthenticatedGateways };
