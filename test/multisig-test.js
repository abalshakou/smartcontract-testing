const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("MultiSigWallet", function () {
    let MultiSigWallet, multiSigWallet;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    before(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        multiSigWallet = await MultiSigWallet.deploy(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"], 1);
        await multiSigWallet.deployed();
    });

    it('Should return correct required', async function () {
        const tx = await multiSigWallet.required();
        expect(tx).to.equal(1);
    });

    it('Should return  owners', async function () {
        const tx = await multiSigWallet.getOwners();
        expect(tx).to.include(owner.address);
    });

    it('Should return transaction Count', async function () {
        const tx = await multiSigWallet.getTransactionCount();
        expect(tx).to.be.equal(0);
    });

    it('Contract balance should starts with 0 ETH', async function () {
        const tx = await multiSigWallet.getContractBalance();
        expect(tx).to.be.equal(0);
    })

    it('Should send ether to the contract and update balance', async function () {
        const provider = waffle.provider;
        expect(await provider.getBalance(multiSigWallet.address)).to.be.equal(0);

        const overrides =  {
            to: multiSigWallet.address,
              value: "10000000000000000",
        } ;

        await owner.sendTransaction(overrides);
        expect(await provider.getBalance(multiSigWallet.address)).to.equal('10000000000000000')
    })

    it('Should submit transaction', async function () {
        const provider = waffle.provider;
        expect(await provider.getBalance(multiSigWallet.address)).to.be.equal('10000000000000000');

        await multiSigWallet.submitTransaction(addr1.address, "10000000000000000", "0x00");
        expect(await provider.getBalance(multiSigWallet.address)).to.equal('10000000000000000');

        const tx = await multiSigWallet.getTransactionCount();
        expect(tx).to.be.equal(1);
    })

    it('Should return  bool on address - owner or not', async function () {
        const tx = await multiSigWallet.isOwner(owner.address);
        expect(tx).to.be.equal(true);
    });

    it('Should return  transaction count after submit transaction = 1', async function () {
        const tx = await multiSigWallet.getTransactionCount();
        expect(tx).to.be.equal(1);
    });

    it('Should return transaction by number and check all keys of struct array', async function () {
        expect(await multiSigWallet.transactions("0")).to.have.any.keys("to", "data", "executed", "value", "numConfirmations");
    })

    it('Should check if  transaction include address of transaction', async function () {
        expect(JSON.stringify(await multiSigWallet.transactions("0"))).to.be.include(addr1.address);
    })

    it('Should check if  transaction include address of transaction use getTransaction method', async function () {
        //console.log(await multiSigWallet.getTransaction("0"))
        expect(await multiSigWallet.getTransaction("0")).to.be.include(addr1.address);
    })

    it('Should confirm Transaction', async function () {
        await multiSigWallet.confirmTransaction("0");
        expect(JSON.stringify(await multiSigWallet.transactions("0"))).to.be.include("1");
    })

    it('Should execute Transaction', async function () {
        await multiSigWallet.executeTransaction("0");
        expect(JSON.stringify(await multiSigWallet.transactions("0"))).to.be.include('true');
    })
});
