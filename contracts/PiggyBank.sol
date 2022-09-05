//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract PiggyBank {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "you are not the owner");
        _;
    }

    function getContractBalance() external view returns(uint) {
        return address(this).balance;
    }

    function getOwner() external view returns(address) {
        return owner;
    }

    function depositToken() external payable{}

    function withdrawToken(address payable _to, uint _amount) external {
    (bool success,) = _to.call{value: _amount}("");
        require(success, "not tokens");
    }

    function destroyContract(address payable _to) external {
        selfdestruct(_to);
    }
}