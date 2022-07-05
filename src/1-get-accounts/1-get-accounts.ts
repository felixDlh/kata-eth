import Web3 from 'web3';
import { NODE_URL } from '../config';

export async function getAccounts() : Promise<string[]> {
    const web3 = new Web3(NODE_URL);
    return await web3.eth.getAccounts();
}
