import dotenv from 'dotenv';
dotenv.config()

import Web3 from 'web3';
import fs from 'fs';

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CLAIM = JSON.parse(fs.readFileSync('abis/CLAIM2.json', 'utf8'));

const API_URL   = process.env.API_URL;
const SEND_ADDR   = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const BLOCK_NUMBER = Number(process.env.BLOCK_NUMBER);
const SLEEP_SECOND = Number(process.env.SLEEP_SECOND);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(API_URL));

var contract = new web3.eth.Contract(CLAIM, CONTRACT_ADDRESS);

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
        to: CONTRACT_ADDRESS,
        data: code
    };
    var signtx = await web3.eth.accounts.signTransaction(tx, private_key);
    console.log('signed_tx=' + signtx.rawTransaction);
    const createReceipt = await web3.eth.sendSignedTransaction(signtx.rawTransaction);
    console.log(`Tx successful with hash: ${createReceipt.transactionHash}`);
    return createReceipt.transactionHash;
}

(async function main() {
    await setRecipients(SEND_ADDR, PRIVATE_KEY, "0x613bc97B55BC1E1F4cA08Ac3F7F7da1d890798a9", 10000000000000); 
})();
