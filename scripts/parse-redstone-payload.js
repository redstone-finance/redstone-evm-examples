const redstone = require("redstone-protocol");
const { BigNumber } = require("ethers");
const { arrayify, hexlify, toUtf8String } = require("ethers/lib/utils");

// This script can be used to parse transaction calldata with a valid redstone payload
// and print its details. To use it you should replace the value of the `TX_CALLDATA`
// constant and launch this script from the root folder using the following command
// `npx hardhat run scripts/parse-redstone-payload.js`

// Sometimes you can receive overflow errors due to the shortcomings in the parsing
// implementation. As a temporary solution, you can try to play with redstone-sdk and
// redstone-protocol code in the node_modules

const TX_CALLDATA = "0x43419ea3415641580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000578da2a00186cbf7cc6000000020000001a10a1767e53e47a478b4be01bc98388685850801b4b14508ab925bea39666064767471541759079aa5c6f41a89aeb29a1a75ce06d5d97b13e02121b020dd44951c415641580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000578da2a00186cbf7cc6000000020000001b260a85b2115bc48ef8504dc5c3b1a680417edc84458dc0246c7b748f031953a43291ad6dfb272726da9c1ad27a2514ca278662e82e0ccc72ea2ae526606b2e41c415641580000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000578da2a00186cbf7cc60000000200000014492fa1e900bed5d11066bd7460d8a97e481bc41a71f3cc13a23d37f3a4c007030dc99b03103e8fc6a68d7c02f33a19a62b8346164a7397209f45459aa66a64f1c00033136373834353932363732363723302e302e32322372656473746f6e652d6176616c616e6368652d70726f6400002c000002ed57011e0000";
const LONG_LINE = "------------------------------------------------------------------------";

main();

function main() {
  const txCalldataBytes = arrayify(TX_CALLDATA);
  const parsingResult = redstone.RedstonePayload.parse(txCalldataBytes);

  console.log(parsingResult);

  console.log(LONG_LINE);
  console.log("Unsigned metadata: ", toUtf8String(parsingResult.unsignedMetadata));
  console.log("Data packages count: ", parsingResult.signedDataPackages.length);
  console.log("Calldata without redstone payload: ", hexlify(parsingResult.remainderPrefix));

  let dataPackageIndex = 0;
  for (const signedDataPackage of parsingResult.signedDataPackages) {
    console.log(LONG_LINE);
    console.log(`Data package: ${dataPackageIndex}`);
    console.log(`Timestamp: ${signedDataPackage.dataPackage.timestampMilliseconds}`);
    console.log(`Date and time: ${new Date(signedDataPackage.dataPackage.timestampMilliseconds).toUTCString()}`);
    console.log("Signer address: ", signedDataPackage.recoverSignerAddress());
    console.log("Data points count: ", signedDataPackage.dataPackage.dataPoints.length);
    console.log("Data points symbols: ", signedDataPackage.dataPackage.dataPoints.map(dp => dp.dataFeedId));
    // console.log("Data points values: ", signedDataPackage.dataPackage.dataPoints.map(dp => BigNumber.from(dp.value).toNumber()));

    dataPackageIndex++;
  }
  console.log(LONG_LINE);
}
