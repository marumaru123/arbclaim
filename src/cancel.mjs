import dotenv from 'dotenv';
dotenv.config()

import Web3 from 'web3';

const API_URL     = process.env.API_URL;
const SEND_ADDR   = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN_ID    = Number(process.env.CHAIN_ID); 

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(API_URL));

async function cancel(owner, private_key) {
    let nonce    = process.argv[2];
    const maxFeePerGas = process.argv[3];
    const tx = {
        to: owner,
        value: 0,
        gas: 21000,
        maxFeePerGas: maxFeePerGas,
        nonce: nonce,
        chainId: CHAIN_ID
    };
    var signtx = await web3.eth.accounts.signTransaction(tx, private_key);
    console.log('signed_tx=' + signtx.rawTransaction);
    const createReceipt = await web3.eth.sendSignedTransaction(signtx.rawTransaction);
    console.log(`Tx successful with hash: ${createReceipt.transactionHash}`);
    return createReceipt.transactionHash;
}

(async function main() {
    await cancel(SEND_ADDR, PRIVATE_KEY); 
})();
