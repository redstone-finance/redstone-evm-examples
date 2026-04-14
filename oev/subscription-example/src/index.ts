import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { ResilientWebSocketClient } from './client/ResilientWebSocketClient';
import { PayloadType } from './client/types';
import { RedstoneCommon } from '@redstone-finance/utils';

const WS_URL = process.env.WS_URL!;
const API_KEY = process.env.API_KEY!; // the apiKey received from RedStone

async function main() {
  console.log('Starting External WebSocket Solver Example...');

  const client = new ResilientWebSocketClient({
    clientId: 'redstone-solver-example',
    url: WS_URL,
    wsOptions: {
      headers: { 'x-api-key': API_KEY },
    },
    rotation: {
      ttl: RedstoneCommon.hourToMs(7), // 7h
    },
    onMessage: async (rawData, wsClient) => {
      try {
        const msg = JSON.parse(rawData.toString());
        console.log(msg);

        // We only care about auction broadcasts
        if (msg.op !== 'auction') {
          return;
        }

        const auctionId = msg.id;
        const feedUpdates = msg.payload;

        console.log(
          `\n[Auction ${auctionId}] Received feed updates:`,
          feedUpdates,
        );

        // ======================================================================
        // TODO: Implement your custom liquidation logic here!
        // You should calculate if any positions are profitable to liquidate based
        // on the new token prices within `feedUpdates`.
        // ======================================================================

        // For this example, we mock a profitable liquidation payload:
        const isProfitable = true;

        if (isProfitable) {
          console.log(`[Auction ${auctionId}] Submitting bid...`);

          /*
          Example showing how to generate "liquidationSig" that needs to be sent back to Auctioneer

          const types = [
            'string',   // "EXECUTOR_V6"
            'uint256',  // network chainId
            'address',  // your operationCallback (solver contract address)
            'bytes32',  // keccak256(operationData)
            'uint256',  // bidAmount in Wei
            'uint256',  // strictly ascending nonce
            'uint256'   // maxTxGasPrice limit
          ];

          const values = [
            'EXECUTOR_V6',
            chainId,
            solverContractAddress,
            operationDataHash,
            bidAmount,
            nonce,
            maxGasPrice
          ];

          const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(types, values);

          const messageHash = ethers.keccak256(encodedData);
          const liquidationSig = await wallet.signMessage(ethers.getBytes(messageHash));
          */

          wsClient.send(
            JSON.stringify({
              op: 'solve',
              id: auctionId,
              data: {
                bid: '2000000000000000', // 0.002 ETH in wei, representing your OEV bid
                nonce: '1',
                operationCallback: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // your Solver smart contract address
                operationData: '0x1234', // calldata to be provided to the Solver smart contract
                liquidationSig: '0x55522b',
                maxTxGasPrice: '50000000000',
              },
            }),
            PayloadType.SECRETS,
          );
        } else {
          console.log(
            `[Auction ${auctionId}] Skipping... no profitable liquidations.`,
          );
        }
      } catch (e) {
        console.error('Failed to parse incoming message:', e);
      }
    },
  });

  // Subscribe to the oev/feeds topic.
  // ResilientWebSocketClient will automatically re-send this upon any disconnections/reconnections.
  await client.subscribe({
    key: 'oev',
    buildSubscribe: () =>
      JSON.stringify({
        op: 'subscribe',
        topic: 'oev/feeds',
      }),
  });

  console.log(`Connected and subscribed to ${WS_URL}`);
}

main().catch(console.error);
