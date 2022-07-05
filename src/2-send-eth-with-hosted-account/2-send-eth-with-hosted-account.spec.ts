import { Accounts, getBalance, waitForTransaction } from '../common';
import { fromWei } from 'web3-utils';
import { sendEthFromHostedAccount } from './2-send-eth-with-hosted-account';



test('Send eth from hosted account', async () => {
    const from = Accounts.hosted;
    const toAddress = Accounts.testAccount.address;

    var transactionHash = await sendEthFromHostedAccount(from.address, toAddress, 1, from.password);
    await waitForTransaction(transactionHash);

    const actualBalanace = fromWei(await getBalance(toAddress), 'ether');
    expect(actualBalanace).toBe("1");
});