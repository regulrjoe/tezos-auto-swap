"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var taquito_1 = require("@taquito/taquito");
var signer_1 = require("@taquito/signer");
var sdk_1 = require("@quipuswap/sdk");
var bignumber_js_1 = require("bignumber.js");
// Returns:
// Value bought if swap is successful,
// -1 otherwise.
// -----------------------------------------
function doSwap(token, tokenAddress, tokenId, decimals, amount, slippage, tezToToken, tezos) {
    return __awaiter(this, void 0, void 0, function () {
        var factories, fromAsset, toAsset, fromDecimals, toDecimals, from, to, inputValue, slippageTolerance, swapParams, op, dex, dexStorage, valueBought, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    factories = {
                        fa1_2Factory: "KT1WkKiDSsDttdWrfZgcQ6Z9e3Cp4unHP2CP",
                        fa2Factory: "KT1SwH9P1Tx8a58Mm6qBExQFTcy2rwZyZiXS"
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 13, , 14]);
                    if (tezToToken) {
                        fromAsset = "tez";
                        toAsset = { contract: tokenAddress, id: tokenId };
                        fromDecimals = 6;
                        toDecimals = decimals;
                        from = "XTZ";
                        to = token;
                    }
                    else {
                        fromAsset = { contract: tokenAddress, id: tokenId };
                        toAsset = "tez";
                        fromDecimals = decimals;
                        toDecimals = 6;
                        from = token;
                        to = "XTZ";
                    }
                    console.info("Swapping " + from + " for " + to);
                    inputValue = amount;
                    slippageTolerance = slippage;
                    return [4 /*yield*/, sdk_1.swap(tezos, factories, fromAsset, toAsset, inputValue, slippageTolerance)];
                case 2:
                    swapParams = _a.sent();
                    return [4 /*yield*/, sdk_1.batchify(tezos.wallet.batch([]), swapParams).send()];
                case 3:
                    op = _a.sent();
                    console.info("Transaction: https://tzkt.io/" + op.opHash);
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 10, , 11]);
                    if (!tezToToken) return [3 /*break*/, 6];
                    return [4 /*yield*/, sdk_1.findDex(tezos, factories, toAsset)];
                case 5:
                    dex = _a.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, sdk_1.findDex(tezos, factories, fromAsset)];
                case 7:
                    dex = _a.sent();
                    _a.label = 8;
                case 8: return [4 /*yield*/, dex.storage()];
                case 9:
                    dexStorage = _a.sent();
                    valueBought = new bignumber_js_1["default"](-1);
                    if (tezToToken) {
                        valueBought = sdk_1.estimateTokenInTez(dexStorage, amount);
                    }
                    else {
                        valueBought = sdk_1.estimateTezInToken(dexStorage, amount);
                    }
                    return [3 /*break*/, 11];
                case 10:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 11];
                case 11: return [4 /*yield*/, op.confirmation()];
                case 12:
                    _a.sent();
                    console.info("Swapped " + amount.toNumber() / Math.pow(10, fromDecimals) + " $" + from + " for " + valueBought.toNumber() / Math.pow(10, toDecimals) + " $" + to + " at " + (valueBought.toNumber() / Math.pow(10, toDecimals)) / (amount.toNumber() / Math.pow(10, fromDecimals)) + " " + from + "/" + to);
                    return [2 /*return*/, valueBought];
                case 13:
                    err_2 = _a.sent();
                    console.error(err_2);
                    return [2 /*return*/, new bignumber_js_1["default"](-1)];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
// -----------------------------------------
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, privateKey, secondsPerBuy, tezBuyAmountPerTrigger, slippage, token, tokenContract, tokenId, tokenDecimals, nodeUrl, slippageDec, tezos, account, hdaoBought, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // -------------------- Arguments
                    console.log("Usage:\tnode price_based_trigger.js {PRIVATE_KEY} {SECONDS_PER_TRIGGER} {TEZ_BUY_AMOUNT_PER_TRIGGER} {SLIPPAGE}");
                    console.log("Exit with CTRL+C");
                    args = process.argv;
                    privateKey = new String(args[2]);
                    secondsPerBuy = new Number(args[3]);
                    tezBuyAmountPerTrigger = new Number(args[4]);
                    slippage = new Number(args[5]);
                    token = "hDAO";
                    tokenContract = "KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW";
                    tokenId = 0;
                    tokenDecimals = 6;
                    nodeUrl = "https://rpc.tzbeta.net/";
                    slippageDec = slippage.valueOf() / 100;
                    console.log("--------------------------------");
                    console.log("nodeUrl: " + nodeUrl);
                    console.log("Token to buy: $" + token + " (" + tokenContract + ":" + tokenId + ")");
                    console.log("Seconds per buy: " + secondsPerBuy);
                    console.log("Slippage: " + slippage + "%");
                    console.log("You will Buy " + tezBuyAmountPerTrigger + " $XTZ worth of $" + token + " every " + secondsPerBuy + " seconds, with a slippage of " + slippage + "%");
                    console.log("--------------------------------");
                    tezos = new taquito_1.TezosToolkit(nodeUrl);
                    // -------------------- Sign into account
                    console.log("--------------------------------");
                    console.log("Signing into Account...");
                    return [4 /*yield*/, signer_1.InMemorySigner.fromSecretKey(privateKey.toString())
                            .then(function (theSigner) {
                            tezos.setProvider({ signer: theSigner });
                            return tezos.signer.publicKeyHash();
                        })
                            .then(function (publicKeyHash) {
                            console.log("Account: " + publicKeyHash + ".");
                        })["catch"](function (error) {
                            console.log("Error: " + error + " " + JSON.stringify(error, null, 2));
                            process.exit(1);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, tezos.wallet.pkh()];
                case 2:
                    account = _a.sent();
                    console.log("--------------------------------");
                    console.log('Starting Auto Buyer');
                    _a.label = 3;
                case 3:
                    if (!true) return [3 /*break*/, 10];
                    hdaoBought = new bignumber_js_1["default"](-1);
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, doSwap(token.toString(), tokenContract.toString(), tokenId.valueOf(), tokenDecimals, new bignumber_js_1["default"](tezBuyAmountPerTrigger.valueOf() * (Math.pow(10, 6))), slippageDec, true, tezos)];
                case 5:
                    hdaoBought = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error(error_1);
                    console.error("Something went wrong doing the swap. Check that you have sufficient XTZ funds or try increasing the slippage. Retrying...");
                    return [3 /*break*/, 7];
                case 7:
                    if (hdaoBought.toNumber() <= 0) return [3 /*break*/, 4];
                    _a.label = 8;
                case 8: return [4 /*yield*/, sleep(secondsPerBuy.valueOf() * 1000)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 10: return [2 /*return*/];
            }
        });
    });
}
main();