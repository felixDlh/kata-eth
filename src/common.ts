import Web3 from "web3";
import { NODE_URL } from "./config";

export interface Account {
    address: string;
    password?: string;
    balance?: string;
    privateKey?: string;
}

export const Accounts = {
    hosted: {
        address: "0x7FE0D8a98Cd20Fb1ae1c9e81787a5348b729c44d",
        password: "password",
    } as Account,
    local: {
        address: "",
        password: "password",
        privateKey: '{"address":"f80ec881c6e3d5262bf83247582f675b58bfbfd1","crypto":{"cipher":"aes-128-ctr","ciphertext":"89935b3af51b5a522f21b7a1f7be6d9b6bb459710376547523f0b05d74f19647","cipherparams":{"iv":"fc66c60771253ce6e9eeedd0b9009bcf"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"3cdecb96535535fd9d74ac38441aafc91269262919d066377140d5ad3f2f14a8"},"mac":"0f1253b76cf0f5d47b3f188fbae77756ebf0e2778a415184305b886c2ee2f514"},"id":"add98203-0f0e-4c12-955c-cc9d480c028f","version":3}'
    } as Account,
    get testAccount() { return new Web3(NODE_URL).eth.accounts.create() },
    get all() { return [this.hosted, this.local, this.testAccount] }
}

export async function waitForTransaction(transactionHash: string) {
    const web3 = new Web3(NODE_URL);
    let receipt; 
    do {
        receipt = await web3.eth.getTransactionReceipt(transactionHash);
    } while (receipt == null)
}

export async function getBalance(address: string) {
    const web3 = new Web3(NODE_URL);
    return await web3.eth.getBalance(address);
}

