import Web3 from 'web3';
import { toBN, toWei } from 'web3-utils'
import { TransactionConfig } from 'web3-core'
import { NODE_URL } from '../config';

export async function sendEthFromHostedAccount(senderAddress: string, receiverAddress: string, amount: number, senderPassword: string): Promise<string> {
    const amountInWei = toWei(toBN(amount), 'ether');
    const web3 = new Web3(NODE_URL);
    const transaction: TransactionConfig = {
        from: senderAddress,
        to: receiverAddress,
        value: amountInWei
    };
    const transactionHash = await web3.eth.personal.sendTransaction(transaction, senderPassword);
    return transactionHash;
}