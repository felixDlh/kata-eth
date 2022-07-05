import { Account, Accounts, waitForTransaction } from '../common';
import { deployStorageWithHostedAccount } from '../4-deploy-storage/4-deploy-storage';
import { getLastModificationDate, getValue, setValue } from './5-use-storage';

let contractAddress;
const initialValue = "Initial value";
let contractOwner: Account;

describe("5-use-storage", () => {

    beforeAll(async () => {
        contractOwner = Accounts.hosted
        contractAddress = await deployStorageWithHostedAccount(initialValue, contractOwner.address, contractOwner.password);
    })

    test('Can retreive stored value', async () => {
        const value = await getValue(contractAddress, contractOwner.address);

        expect(value).toBe(initialValue);
    });

    test('Can retreive modificationdate value', async () => {
        const value = await getLastModificationDate(contractAddress, contractOwner.address);

        expect(value).toBeDefined();
    });

    test('Can update value', async () => {
        const newValue = "New value";

        var transactionHash = await setValue(newValue, contractAddress, contractOwner.address, contractOwner.password);
        waitForTransaction(transactionHash);

        const storedValue = await getValue(contractAddress, contractOwner.address);
        expect(storedValue).toBe(newValue);
    });
});