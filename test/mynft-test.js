const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("MyNFT", function () {
    let MyNFT, mintnft;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    before(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        MyNFT = await ethers.getContractFactory("MyNFT");
        mintnft = await MyNFT.deploy();
        await mintnft.deployed();
    });


    it("Deployment should assign the total supply of tokens to the owner", async function () {
        const [owner] = await ethers.getSigners();

        const ownerBalance = await mintnft.balanceOf(owner.address);
        expect(await mintnft.totalSupply()).to.equal(ownerBalance);
    });

    it('You cant withdraw if you not owner', async function () {
        const tx = mintnft.connect(addr1).withdraw();
        await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it('Should return correct name', async function () {
        const tx = await mintnft.name();
        expect(tx).to.equal("MyNFT");
    });

    it('Should return correct MAX SUPPLY', async function () {
        const tx = await mintnft.MAX_SUPPLY();
        expect(tx).to.be.equal("10");
    });

    it('Should return correct mint Rate', async function () {
        const tx = await mintnft.mintRate();
        expect(tx).to.be.equal("9000000000000000");
    });

    it('Should return  owner', async function () {
        const tx = await mintnft.owner();
        expect(tx).to.be.equal(owner.address);
    });

    it('Should return  state of pause', async function () {
        const tx = await mintnft.paused();
        expect(tx).to.be.equal(false);
    });

    it('Should assign the total supply of tokens to the owner', async function () {
        const ownerBalance = await mintnft.balanceOf(owner.address);
        expect(await mintnft.totalSupply()).to.be.equal(ownerBalance);
    });

    it('Should mint token', async function () {
        const overrides =  {
            from: owner.address, value: "10000000000000000"
        } ;

        await mintnft.safeMint( addr1.address, overrides)
        const ownerBalance = await mintnft.balanceOf(owner.address);
        expect(await mintnft.totalSupply()).to.be.equal(ownerBalance + 1);
    });

    it('Should be reverted because exceed max token ', async function () {
        const overrides =  {
            from: owner.address, value: "10000000000000000"
        } ;

        for(let i = 0; i < 9; i++) {
            await mintnft.safeMint( addr1.address, overrides)
        }

        await  expect( mintnft.safeMint( addr2.address, overrides)).to.be.revertedWith("Cant mint more.");
    });

});
