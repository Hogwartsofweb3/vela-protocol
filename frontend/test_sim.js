"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var anchor_client_1 = require("./app/lib/anchor-client");
var constants_1 = require("./app/lib/constants");
var anchor = __importStar(require("@coral-xyz/anchor"));
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, walletPubkey, amount, dummyProvider, program, amountBn, usdcMint, aggregatorState, userPosition, vaultUsdcAccount, yusdcMint, userUsdcAccount, userYusdcAccount, tx, _a, yusdcAccountInfo, userPositionInfo, vaultUsdcAccountInfo, createPosIx, ix, latestBlockhash, simRes;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    connection = new web3_js_1.Connection('https://api.devnet.solana.com', "confirmed");
                    walletPubkey = new web3_js_1.PublicKey('FfS9iT3m3YmKntQ2bYn6fG515S5P3G18G21c45y5ZvQZ');
                    amount = 55;
                    dummyProvider = new anchor.AnchorProvider(connection, {}, {});
                    program = (0, anchor_client_1.getProgram)(dummyProvider);
                    amountBn = new anchor.BN(amount * 1000000);
                    usdcMint = new web3_js_1.PublicKey(constants_1.DEVNET_USDC_MINT);
                    aggregatorState = (0, anchor_client_1.getAggregatorStatePDA)();
                    userPosition = (0, anchor_client_1.getUserPositionPDA)(walletPubkey);
                    vaultUsdcAccount = (0, anchor_client_1.getVaultUsdcAccountPDA)(usdcMint);
                    yusdcMint = (0, anchor_client_1.getYusdcMintPDA)();
                    userUsdcAccount = anchor.utils.token.associatedAddress({ mint: usdcMint, owner: walletPubkey });
                    userYusdcAccount = (0, anchor_client_1.getUserYusdcAccountPDA)(walletPubkey);
                    tx = new web3_js_1.Transaction();
                    return [4 /*yield*/, Promise.all([
                            connection.getAccountInfo(userYusdcAccount),
                            connection.getAccountInfo(userPosition),
                            connection.getAccountInfo(vaultUsdcAccount)
                        ])];
                case 1:
                    _a = _b.sent(), yusdcAccountInfo = _a[0], userPositionInfo = _a[1], vaultUsdcAccountInfo = _a[2];
                    if (!vaultUsdcAccountInfo) {
                        tx.add(new anchor.web3.TransactionInstruction({
                            keys: [
                                { pubkey: walletPubkey, isSigner: true, isWritable: true },
                                { pubkey: vaultUsdcAccount, isSigner: false, isWritable: true },
                                { pubkey: aggregatorState, isSigner: false, isWritable: false },
                                { pubkey: usdcMint, isSigner: false, isWritable: false },
                                { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
                                { pubkey: anchor_client_1.SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                            ],
                            programId: anchor_client_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                            data: Buffer.from([]),
                        }));
                    }
                    if (!yusdcAccountInfo) {
                        tx.add(new anchor.web3.TransactionInstruction({
                            keys: [
                                { pubkey: walletPubkey, isSigner: true, isWritable: true },
                                { pubkey: userYusdcAccount, isSigner: false, isWritable: true },
                                { pubkey: walletPubkey, isSigner: false, isWritable: false },
                                { pubkey: yusdcMint, isSigner: false, isWritable: false },
                                { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
                                { pubkey: new web3_js_1.PublicKey(constants_1.TOKEN_2022_PROGRAM_ID), isSigner: false, isWritable: false },
                            ],
                            programId: anchor_client_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                            data: Buffer.from([]),
                        }));
                    }
                    if (!!userPositionInfo) return [3 /*break*/, 3];
                    return [4 /*yield*/, program.methods.createPosition().accounts({ user: walletPubkey, userPosition: userPosition, systemProgram: web3_js_1.SystemProgram.programId }).instruction()];
                case 2:
                    createPosIx = _b.sent();
                    tx.add(createPosIx);
                    _b.label = 3;
                case 3: return [4 /*yield*/, program.methods.deposit(amountBn).accounts({
                        user: walletPubkey,
                        aggregatorState: aggregatorState,
                        userPosition: userPosition,
                        usdcMint: usdcMint,
                        vaultUsdcAccount: vaultUsdcAccount,
                        userUsdcAccount: userUsdcAccount,
                        yusdcMint: yusdcMint,
                        userYusdcAccount: userYusdcAccount,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        tokenProgram: anchor_client_1.SPL_TOKEN_PROGRAM_ID,
                        token2022Program: new web3_js_1.PublicKey(constants_1.TOKEN_2022_PROGRAM_ID),
                        associatedTokenProgram: anchor_client_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    }).instruction()];
                case 4:
                    ix = _b.sent();
                    tx.add(ix);
                    return [4 /*yield*/, connection.getLatestBlockhash("confirmed")];
                case 5:
                    latestBlockhash = _b.sent();
                    tx.recentBlockhash = latestBlockhash.blockhash;
                    tx.feePayer = walletPubkey;
                    console.log("Simulating transaction for debugging...");
                    return [4 /*yield*/, connection.simulateTransaction(tx)];
                case 6:
                    simRes = _b.sent();
                    console.log(JSON.stringify(simRes, null, 2));
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
