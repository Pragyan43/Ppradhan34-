/*
Assessment Requirements
1. create a simple contract with 2-3 functions
2. Value of the functions from the smart contract are visible on the frontend of the application
*/

Assessment.sol:

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

    function getBalance() public view returns(uint256){
        return balance;
    }

    function getOwner() public view returns(address) {
        return owner;
    }

    function deposit(uint256 _amount) public payable onlyOwner {
        uint _previousBalance = balance;

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
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

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
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

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);
}
