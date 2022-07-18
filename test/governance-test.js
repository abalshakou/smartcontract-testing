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
        token = await Token.deploy(name, symbol, supply);

        await token.deployed();

        console.log("contract token deployed to:", token.address);

        const amount = 50;
        const minDelay = 1;

        await token.transfer(addr1.address, amount, { from: owner.address })
        await token.transfer(addr2.address, amount, { from: owner.address })
        await token.transfer(addr3.address, amount, { from: owner.address })
        await token.transfer(addr4.address, amount, { from: owner.address })
        await token.transfer(addr5.address, amount, { from: owner.address })

        //  passing minDelay,  also need to pass 2 arrays
        // The 1st array  who  allowed to make a proposal.
        // The 2nd array who  allowed to make executions.
        Timelock = await hre.ethers.getContractFactory("TimeLock");
        timelock = await Timelock.deploy(minDelay, [owner.address], [owner.address] );

        await timelock.deployed();

        console.log("contract TimeLock deployed to:", timelock.address);


        const quorum = 5 // Percentage of total supply  (5%)
        const votingDelay = 0 // How many blocks after proposal until voting becomes active
        const votingPeriod = 5 // How many blocks to allow voters to vote
       Governance = await hre.ethers.getContractFactory("Governance");
       governance = await Governance.deploy(token.address, timelock.address, quorum, votingDelay, votingPeriod);

       await governance.deployed();

       console.log("contract governance deployed to:", governance.address);

        const funds = 25;
        Treasury = await hre.ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy(owner.address, { value: funds });

        await treasury.deployed();

        await treasury.transferOwnership(timelock.address, { from: owner.address })

        console.log("contract Treasury deployed to:", treasury.address);

        const proposerRole = await timelock.PROPOSER_ROLE()
        const executorRole = await timelock.EXECUTOR_ROLE()

        await timelock.grantRole(proposerRole, governance.address, { from: owner.address })
        await timelock.grantRole(executorRole, governance.address, { from: owner.address })
    });

    it('Check balanse of addr1', async function () {
        await token.balanceOf(addr1.address);
        expect(await token.balanceOf(addr1.address)).to.equal(50);
    });

    it('Check treasury funds balance', async function () {
       const isReleased = await treasury.isReleased();
        console.log(`Funds released? ${isReleased}`)

        expect(await treasury.isReleased()).to.equal(false);
    });

    it('Check funds inside of treasury', async function () {
        const provider = waffle.provider;
        const funds = await provider.getBalance(treasury.address)

        console.log(`Funds inside of treasury: ${ethers.utils.formatUnits(funds.toString(), 'wei')} wei\n`)

        expect(await ethers.utils.formatUnits(funds.toString(), 'wei')).to.equal('25');
    });


    it('Create proposal ', async function () {
        const encodedFunction = await treasury.populateTransaction.releaseFunds();

        const description = "Release Funds from Treasury";
        console.log(encodedFunction);
        console.log(ethers.utils.hexlify(encodedFunction));
        console.log(`${description}\n`);
        const tx = await governance.propose([treasury.address], [0], [encodedFunction], description, { from: owner.address });

        const id = tx.logs[0].args.proposalId;
        console.log(`Created Proposal: ${id.toString()}\n`);
    });

});