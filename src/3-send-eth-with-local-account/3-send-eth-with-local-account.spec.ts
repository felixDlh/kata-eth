import { fromWei } from 'web3-utils'

import { Accounts, getBalance, waitForTransaction } from '../common';
import { sendEthFromLocalAccount } from './3-send-eth-with-local-account';


test('Send eth from local account', async () => {
    const from = Accounts.local;
    const toAddress = Accounts.testAccount.address;

    var receipt = await sendEthFromLocalAccount(from.privateKey, toAddress, 1, from.password);
    await waitForTransaction(receipt.transactionHash);

    const actualBalanace = fromWei(await getBalance(toAddress), 'ether');
    expect(actualBalanace).toBe("1");
});