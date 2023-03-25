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

let tokenAddress = "0x912CE59144191C1204E64559FE8253a0e49E6548";
let toAddress = "0xc781d0832dad38547e98f76cc2223696ddfba162";

//let decimals = web3.toBigNumber(18);
//let amount = web3.toBigNumber(100);
//let amount = web3.toBigNumber(0.1);

let minABI = [
 // transfer
  {
     "constant": false,
     "inputs": [
             {
              "name": "_to",
                 "type": "address"
              },
        {
                   "name": "_value",
                "type": "uint256"
        }
      ],
               "name": "transfer",
               "outputs": [
                   {
                       "name": "",
                      "type": "bool"
                         }
                 ],
                   "type": "function"
             }
    ];

var contract = new web3.eth.Contract(minABI, tokenAddress);

async function claim(owner, private_key) {
    //let chainId  = await web3.eth.getChainId();
    //let nonce    = await web3.eth.getTransactionCount(owner);
    //let nonce    = Number(process.argv[2]);
    let nonce    = 200;
    //let nonce    = await web3.eth.getTransactionCount(owner);
    //console.log(nonce);
    //let value = amount.times(web3.toBigNumber(10).pow(decimals));
	//      123456789012345678
    let value = "2749900000000000000000";
    let method   = contract.methods.transfer(toAddress, value);
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
        to: tokenAddress,
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
	console.log(n, BLOCK_NUMBER);
        if (n >= BLOCK_NUMBER) {
	    try {
                await claim(SEND_ADDR, PRIVATE_KEY);
                process.exit(0);
	    } catch (e) {
		console.log(e);
	    }
	} else {
	    console.log("wait.." + n);
	}
        await _sleep(SLEEP_SECOND);
    }
})();
