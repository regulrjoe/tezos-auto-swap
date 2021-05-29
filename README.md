# TIME BASED TRIGGER

Buy X amount of $XTZ worth of $hDAO every N seconds. N seconds will have to pass before the first swap is triggered. The time between swaps starts when 
the latest swap is successfully applied. If a swap is unsuccessful it will retry until it is.

Exit the program with CTRL+C

## Pre-requirements
Node JS: https://nodejs.org/en/

## Run
Open your terminal and enter the following command. Replace the {} arguments with your configuration.

`$ node time_trigger.js {PRIVATE_KEY} {SECONDS_PER_TRIGGER} {TEZ_BUY_AMOUNT_PER_TRIGGER} {SLIPPAGE}`

## Arguments Explained
Required:
* PRIVATE_KEY : Your wallet's private key. For Temple Wallet you can find it under Settings -> Reveal Private Key. I don't know how to find it on Kukai. (IMPORTANT: The key is in no way stored or shared with anyone outside of the instance running the script and the Tezos Toolkit's InMemorySigner. The source code is found on the `time_trigger.ts` file. There you can verify nothing harmful is done with your key).
* SECONDS_PER_TRIGGER : Seconds to pass for the swap to be triggered every time. The time starts running when the latest swap is successfully completed. Example: 3600
* TEZ_BUY_AMOUNT_PER_TRIGGER : Amount of XTZ to buy hDAO with every time the swap is triggered. Example: 3
* SLIPPAGE : The Quipuswap's slippage of the swap in percentage. If it's not big enough your swap may fail. Example: 3

## Example: 
`$ node time_trigger.js XXXXXXX 1800 10.11 3` Will buy 10.11 XTZ worth of hDAO with a slippage of 3% every half-hour.

Developed by regulr.tez. 
Reach out to me on twitter or telegram @regulrjoe if you experience any issues.

# PRICE BASED TRIGGER

Buy X amount of $XTZ worth of hDAO every time its price goees below a certain threshold.

Exit the program with CTRL+C

## Pre-requirements
Node JS https://nodejs.org/en/

## Run
Open your terminal and enter the following command.

`$ node price_trigger.js {PRIVATE_KEY} {PRICE_THRESHOLD} {TEZ_BUY_AMOUNT_PER_TRIGGER} {SLIPPAGE} {NODE_URL} [-c]`

## Arguments Explained
Required:
* PRIVATE_KEY : Your wallet's private key. For Temple Wallet you can find it under Settings -> Reveal Private Key. I don't know how to find it on Kukai. (IMPORTANT: The key is in no way stored or shared with anyone outside of the instance running the script and the Tezos Toolkit's InMemorySigner. The source code is found on the `time_trigger.ts` file. There you can verify nothing harmful is done with your key).
* PRICE_THRESHOLD : Price of hDAO in terms of XTZ. Whenever the hDAO price is equal or below to this threshold, the swap is triggered. Example: 4.201
* TEZ_BUY_AMOUNT_PER_TRIGGER : Amount of XTZ you'll use to buy hDAO every time the swap is triggered. Example: 3
* SLIPPAGE : The Quipuswap's slippage of the swap in percentage. If it's not big enough your swap may fail. Example: 3
* NODE_URL : Url of the Tezos node you want to connect to. Here's a list of nodes from TzStats: https://tzstats.com/blog/public-tezos-rpc-endpoints-at-tzstats/

Optional:
* -c : If included, the script executes the trigger continuously and never exits by itself until you quit manually with CTRL+C, otherwise the program exits after the first trigger execution.

## Example: 
`$ node price_trigger.js XXXXXXX 3.99 10.11 3` Will buy 10.11 XTZ worth of hDAO with a slippage of 3% every time the hDAO price is equal to or below 3.99 XTZ. It will trigger once and then exit.

Developed by regulr.tez. 
Reach out to me on twitter or telegram @regulrjoe if you experience any issues.