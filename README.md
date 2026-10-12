# RedStone Oracle Examples for EVM chains

Pull model examples using `@redstone-finance/evm-connector`. OEV examples are in [oev](oev).

## API key

Data packages are fetched from RedStone authenticated gateways, which require an API key from RedStone. See [Authenticated gateways](https://docs.redstone.finance/docs/stage1-market-data/price-feeds/pull-model/#authenticated-gateways) for how to get one.

## Get started

```sh
git clone https://github.com/redstone-finance/redstone-evm-examples
cd redstone-evm-examples
yarn
cp .env.example .env # set REDSTONE_API_KEY
```

## Run tests with examples

```sh
yarn test
```

`MockExample` runs without an API key.

## Parsing redstone payload

```sh
node scripts/parse-redstone-payload.js
```
