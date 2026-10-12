const DOCS_URL =
  "https://docs.redstone.finance/docs/stage1-market-data/price-feeds/pull-model/#authenticated-gateways";

const getAuthenticatedGateways = () => {
  const gateways = [
    { url: process.env.REDSTONE_GATEWAY_URL, apiKey: process.env.REDSTONE_API_KEY },
    { url: process.env.REDSTONE_BACKUP_GATEWAY_URL, apiKey: process.env.REDSTONE_BACKUP_API_KEY },
  ];
  if (gateways.some(({ url, apiKey }) => !url || !apiKey)) {
    throw new Error(
      `Both authenticated gateways (url + API key) must be set in .env. Get them from RedStone: ${DOCS_URL}`
    );
  }

  return gateways;
};

module.exports = { getAuthenticatedGateways };
