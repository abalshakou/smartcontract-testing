const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("SAfeMoon", function () {
    let SafeMoonFork, smoon;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let addr5;
    let addrs;

    before(async function () {
        [owner, addr1, addr2, addr3, addr4, addr5, ...addrs] = await ethers.getSigners();

        SafeMoonFork = await hre.ethers.getContractFactory("SafeMoonFork");
        smoon = await SafeMoonFork.deploy('0xE592427A0AEce92De3Edee1F18E0157C05861564');

        await smoon.deployed();

        console.log("contract swap deployed to:", smoon.address);

    });


});