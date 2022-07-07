const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("EnglishAuction", function () {
    let EnglishAuction, englishAuction, ERC721, erc721;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    before(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

         ERC721 = await hre.ethers.getContractFactory("ERC721");
         erc721 = await ERC721.deploy();

        await erc721.deployed();

        console.log("contract erc721 deployed to:", erc721.address);


         EnglishAuction = await hre.ethers.getContractFactory("EnglishAuction");
         englishAuction = await EnglishAuction.deploy(erc721.address, 77, 1);

        await englishAuction.deployed();

        console.log("contract englishAuction deployed to:", englishAuction.address);
    });

    it('Should mint nft', async function () {

        await erc721.mint(owner.address, 77);
        await erc721.approve(englishAuction.address, 77)

        expect(await erc721.balanceOf(owner.address)).to.equal(1);

    });

    it('Should return  bids of owner', async function () {
        const tx = await englishAuction.bids(owner.address);
        expect(tx).to.equal(0);
    });

    it('Should return  highest bid ', async function () {
        const tx = await englishAuction.highestBid();
        expect(tx).to.equal(1);
    });

    it('Should return  highest bidder address (0) ', async function () {
        const tx = await englishAuction.highestBidder();
        expect(tx).to.equal('0x0000000000000000000000000000000000000000');
    });


    it('Should return  nft address ', async function () {
        const tx = await englishAuction.nft();
        expect(tx).to.equal(erc721.address);
    });

    it('Should return  nft id ', async function () {
        const tx = await englishAuction.nftId();
        expect(tx).to.equal(77);
    });

    it('Should return  seller address ', async function () {
        const tx = await englishAuction.seller();
        expect(tx).to.equal(owner.address);
    });

    it('Should return  false -  is started ', async function () {
        const tx = await englishAuction.started();
        expect(tx).to.equal(false);
    });

    it('Should return  true -  is started ', async function () {
        const tx = await englishAuction.start();
        expect(await englishAuction.started()).to.equal(true);
    });

    it('Set  bid from addr1 ', async function () {
        const provider = waffle.provider;
        const overrides =  {
                    to: englishAuction.address,
                    value: "11",
                } ;

        await englishAuction.connect(addr1).bid( { value: "10" });

        expect(await provider.getBalance(englishAuction.address)).to.equal('10')
    });

    it('Set  bid from addr2 ', async function () {
        const provider = waffle.provider;
        const overrides =  {
            to: englishAuction.address,
            value: "11",
        } ;

        await englishAuction.connect(addr2).bid( { value: "20" });

        expect(await provider.getBalance(englishAuction.address)).to.equal('30')
    });

    it('Wrong set  bid from addr2 ', async function () {
        const provider = waffle.provider;
        const overrides =  {
            to: englishAuction.address,
            value: "11",
        } ;

        expect( englishAuction.connect(addr2).bid( { value: "10" })).to.be.revertedWith('value < highest bid');
    });

    it('Should return  highest bid ', async function () {
        const tx = await englishAuction.highestBid();
        expect(tx).to.equal(20);
    });

    it('Should return  highest address ', async function () {
        const tx = await englishAuction.highestBidder();
        expect(tx).to.equal(addr2.address);
    });

    it('Should return  end ', async function () {

        const sevenDays = 7 * 24 * 60 * 60;

        await ethers.provider.send('evm_increaseTime', [sevenDays]);
        await ethers.provider.send('evm_mine');
        await englishAuction.end();
        expect(await englishAuction.ended()).to.equal(true);
    });

    it('Should return  owner of nft ', async function () {
        const tx = await erc721.ownerOf(77);
        expect(tx).to.equal(addr2.address);
    });

});