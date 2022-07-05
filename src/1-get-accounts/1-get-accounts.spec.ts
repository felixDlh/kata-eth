import { Accounts } from '../common';
import { getAccounts } from './1-get-accounts';

test('Retreive accounts', async () => {
    var accounts = await getAccounts();
    expect(accounts).toContain(Accounts.hosted.address);
  });