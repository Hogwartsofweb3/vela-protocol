"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSOCIATED_TOKEN_PROGRAM_ID = exports.SPL_TOKEN_PROGRAM_ID = exports.programId = void 0;
exports.getProgram = getProgram;
exports.getAggregatorStatePDA = getAggregatorStatePDA;
exports.getUserPositionPDA = getUserPositionPDA;
exports.getYieldOraclePDA = getYieldOraclePDA;
exports.getYusdcMintPDA = getYusdcMintPDA;
exports.getAssociatedTokenAddressSync = getAssociatedTokenAddressSync;
exports.getVaultUsdcAccountPDA = getVaultUsdcAccountPDA;
exports.getUserYusdcAccountPDA = getUserYusdcAccountPDA;
var anchor_1 = require("@coral-xyz/anchor");
var web3_js_1 = require("@solana/web3.js");
var idl_json_1 = __importDefault(require("./idl.json"));
var constants_1 = require("./constants");
exports.programId = new web3_js_1.PublicKey(constants_1.PROGRAM_ID);
function getProgram(provider) {
    return new anchor_1.Program(idl_json_1.default, provider);
}
function getAggregatorStatePDA() {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("aggregator_state")], exports.programId)[0];
}
function getUserPositionPDA(userPubkey) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("user_position"), userPubkey.toBuffer()], exports.programId)[0];
}
function getYieldOraclePDA() {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("yield_oracle")], exports.programId)[0];
}
function getYusdcMintPDA() {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("yusdc_mint")], exports.programId)[0];
}
// We will use standard SPL Token and Token-2022 constants
exports.SPL_TOKEN_PROGRAM_ID = new web3_js_1.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
exports.ASSOCIATED_TOKEN_PROGRAM_ID = new web3_js_1.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
function getAssociatedTokenAddressSync(mint, owner, allowOwnerOffCurve, programId, associatedTokenProgramId) {
    if (allowOwnerOffCurve === void 0) { allowOwnerOffCurve = false; }
    if (programId === void 0) { programId = exports.SPL_TOKEN_PROGRAM_ID; }
    if (associatedTokenProgramId === void 0) { associatedTokenProgramId = exports.ASSOCIATED_TOKEN_PROGRAM_ID; }
    return web3_js_1.PublicKey.findProgramAddressSync([owner.toBuffer(), programId.toBuffer(), mint.toBuffer()], associatedTokenProgramId)[0];
}
function getVaultUsdcAccountPDA(usdcMint) {
    return getAssociatedTokenAddressSync(usdcMint, getAggregatorStatePDA(), true);
}
function getUserYusdcAccountPDA(userPubkey) {
    return getAssociatedTokenAddressSync(getYusdcMintPDA(), userPubkey, false, new web3_js_1.PublicKey(constants_1.TOKEN_2022_PROGRAM_ID));
}
