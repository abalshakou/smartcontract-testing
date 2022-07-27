const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("Swap", function () {
    let Swap, swap;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let addr5;
    let addrs;

    before(async function () {
        [owner, addr1, addr2, addr3, addr4, addr5, ...addrs] = await ethers.getSigners();

        Swap = await hre.ethers.getContractFactory("SwapExamples");
        swap = await Swap.deploy('0xE592427A0AEce92De3Edee1F18E0157C05861564');

        await swap.deployed();

        console.log("contract swap deployed to:", swap.address);

    });



    it('Check poolfee', async function () {
        await swap.poolFee();
        expect(await swap.poolFee()).to.equal(3000);
    });

    it('Check DAI', async function () {
        await swap.DAI();
        expect(await swap.DAI()).to.equal('0x6B175474E89094C44Da98b954EedeAC495271d0F');
    });

    it('Check USDC', async function () {
        await swap.poolFee();
        expect(await swap.USDC()).to.equal('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
    });



});