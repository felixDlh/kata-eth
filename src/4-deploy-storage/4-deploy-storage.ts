import Web3 from 'web3';
import { stringToHex } from 'web3-utils'
import { TransactionConfig } from 'web3-core';
import { NODE_URL } from '../config';
const storageBinary = require('../contracts/build/storage.bin');
const storageAbi = JSON.parse(require('../contracts/build/storage.abi'));

export async function deployStorageWithLocalAccount(valueToStore: string, senderPrivatekey: string, password: string): Promise<string> {
    const web3 = new Web3(NODE_URL)
    const byteCode = `0x${storageBinary}`;
    // All arguments must be encoded as hexadecimal values
    const args = [stringToHex(valueToStore)];

    // Create the deploy operation
    var contract = new web3.eth.Contract(storageAbi).deploy({ data: byteCode, arguments: args })
    const sender = web3.eth.accounts.decrypt(JSON.parse(senderPrivatekey), password);

    const tx: TransactionConfig = {
        from: sender.address,
        // The encoded deploy operation
        data: contract.encodeABI(),
    }

    tx.gas = await web3.eth.estimateGas(tx);

    const transaction = await sender.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(transaction.rawTransaction);
    return receipt.contractAddress;
}

export async function deployStorageWithHostedAccount(valueToStore: string, senderAddress: string, password: string): Promise<string> {
    const web3 = new Web3(NODE_URL)
    const byteCode = `0x${storageBinary}`;

    const args = [stringToHex(valueToStore)];

    // Create the deploy operation
    var contract = new web3.eth.Contract(storageAbi).deploy({ data: byteCode, arguments: args })

    const tx: TransactionConfig = {
        // The encoded deploy operation
        data: contract.encodeABI(),
        from: senderAddress
    }

    var transactionHash = await web3.eth.personal.sendTransaction(tx, password);
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    return receipt.contractAddress
}