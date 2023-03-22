import dotenv from 'dotenv';
dotenv.config()

import Web3 from 'web3';
import fs from 'fs';

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CLAIM = JSON.parse(fs.readFileSync('abis/CLAIM.json', 'utf8'));

const API_URL   = process.env.API_URL;
const SEND_ADDR   = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const BLOCK_NUMBER = Number(process.env.BLOCK_NUMBER);
const SLEEP_SECOND = Number(process.env.SLEEP_SECOND);
const CHAIN_ID     = process.env.CHAIN_ID;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(API_URL));

var contract = new web3.eth.Contract(CLAIM, CONTRACT_ADDRESS);

async function claim(owner, private_key) {
    //let chainId  = await web3.eth.getChainId();
    //let nonce    = await web3.eth.getTransactionCount(owner);
    let nonce    = Number(process.argv[2]);
    let method   = contract.methods.claim();
    let code     = await method.encodeABI();
    let gas      = await method.estimateGas({from: owner});
    let gasPrice = await web3.eth.getGasPrice();
    //let tip      = await web3.eth.getMaxPriorityFeePerGas();
    //let block    = await web3.eth.getBlock("pending");
    //const baseFee = Number(block.baseFeePerGas);
    //const max     = Number(tip) + baseFee - 1;
    const tx = {
        gas: gas + 50000,
        gasPrice: gasPrice,
	//maxPriorityFeePerGas: Number(tip),
	//maxFeePerGas: max,
        nonce: nonce,
        chainId: CHAIN_ID,
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
    while(true) {
        let n = await web3.eth.getBlockNumber()
        if (n >= BLOCK_NUMBER) {
            await claim(SEND_ADDR, PRIVATE_KEY); 
            process.exit(0);
	} else {
	    console.log("wait.." + n);
	}
        await _sleep(SLEEP_SECOND);
    }
})();
