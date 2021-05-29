import { TezosToolkit, MichelCodecPacker } from "@taquito/taquito";
import { InMemorySigner } from '@taquito/signer'
import { swap, batchify, findDex, estimateTezInToken, estimateTokenInTez } from "@quipuswap/sdk";
import BigNumber from "bignumber.js";

// Returns:
// Token price in XTZ.
// -----------------------------------------
async function getTokenPrice(token: string, tokenAddress: string, tokenId: number, decimals: number, amount: BigNumber, tezos: TezosToolkit) : Promise<BigNumber> {

  const factories = {
    fa1_2Factory: "KT1WkKiDSsDttdWrfZgcQ6Z9e3Cp4unHP2CP",
    fa2Factory: "KT1SwH9P1Tx8a58Mm6qBExQFTcy2rwZyZiXS",
  };

  try {
    const fromAsset = {
        contract: tokenAddress,
        id: tokenId
    };
    const dex = await findDex(tezos, factories, fromAsset);
    const dexStorage = await dex.storage();
    const price = estimateTezInToken(dexStorage, amount);

    console.info(`${amount.toNumber() / (10**decimals)} $${token}: ${price.toNumber() / (10**6)} XTZ`);

    return price;

  } catch (err) {

    console.error(err);
    return new BigNumber(-1);

  }
}

// Returns:
// Value bought if swap is successful,
// -1 otherwise.
// -----------------------------------------
async function doSwap(token: string, tokenAddress: string, tokenId: number, decimals: number, amount: BigNumber, slippage: number, tezToToken: Boolean, tezos: TezosToolkit) : Promise<BigNumber> {

  const factories = {
    fa1_2Factory: "KT1WkKiDSsDttdWrfZgcQ6Z9e3Cp4unHP2CP",
    fa2Factory: "KT1SwH9P1Tx8a58Mm6qBExQFTcy2rwZyZiXS",
  };

  try {

    var fromAsset;
    var toAsset;
    var fromDecimals;
    var toDecimals;
    var from;
    var to;
    
    if (tezToToken) {
      fromAsset = "tez";
      toAsset = { contract: tokenAddress, id: tokenId };
      fromDecimals = 6;
      toDecimals = decimals;
      from = "XTZ";
      to = token;
    } else {
      fromAsset = { contract: tokenAddress, id: tokenId};
      toAsset = "tez";
      fromDecimals = decimals;
      toDecimals = 6;
      from = token;
      to = "XTZ";
    }

    console.info(`Swapping ${from} for ${to}`);
    
    const inputValue = amount;
    const slippageTolerance = slippage;
    const swapParams = await swap(
      tezos,
      factories,
      fromAsset,
      toAsset,
      inputValue,
      slippageTolerance
    );

    const op = await batchify(
      tezos.wallet.batch([]),
      swapParams
    ).send();

    console.info(`Transaction: https://tzkt.io/${op.opHash}`);
    
    try {
      var dex;
      if (tezToToken) {
        dex = await findDex(tezos, factories, toAsset);
      } else {
        dex = await findDex(tezos, factories, fromAsset);
      }
      const dexStorage = await dex.storage();
      var valueBought = new BigNumber(-1);
      if (tezToToken) {
        valueBought = estimateTokenInTez(dexStorage, amount);
      } else {
        valueBought = estimateTezInToken(dexStorage, amount);
      }
    } catch (err) {
      console.error(err);
    }
    
    await op.confirmation();

    console.info(`Swapped ${amount.toNumber() / 10**fromDecimals} $${from} for ${valueBought.toNumber() / 10**toDecimals} $${to} at ${ (amount.toNumber() / 10**fromDecimals) / (valueBought.toNumber() / 10**toDecimals)} ${to}/${from}`);

    return valueBought;

  } catch (err) {

    console.error(err);
    return new BigNumber(-1);

  }
}

// -----------------------------------------
async function main() {

  // -------------------- Arguments
  console.log("Usage:\tnode price_trigger.js {PRIVATE_KEY} {PRICE_THRESHOLD} {TEZ_BUY_AMOUNT_PER_TRIGGER} {SLIPPAGE} {NODE_URL} [-c]\n\t-c : continuous execution");
  const args = process.argv;
  const privateKey = new String(args[2]);
  const priceThreshold = new Number(args[3]);
  const tezBuyAmountPerTrigger = new Number(args[4]);
  const slippage = new Number(args[5]);
  const nodeUrl = new String(args[6]);
  const continuous = new String(args[7]); 
  var continuousBool = false;
  if (continuous == "-c")
    continuousBool = true;
  // -------------------------------

  // -------------------- Parameters
  const token = "hDAO";
  const tokenContract = "KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW";
  const tokenId = 0;
  const tokenDecimals = 6;

  // ----------------------------------------------------
  //const nodeUrl = "https://rpc.tzbeta.net/";
  const slippageDec = slippage.valueOf() / 100;

  console.log("--------------------------------");
  console.log(`nodeUrl: ${nodeUrl}`);
  console.log(`Token to buy: $${token} (${tokenContract}:${tokenId})`);
  console.log(`Price Threshold: ${priceThreshold} hDAO/XTZ`);
  console.log(`Slippage: ${slippage}%`);
  console.log(`Continuous Exection: ${continuousBool}`);
  console.log(`You will Buy ${tezBuyAmountPerTrigger} $XTZ worth of $${token} when the price strikes (equal or below) ${priceThreshold} $${token}/XTZ on Quipuswap, with a slippage of ${slippage}%`);
  console.log("--------------------------------");

  const tezos = new TezosToolkit(nodeUrl.toString());

  // -------------------- Sign into account
  console.log("--------------------------------");
  console.log("Signing into Account...");

  await InMemorySigner.fromSecretKey(privateKey.toString())
    .then((theSigner) => {
      tezos.setProvider({ signer: theSigner });
      return tezos.signer.publicKeyHash();
    })
    .then((publicKeyHash) => {
      console.log(`Account: ${publicKeyHash}.`);
    })
    .catch((error) => {
      console.log(`Error: ${error} ${JSON.stringify(error, null, 2)}`);
      process.exit(1);
    });

  const account = await tezos.wallet.pkh();

  var bought = false;
  console.log("--------------------------------");
  console.log('Starting Price Watcher');
  
  while (!bought || continuousBool ) {
    
    try {
      var tokenPrice = await getTokenPrice(token.toString(), tokenContract.toString(), tokenId.valueOf(), tokenDecimals, new BigNumber(1*(10**tokenDecimals)), tezos);
      var tokenPriceDec = tokenPrice.toNumber() / 10**6;

      if (tokenPriceDec <= priceThreshold && tokenPriceDec > 0) {
        // BUY BUY BUY
        console.log(`${token} price has reached price threshold of ${priceThreshold} $XTZ. Buying ${tezBuyAmountPerTrigger} $XTZ worth now!`);
        var hdaoBought = await doSwap(token.toString(), tokenContract.toString(), tokenId.valueOf(), tokenDecimals, new BigNumber(tezBuyAmountPerTrigger.valueOf()*(10**6)), slippageDec, true, tezos);

        if (hdaoBought.toNumber() > 0) {
          bought = true;
        } else {
          console.error(`Something went wrong doing the swap. Check that you have sufficient XTZ funds or try increasing the slippage.`);
        }
      }
    } catch (error) {
      console.error(error);
    }

  }

  console.log("Exiting");

}

main();