import Web3 from 'web3';
import { toBN, toWei } from 'web3-utils'
import { TransactionConfig, TransactionReceipt } from 'web3-core';
import { NODE_URL } from '../config';

export async function sendEthFromLocalAccount(senderPrivateKey: string, receiverAddress: string, amount: number, senderPassword: string): Promise<TransactionReceipt> {
    const web3 = new Web3(NODE_URL);

    const sender = web3.eth.accounts.decrypt(JSON.parse(senderPrivateKey), senderPassword);

    let transaction: TransactionConfig = {
        from: sender.address,
        to: receiverAddress,
        value: toWei(toBN(amount), 'ether'),
    };

    // Set the transaction's gasLimit
    transaction.gas = await web3.eth.estimateGas(transaction);

    // Signe the transaction
    const signedTransaction = await sender.signTransaction(transaction);

    // This method directly returns the transaction's receipt
    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return receipt;
}