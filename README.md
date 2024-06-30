# Pragyan's ATM DApp

This repository contains the smart contract and frontend code for a simple decentralized ATM application built on the Ethereum blockchain. The smart contract, written in Solidity, handles basic ATM operations like deposits, withdrawals, and ownership transfer. The frontend, developed with React and ethers.js, allows users to interact with the contract through MetaMask.

## Table of Contents

- [Pragyan's ATM DApp](#pragyans-atm-dapp)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Smart Contract](#smart-contract)
  - [Frontend](#frontend)
  - [Usage](#usage)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

## Features

- Deposit Ether into the ATM
- Withdraw Ether from the ATM
- Transfer ownership of the ATM contract
- Reset, increase, or decrease the ATM balance
- Display current balance and contract owner

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js and npm
- MetaMask extension for your browser
- An Ethereum development environment (e.g., Hardhat, Ganache)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MetacrafterChris/SCM-Starter
   ```
2. Deploy the smart contract:
   - Configure your Ethereum development environment (e.g., Hardhat or Truffle).
   - Deploy `Assessment.sol` and note the contract address.

3. Update the frontend with the contract address and ABI:
   - Replace the `contractAddress` in `index.js` with your deployed contract address.
   - Ensure `atm_abi.json` is correctly placed in the `artifacts/contracts/Assessment.sol/` directory.

## Smart Contract

The smart contract `Assessment.sol` handles the ATM operations. Here's a brief overview:

### Assessment.sol

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event BalanceReset(uint256 newBalance);
    event BalanceIncreased(uint256 amount);
    event BalanceDecreased(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function getOwner() public view returns(address) {
        return owner;
    }

    function deposit(uint256 _amount) public payable onlyOwner {
        uint _previousBalance = balance;
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function transferOwnership(address payable newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function resetBalance(uint256 newBalance) public onlyOwner {
        balance = newBalance;
        emit BalanceReset(newBalance);
    }

    function increaseBalance(uint256 amount) public onlyOwner {
        balance += amount;
        emit BalanceIncreased(amount);
    }

    function decreaseBalance(uint256 amount) public onlyOwner {
        require(balance >= amount, "Insufficient balance to decrease");
        balance -= amount;
        emit BalanceDecreased(amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);
}
```

## Frontend

The frontend is built with React and ethers.js to interact with the deployed smart contract.

### index.js

```javascript
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [owner, setOwner] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const getOwner = async () => {
    if (atm) {
      setOwner(await atm.getOwner());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const transferOwnership = async (newOwner) => {
    if (atm) {
      let tx = await atm.transferOwnership(newOwner);
      await tx.wait();
      getOwner();
    }
  };

  const resetBalance = async (newBalance) => {
    if (atm) {
      let tx = await atm.resetBalance(newBalance);
      await tx.wait();
      getBalance();
    }
  };

  const increaseBalance = async (amount) => {
    if (atm) {
      let tx = await atm.increaseBalance(amount);
      await tx.wait();
      getBalance();
    }
  };

  const decreaseBalance = async (amount) => {
    if (atm) {
      let tx = await atm.decreaseBalance(amount);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button className="button" onClick={connectAccount}>Kindly connect your wallet to Metamask</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    if (owner === undefined) {
      getOwner();
    }

    return (
      <div>
        <div className="account-info">
          <h2>Account Information</h2>
          <p><strong>Your Account:</strong> {account}</p>
          <p><strong>Contract Owner:</strong> {owner}</p>
        </div>
        <div className="balance-info">
          <h2>Balance Information</h2>
          <p><strong>Your Balance:</strong> {balance} ETH</p>
        </div>
        <div className="actions">
          <h2>Actions</h2>
          <button className="button" onClick={deposit}>Deposit 1 ETH</button>
          <button className="button" onClick={withdraw}>Withdraw 1 ETH</button>
          <button className="button" onClick={() => transferOwnership(prompt("Enter new owner address:"))}>Transfer Ownership</button>
          <button className="button" onClick={() => resetBalance(prompt("Enter new balance:"))}>Reset Balance</button>
          <button className="button" onClick={() => increaseBalance(prompt("Enter amount to increase:"))}>Increase Balance</button>
          <button className="button" onClick={() => decreaseBalance(prompt("Enter amount to decrease:"))}>Decrease Balance</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Pragyan's ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {


          text-align: center;
          font-family: Helvetica, sans-serif;
          margin: 20px;
        }
        header {
          background-color: #9bd1c7;
          padding: 20px;
          color: black;
        }
        .account-info, .balance-info, .actions {
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          max-width: 400px;
        }
        h2 {
          margin-top: 0;
        }
        .button {
          background-color: #00b57f;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 10px 5px;
          cursor: pointer;
          border-radius: 8px;
        }
        .button:hover {
          background-color: #005bb5;
        }
      `}</style>
    </main>
  );
}
```

## Usage

1. Ensure MetaMask is installed and connected to the correct Ethereum network.
2. Deploy the smart contract and copy the address.
3. Update the contract address in `index.js`.
4. In the 2nd terminal install
   ```bash
   npx hardhat node
   ```
   In the 3rd terminal
   ```bash
   npx hardhat run --network localhost scripts/deploy.js
   ```
6. Start the frontend:
   ```bash
   npm run dev
   ```
7. Open your browser and navigate to the provided localhost address.
8. Connect your MetaMask wallet and interact with the ATM DApp.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Ethereum](https://ethereum.org/)
- [MetaMask](https://metamask.io/)
- [ethers.js](https://docs.ethers.io/v5/)
- [React](https://reactjs.org/)

---
