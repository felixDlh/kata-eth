# Kata ethereum

## The environnement

To interact with the ethereum network we need to pay a fee for each transaction. For the sake of training we use a docker to create a dev network with provisionned accounts. Passwords can be found in [src/accounts.ts](./src/accounts.ts).

More info : https://geth.ethereum.org/docs/getting-started/dev-mode

An explorer is exposed on http://localhost:4000

## Connect to ethereum network

**All commands below assumes that you are in the root folder**

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

The `protocol` parameter can be either :
- **ws** (websocket): more prone to network errors
- **http**: easiest to use but does not support event subscriptions
- **ipc** (inter process communication): this protocol is the most secure of all three but the node and the client must be running

> Complete the file [1-get-accounts.ts](./src/1-get-accounts/1-get-accounts.ts)

```typescript
import Web3 from 'web3';
import { NODE_URL } from '../config';

export async function getAccounts() : Promise<string[]> {
    const web3 = new Web3(NODE_URL);
    return await web3.eth.getAccounts();
}
```

## Send a transaction

To send a transaction on the network we first need an account to sign it using it's private key. When sending a transaction to the network the sender has to pay a fee proportional to the amount of computation needed to process the transaction (known as [gas](https://ethereum.org/en/developers/docs/gas) for Ethereum). 

A submitted transaction includes the following information:

* `recipient`: the receiving address (if an externally-owned account, the transaction will transfer value. If a contract account, the transaction will execute the contract code)
* `signature`: the identifier of the sender. This is generated when the sender's private key signs the transaction and confirms the sender has authorized this transaction
* `value`: amount of ETH to transfer from sender to recipient (**in wei**) ( $1$ ETH = $10^9$ Wei )
* `data`: contract information such as the method we want to call and the arguments to pass to it
* `gasLimit`: the maximum amount of gas units that can be consumed by the transaction
* `maxPriorityFeePerGas`: the maximum amount of gas to be included as a tip to the miner
* `maxFeePerGas`: the maximum amount of wei willing to be paid per gas consumed (inclusive of baseFeePerGas and maxPriorityFeePerGas)

The most basic transtion is the transfer of ether

#### With a hosted account

This is a common way to use accounts with local nodes. Each account returned by `web3.eth.getAccounts` has a hosted private key stored in your node. This allows you to use `wbe3.eth.personal.sendTransaction()`. The transaction will automaticly be signed by the node bedore submission. 

**Never use hosted accounts if you are not working with a local node** 

> Complete the file [2-send-eth-with-hosted-account.ts](./src/2-send-eth-with-hosted-account/2-send-eth-with-hosted-account.ts)

```typescript
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
```

The `sendTransaction` method return the transaction's hash. This hash can be used to get the transaction's receipt that record the transaction's outcome:

```typescript
import Web3 from 'web3';

export async function getTransactionReceipt(transactionHash: string){
    const web3 = new Web3("http://eth-node:8545");
    const receipt = await web3.eth.getTransactionReceipt(transactionHash)
    return receipt;
}
```

#### With a local account

Unlike hosted accounts, local accounts don't have their private keys stored on a node. In order to send a transaction it must first be signed before beeing sent with `sendRawTransaction` (or sendSignedTransaction with `web3`).

> Complete the file [3-send-eth-with-local-account.ts](./src/3-send-eth-with-local-account/3-send-eth-with-local-account.ts)

```typescript
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
```

## Smart contracts

Smart contract are "programs" deployed on the network that can be run by calling there methdods.
To create a contract we first need to write one in a supported [language](https://ethereum.org/en/developers/docs/smart-contracts/languages/). 

As an example, [poll.sol](./app/src/contracts/poll.sol) is a contract written in [`Solidity`](https://docs.soliditylang.org/en/latest/index.html).

### Writing a contract

Create a new file named `storage.sol` in the [contracts](./src/contracts) directory

Add the followin code 
```solidity
pragma solidity >=0.8.0;

contract Adoption {

}
```
#### Variables setup

Add the following variable on the next line after `contract Storage {`

```solidity
bytes32 public value;
// Date are stored as seconds since UNIX ep1021195
uint256 public lastModificationDate;
address public owner;
```

#### Add a contructor

Add the following contructor after the variables declarations

```solidity
constructor(bytes32 value_) {
    value = value_;
    owner = msg.sender;
    lastModificationDate = block.timestamp;
}
```
`msg` is a special variable containing all the trnasaction informations.

`block` is a special variable refering to the block the transaction is included into.

#### First function: updating the value

Add the following function to the smart contract after the constructor

```solidity
function setValue(bytes32 value_) public {
    require(msg.sender == owner, "Only the contract owner can update the stored value");
    value = value_;
    lastModificationDate = block.timestamp;
}
```

`require` is a solidity fonction that will retunrn an error if the condition isn't met.

#### Second and third function: retreiving the value

Add the following function to the smart contract after the first function

```solidity
function getValue() public view returns(bytes32 value_ ) {
    return value;
}

function getAll() public view returns(bytes32 value_, uint256 lastModificationDate_ ) {
    return (getValue() ,lastModificationDate);
}
```
The `view` modifier indicate that this method doesn't modify the state of the contract. Therefore no transaction will be created when calling this function.

### Compiling the contract

Once a contract is written we need to compile it. To do that we'll use [`solc`](https://github.com/ethereum/solc-js)

The compilation generate two files :
*  A `.bin` file which is a binary representaion of the contract undetable by the EVM
*  A `.abi` file which is a JSON file that describes the deployed contract and its smart contract functions. It will be read by client librairies to call the contract 


> Compile the contract [storage.sol](./src/contracts/storage.sol) and rename the bin output as `storage.bin` and the abi as `storage.abi`

```console
npm install --save-dev solc
npx solc --output-dir src/contracts/build  --bin --abi src/contracts/storage.sol
```

### Deploying a contract

A contract deloyment is a special kind of transaction. This transation doesn't have a "receiver" address neither a value. Instead it has a fields data containing the contract's bytecode, the constructor identifier and the values to pass as arguments.

> Complete the file [4-deploy-storage.ts](./src/4-deploy-storage/4-deploy-storage.ts)

```typescript
import Web3 from 'web3';
import { stringToHex } from 'web3-utils'
import { TransactionConfig } from 'web3-core';
import { NODE_URL } from '../config';
const storageBinary = require('../contracts/build/storage.bin');
const storageAbi = JSON.parse(require('../contracts/build/storage.abi'));

export async function deployStorageWithLocalAccount(valueToStore: string, senderPrivatekey: string, password: string): Promise<string> {
    const web3 = new Web3(NODE_URL)
    const byteCode = `0x${storageBinary}`;
    // All arguments must be encoded as hexadecimal values
    const args = [stringToHex(valueToStore)];

    // Create the deploy operation
    var contract = new web3.eth.Contract(storageAbi).deploy({ data: byteCode, arguments: args })
    const sender = web3.eth.accounts.decrypt(JSON.parse(senderPrivatekey), password);

    const tx: TransactionConfig = {
        from: sender.address,
        // The encoded deploy operation
        data: contract.encodeABI(),
    }

    tx.gas = await web3.eth.estimateGas(tx);

    const transaction = await sender.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(transaction.rawTransaction);
    return receipt.contractAddress;
}

export async function deployStorageWithHostedAccount(valueToStore: string, senderAddress: string, password: string): Promise<string> {
    const web3 = new Web3(NODE_URL)
    const byteCode = `0x${storageBinary}`;
    // All arguments must be encoded as hexadecimal values
    const args = [stringToHex(valueToStore)];

    // Create the deploy operation
    var contract = new web3.eth.Contract(storageAbi).deploy({ data: byteCode, arguments: args })

    const tx: TransactionConfig = {
        // The encoded deploy operation
        data: contract.encodeABI(),
        from: senderAddress
    }

    var transactionHash = await web3.eth.personal.sendTransaction(tx, password);
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    return receipt.contractAddress
}
```

### Interact with the contract

Once the contract is created we can acces its properties and methods.

#### Retreiving values

Calling a contract property or a function marked as `view` doesn't alter the contract state. Therefore no transaction is created when calling these.

With `web3` this is done with `contract.methods.<methodOrProperty>().call()`

> Complete the methods `getValue` and `getLastModificationDate` in [5-use-storage.ts](./src/5-use-storage/5-use-storage.ts)

```typescript
import Web3 from 'web3';
import { hexToString, stringToHex } from 'web3-utils';
import { NODE_URL } from '../config';
import { TransactionConfig } from 'web3-core';

const storageAbi = JSON.parse(require('../contracts/build/storage.abi'));


export async function getValue(contractAddress: string, callerAddress: string): Promise<string> {
    const web3 = new Web3(NODE_URL);
    const contract = new web3.eth.Contract(storageAbi, contractAddress);
    const hexValue = await contract.methods.value().call({ from: callerAddress });
    return hexToString(hexValue);
}

export async function getLastModificationDate(contractAddress: string, callerAddress: string): Promise<string>{
    const web3 = new Web3(NODE_URL);
    const contract = new web3.eth.Contract(storageAbi, contractAddress);
    const value = await contract.methods.lastModificationDate().call({ from: callerAddress });
    return value;
}
```

#### Updating value

To update a the state of contract we need to send a transaction to the contract with the informations about the method we want to call and the parameters to pass.

> Complete the method `setValue` in [5-use-storage.ts](./src/5-use-storage/5-use-storage.ts)

```typescript
export async function setValue(contractAddress: string, callerAddress: string): Promise<string> {
   const web3 = new Web3(NODE_URL);
    const contract = new web3.eth.Contract(storageAbi, contractAddress);
    const methodInfo = contract.methods.setValue(stringToHex(value));
    const transaction: TransactionConfig = {
        from: callerAddress,
        to: contractAddress,
        data: methodInfo.encodeABI(),
    };
    return await web3.eth.personal.sendTransaction(transaction, password);
}
```