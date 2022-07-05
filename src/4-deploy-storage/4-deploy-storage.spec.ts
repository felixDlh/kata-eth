import { Accounts } from "../common";
import { deployStorageWithHostedAccount, deployStorageWithLocalAccount } from "./4-deploy-storage";
import { isAddress } from "web3-utils";

test('Deploy storage with hosted account', async () => {
    const from = Accounts.hosted;

    const contractAddress = await deployStorageWithHostedAccount("Hello world", from.address, from.password);

    expect(isAddress(contractAddress)).toBe(true)
});

test('Deploy storage with local account', async () => {
    const from = Accounts.local;

    const contractAddress = await deployStorageWithLocalAccount("Hello world", from.privateKey, from.password);

    expect(isAddress(contractAddress)).toBe(true)
});