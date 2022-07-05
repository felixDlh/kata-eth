import Web3 from 'web3';
import { hexToString, stringToHex } from 'web3-utils';
import { NODE_URL } from '../config';
import { TransactionConfig } from 'web3-core';

const storageAbi = JSON.parse(require('../contracts/build/storage.abi'));


export async function getValue(contractAddress: string, callerAddress: string): Promise<string> {
    const web3 = new Web3(NODE_URL);
    const contract = new web3.eth.Contract(storageAbi, contractAddress);
    const hexValue = await contract.methods.value().call({ from: callerAddress });
    return hexToString(hexValue);
}

export async function getLastModificationDate(contractAddress: string, callerAddress: string): Promise<string>{
    const web3 = new Web3(NODE_URL);
    const contract = new web3.eth.Contract(storageAbi, contractAddress);
    const value = await contract.methods.lastModificationDate().call({ from: callerAddress });
    return value;
}

export async function setValue(value: string, contractAddress: string, senderAddress: string, password: string): Promise<string> {
    const web3 = new Web3(NODE_URL);
    const contract = new web3.eth.Contract(storageAbi, contractAddress);
    const methodInfo = contract.methods.setValue(stringToHex(value));
    const transaction: TransactionConfig = {
        from: senderAddress,
        to: contractAddress,
        data: contract.methods.setValue(stringToHex(value)).encodeABI(),
    };
    return await web3.eth.personal.sendTransaction(transaction, password);
}