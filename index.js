index.js:

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

    // once wallet is set we can get a reference to our deployed contract
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
  }

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  }

  const transferOwnership = async (newOwner) => {
    if (atm) {
      let tx = await atm.transferOwnership(newOwner);
      await tx.wait();
      getOwner();
    }
  }

  const resetBalance = async (newBalance) => {
    if (atm) {
      let tx = await atm.resetBalance(newBalance);
      await tx.wait();
      getBalance();
    }
  }

  const increaseBalance = async (amount) => {
    if (atm) {
      let tx = await atm.increaseBalance(amount);
      await tx.wait();
      getBalance();
    }
  }

  const decreaseBalance = async (amount) => {
    if (atm) {
      let tx = await atm.decreaseBalance(amount);
      await tx.wait();
      getBalance();
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button className="button" onClick={connectAccount}>Kindly connect your wallet to Metamask</button>
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
