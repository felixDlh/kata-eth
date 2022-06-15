# Kata ethereum

## The environnement

To interact with the ethereum network we need to pay a fee for each transaction. For the sake of training we use a docker to create a dev network with provisionned accounts. Passwords can be found in [app/src/models/accounts.ts](./app/src/models/accounts.ts).

More info : https://geth.ethereum.org/docs/getting-started/dev-mode

## Connect to ethereum network

**All commands below assumes that you are in the [app](./app) folder**

In order to interact with the blockchain we need to connect to a node. We'll use **[web3](https://github.com/ChainSafe/web3.js)**.

### Installation
```
npm install web3
```

### Usage
```typescript
import Web3 from 'web3';

const web3 = new Web3('{protocol}://{host}:{port}');

// Get hosted accounts
web3.eth.getAccounts(console.log) 
```  

>Complete the `constructor` and the `GetAccounts` method of the [`EthConnector`](./app/src/services/eth-connector.ts) class.
>
>----------
>```typescript
>   public web3: Web3;
>
>    constructor(url = "http://localhost:8545") {
>        this._client = new Web3(url);
>    }
>
>    public getAccounts() {
>        return this.web3..getAccounts();
>    }
>```
>----------


## Send a transaction

To send a transaction on the network we first need an account to sign it using it's private key. When sending a transaction to the network the sender has to pay a fee proportional to the amount of computation needed to process the transaction (known as [gas](https://ethereum.org/en/developers/docs/gas) for Ethereum). 

A submitted transaction includes the following information:

* recipient: the receiving address (if an externally-owned account, the transaction will transfer value. If a contract account, the transaction will execute the contract code)
* signature: the identifier of the sender. This is generated when the sender's private key signs the transaction and confirms the sender has authorized this transaction
* value: amount of ETH to transfer from sender to recipient in WEI ( $1$ ETH = $10^9$ Wei )
* data: contract information such as the method we want to call and the arguments to pass to it
* gasLimit: the maximum amount of gas units that can be consumed by the transaction
* maxPriorityFeePerGas: the maximum amount of gas to be included as a tip to the miner
* maxFeePerGas: the maximum amount of wei willing to be paid per gas consumed (inclusive of baseFeePerGas and maxPriorityFeePerGas)


### With a hosted account

This is a common way to use accounts with local nodes. Each account returned by `web3.eth.getAccounts` has a hosted private key stored in your node. This allows you to use `sendTransaction()`.

>Complete the `sendEthFromHostedAccount` method of the [`EthConnector`](./app/src/services/eth-connector.ts) class.
>
>----------
>```typescript
>   public async sendEthFromHostedAccount(from: Account, toAddress: string, etherCount: number): Promise<string> {
>        const value = web3Utils.toBN(etherCount);
>        return this.eth.personal.sendTransaction({
>            from: from.address,
>            to: toAddress,
>            value: web3Utils.toWei(value, 'ether')
>        }, from.password);
>    }
>```
>----------

### With a local account

Unlike hosted accounts, a local account doesn't have a private key stored on the node used to connect to the network. In order to send a transaction it must first be signed before beeing sent with `web3.eth.sendSignedTransaction`.

>Complete the `sendEthFromLocalAccount` method of the [`EthConnector`](./app/src/services/eth-connector.ts) class.
>
>----------
>```typescript
>   public async sendEthFromLocalAccount(from: Account, toAddress: string, etherCount: number): Promise<string> {
>        const value = web3Utils.toBN(etherCount);
>                
>        const sender = this.web3.eth.accounts.decrypt(JSON.parse(from.privateKey), from.password)
>        let tx: TransactionConfig = {
>            from: sender.address,
>            to: toAddress,           
>            value: web3Utils.toWei(value, 'ether'),
>        }
>        tx.gas = await this.web3.eth.estimateGas(tx);
>        const transaction = await sender.signTransaction(tx)
>
>        return (await this.web3.eth.sendSignedTransaction(transaction.rawTransaction)).transactionHash;
>    }
>```
>----------

## Smart contracts

Smart contract are "programs" deployed on the network that can be run by calling there methdods.
To create a contract we first need to write one in a supported [language](https://ethereum.org/en/developers/docs/smart-contracts/languages/). 

As an example, [poll.sol](./app/src/contracts/poll.sol) is a contract written in [`Solidity`](https://docs.soliditylang.org/en/latest/index.html).

### Compiling a contract

Once a contract is written we need to compile it. To do that we'll use [`solc-js`](https://github.com/ethereum/solc-js)

```console
npm install --save-dev solc-js
npx solc --base-path <basePath> --output-dir <outputDir> --bin --abi <path/to/contract>
```

The compilation generate two files :
*  `contract.bin` is a binary representaion of the contract undetable by the EVM
*  `contract.abi` is a JSON file that describes the deployed contract and its smart contract functions. It will be read by client librairies to call the contract 


>Compile the contract [poll.sol](./app/src/contracts/poll.sol) and rename the bin output as `Poll.bin` and the abi as `Poll.abi`
>
>----------
>```console
> # In the console
>npx solc --output-dir src/contracts/build  --bin --abi src/contracts/poll.sol
>```
>----------

### Deploying a contract

A contract deloyment is a special kind of transaction. This transation doesn't have a "receiver" address neither a value. Instead it has a fields data containing the contract's bytecode, the constructor identifier and the values to pass as arguments.

>Complete the `createPoll` method of the [`EthConnector`](./app/src/services/eth-connector.ts) class.
>
>----------
>```typescript
>public async createPoll(from: Account, Poll: Poll): Promise<string> {
>        const byteCode = `0x${bin}`;
>
>        // All arguments must be encoded as hexadecimal values
>        // ["Question",["First choice","Second choice"]] becomes [ '0x5175657374696f6e', [ '0x46697273742063686f696365', 0x5365636f6e642063686f696365' ]]
>        const args = [web3Utils.stringToHex(Poll.question), Poll.proposals.map(proposal => web3Utils.stringToHex(proposal.name))];
>        
>       // Create the deploy operation
>        var contract = new this.web3.eth.Contract(abi).deploy({data:byteCode,arguments:args})
>
>        const tx: TransactionConfig = {
>            // The encoded deploy operation
>            data: contract.encodeABI(),
>        }
>        let receipt: TransactionReceipt;
>        
>        // for local accounts
>        if (from.privateKey != undefined) {
>            const sender = this.web3.eth.accounts.decrypt(JSON.parse(from.privateKey), from.password);
>            tx.gas = await this.web3.eth.estimateGas(tx);
>            const transaction = await sender.signTransaction(tx);
>            receipt = await this.web3.eth.sendSignedTransaction(transaction.rawTransaction);
>            return receipt.contractAddress;
>        }
>        // for hosted accounts
>        else {
>            var transactionHash = await this.web3.eth.personal.sendTransaction(tx, from.password);
>            receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
>        }
>        return receipt.contractAddress
>    }
>```
>----------

### Interact with a contract



### Event

## Advanced contract scenarios

### Contract storage

### Extend your firs contract