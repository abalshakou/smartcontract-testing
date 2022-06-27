const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("MyNFT", function () {
    let MyNFT, mintnft;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let worldPurpose;

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


});
