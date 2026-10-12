require("@nomicfoundation/hardhat-toolbox");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",

  mocha: {
    timeout: 120_000,
    // RedStone gateway API keys are rate limited to 1 request per second
    rootHooks: { afterEach: () => new Promise((resolve) => setTimeout(resolve, 1000)) },
  },
};
