# RedStone Oracle Examples for EVM chains

Pull model examples using `@redstone-finance/evm-connector`. OEV examples are in [oev](oev).

## API key

Data packages are fetched from RedStone authenticated gateways, which require API keys from RedStone. You get two (gateway url, API key) pairs - the second one is a fallback. See [Authenticated gateways](https://docs.redstone.finance/docs/stage1-market-data/price-feeds/pull-model/#authenticated-gateways) for how to get them.

## Get started

```sh
git clone https://github.com/redstone-finance/redstone-evm-examples
cd redstone-evm-examples
yarn
cp .env.example .env # set both gateways and API keys
```

## Run tests with examples

```sh
yarn test
```

`MockExample` runs without API keys.

## Parsing redstone payload

```sh
node scripts/parse-redstone-payload.js
```
