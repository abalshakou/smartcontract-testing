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

    describe("Deployment", async () => {
        it("should set the right owner", async () => {
            expect(await smoon.owner()).to.equal(owner.address);
        })

        it("should assign the total supply to the owner", async () => {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await smoon.totalSupply()).to.equal(ownerBalance);
        })
    })

    describe("Transactions", async () => {
        it("Should transfer tokens between accounts", async () => {
            await smoon.connect(addr1).transfer(addr2.address, 50)
            const addr1Balance = await smoon.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50)
        })

        it("should fail if sender doesnt have enough tokens", async () => {
            const initialBalanceOwner = await smoon.balanceOf(owner.address);

            await expect(
                token
                    .connect(addr1)
                    .transfer(owner.address, 1)
            )
                .to.be.revertedWith("smoon: transfer amount exceeds balance")

            expect(
                await token.balanceOf(owner.address)
            )
                .to
                .equal(initialBalanceOwner)
        })

        it("should update balances after transfer", async () => {
            const initialBalanceOwner = await smoon.balanceOf(owner.address);
        })

        await smoon.transfer(addr1.address, 100)
        await smoon.transfer(addr2.address, 50)

        const finalOwnerBalance = await smoon.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialBalanceOwner - 150);

        const addr1Balance = await token.balanceOf(addr1.address)
        expect(addr1Balance).to.equal(100)

        const addr2Balance = await token.balanceOf(addr2.address)
        expect(addr2Balance).to.equal(50)
    })
    // it("Should succesfully deploy", function() {
    //     // this.timeout(10000)
    //     console.log("deployed!")
    // })

    // it("Should deploy with 20B supply", async function() {
    //     const balance = await smoon.balanceOf(owner.address)
    //     const intBalance = parseInt(balance)
    //     expect(intBalance == 20000000000, "Failed")
    // })

    // it("Should let you send tokens to another address", async function() {
    //     await smoon.transfer(addr1.address, ethers.utils.parseEther("100") )
    //     expect(await smoon.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("100"))
    // })

});