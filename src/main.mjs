import dotenv from 'dotenv';
dotenv.config()

import Web3 from 'web3';
import fs from 'fs';

const CLAIM = JSON.parse(fs.readFileSync('abis/CLAIM.json', 'utf8'));

const API_URL   = process.env.API_URL;
const SEND_ADDR   = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(API_URL));
// ERC20 0x412a0018A6A529250d82596C29019a1876031ced
var contract = new web3.eth.Contract(CLAIM, "0x320bD48487d3fc335B2E74fa6fF2816E2f2c0C57");

async function claim(owner, private_key) {
    let chainId  = await web3.eth.getChainId();
    let nonce    = await web3.eth.getTransactionCount(owner);
    console.log("aiueo1");
    let method   = contract.methods.claim();
    console.log("aiueo2");
    let code     = await method.encodeABI();
    console.log("aiueo3");
    //let gas      = await method.estimateGas({from: owner});
    let gas      = await method.estimateGas({from: owner});
    console.log("aiueo4");
    let gasPrice = await web3.eth.getGasPrice();
    console.log("aiueo5");
    const tx = {
        gas: gas + 50000,
        gasPrice: gasPrice,
        nonce: nonce,
        chainId: chainId,
        to: owner,
        data: code
    };
    var signtx = await web3.eth.accounts.signTransaction(tx, private_key);
    console.log('signed_tx=' + signtx.rawTransaction);
    const createReceipt = await web3.eth.sendSignedTransaction(signtx.rawTransaction);
    console.log(`Tx successful with hash: ${createReceipt.transactionHash}`);
    return createReceipt.transactionHash;
}

async function setRecipients(owner, private_key, address, amount) {
    let chainId  = await web3.eth.getChainId();
    let nonce    = await web3.eth.getTransactionCount(owner);
    let method   = contract.methods.setRecipients(address, amount);
    let code     = await method.encodeABI();
    let gas      = await method.estimateGas({from: owner});
    let gasPrice = await web3.eth.getGasPrice();
    const tx = {
        gas: gas + 50000,
        gasPrice: gasPrice,
        nonce: nonce,
        chainId: chainId,
        to: owner,
        data: code
    };
    var signtx = await web3.eth.accounts.signTransaction(tx, private_key);
    console.log('signed_tx=' + signtx.rawTransaction);
    const createReceipt = await web3.eth.sendSignedTransaction(signtx.rawTransaction);
    console.log(`Tx successful with hash: ${createReceipt.transactionHash}`);
    return createReceipt.transactionHash;
}
async function claimableTokens(address) {
    let value = contract.claimableTokens.call(address);
    console.log(value);
}

async function main() {
    await claim(SEND_ADDR, PRIVATE_KEY); 
    //await setRecipients(SEND_ADDR, PRIVATE_KEY, "0x613bc97B55BC1E1F4cA08Ac3F7F7da1d890798a9", 100); 
    //await claimableTokens("0x613bc97B55BC1E1F4cA08Ac3F7F7da1d890798a9"); 
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});
