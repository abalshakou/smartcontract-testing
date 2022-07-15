const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("Governance", function () {
    let Governance, governance, Token, token, Timelock, timelock, Treasury, treasury ;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let addr5;
    let addrs;

    const name = "Dapp testing DAO"
    const symbol = "DAOT"
    const supply = 1000; // 1000 Tokens

    before(async function () {
        [owner, addr1, addr2, addr3, addr4, addr5, ...addrs] = await ethers.getSigners();

        Token = await hre.ethers.getContractFactory("Token");
        token = await Token.deploy(name, symbol, supply );

        await token.deployed();

        console.log("contract token deployed to:", token.address);

        const amount = 50;

        await token.transfer(addr1.address, amount, { from: owner.address })
        await token.transfer(addr2.address, amount, { from: owner.address })
        await token.transfer(addr3.address, amount, { from: owner.address })
        await token.transfer(addr4.address, amount, { from: owner.address })
        await token.transfer(addr5.address, amount, { from: owner.address })


      //  Governance = await hre.ethers.getContractFactory("Governance");
     //   governance = await Governance.deploy(erc721.address, 77, 1);

     //   await governance.deployed();

     //   console.log("contract governance deployed to:", governance.address);
    });

    it('Check balanse of addr1', async function () {
        await token.balanceOf(addr1.address);
        expect(await token.balanceOf(addr1.address)).to.equal(50);
    });

});