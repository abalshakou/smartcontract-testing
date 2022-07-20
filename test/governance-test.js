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
    let executor;
    let addrs;

    let   blockNumber, proposalState, pId, vote, deadline, snapshot, encodedFunction

    const name = "Dapp testing DAO"
    const symbol = "DAOT"
    const supply = 1000; // 1000 Tokens
    const amount = 50;

    before(async function () {
        [owner, addr1, addr2, addr3, addr4, addr5, executor, ...addrs] = await ethers.getSigners();

        Token = await hre.ethers.getContractFactory("Token");
        token = await Token.deploy(name, symbol, supply);

        await token.deployed();

        console.log("contract token deployed to:", token.address);


        const minDelay = 10;

        //  passing minDelay,  also need to pass 2 arrays
        // The 1st array  who  allowed to make a proposal.
        // The 2nd array who  allowed to make executions.
        Timelock = await hre.ethers.getContractFactory("TimeLock");
        timelock = await Timelock.deploy(minDelay, [owner.address], [executor.address] );

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
        console.log("executorRole:", executorRole);

        await timelock.grantRole(proposerRole, governance.address, { from: owner.address })
        await timelock.grantRole(executorRole, governance.address)
    });

    it("should transfer tokens into 5 addresses", async function() {

        await token.transfer(addr1.address, amount)
        await token.connect(addr1).delegate(addr1.address)
        await token.transfer(addr2.address, amount)
        await token.connect(addr2).delegate(addr2.address)
        await token.transfer(addr3.address, amount)
        await token.connect(addr3).delegate(addr3.address)
        await token.transfer(addr4.address, amount)
        await token.connect(addr4).delegate(addr4.address)
        await token.transfer(addr5.address, amount)
        await token.connect(addr5).delegate(addr5.address)
        await token.transfer(executor.address, amount)
        await token.connect(executor).delegate(executor.address)

        expect(await token.balanceOf(addr1.address)).to.be.equal(amount)
        expect(await token.balanceOf(addr2.address)).to.be.equal(amount)
        expect(await token.balanceOf(addr3.address)).to.be.equal(amount)
        expect(await token.balanceOf(addr4.address)).to.be.equal(amount)
        expect(await token.balanceOf(addr5.address)).to.be.equal(amount)
    })

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
        //Here we get unsigned function
         encodedFunction = await treasury.populateTransaction.releaseFunds();
        const description = "Release Funds from Treasury";

        //here we encode function to hex using keccak 256

        // console.log(ethers.utils.id(encodedFunction)); if need to encode like encodeABI web3

        const tx = await governance.propose([treasury.address], [0], [ethers.utils.id(encodedFunction)], description, { from: owner.address });
       // console.log(tx);

        //here we return state of transaction because we need get proposal Id
        const txWait = await tx.wait();

         pId = txWait.events[0].args.proposalId.toString();

       // console.log(pId);
       // console.log(`Created Proposal: ${id.toString()}\n`);
    });

    it('Check  state of proposal ', async function () {

        proposalState = await governance.state(pId)
        console.log(`Current state of proposal: ${proposalState.toString()} (Pending) \n`)

        expect(await proposalState).to.equal(0);
    });


    it('Check  snapshot of proposal ', async function () {

        snapshot = await governance.proposalSnapshot(pId)
        console.log(`Proposal created on block ${snapshot.toString()}`)

        expect(await snapshot.toString()).to.be.a('string');
    });

    it('Check  deadline of proposal ', async function () {

        const deadline = await governance.proposalDeadline(pId)
        console.log(`Proposal deadline on block ${deadline.toString()}\n`)

        const snapNextBlock = snapshot.toNumber() + 5;
        expect(await deadline.toString()).to.be.equal(snapNextBlock.toString());
    });

    it('Check  blockNumber of proposal ', async function () {
        const provider = waffle.provider;
        blockNumber = await provider.getBlockNumber()
        console.log(`Current blocknumber: ${blockNumber}\n`)

        expect(await blockNumber.toString()).to.be.equal(snapshot.toString());
    });

    it('Check  quorum votes equal 50', async function () {
        const quorum = await governance.quorum(blockNumber - 1)
        console.log(`Number of votes required to pass: ${ethers.utils.formatUnits(quorum.toString(), 'wei')}\n`)

        expect(await ethers.utils.formatUnits(quorum.toString(), 'wei')).to.equal('50');
    });

    it('Casting votes', async function () {
        // 0 = Against, 1 = For, 2 = Abstain
        vote = await governance.connect(addr1).castVote(pId, 1)
        vote = await governance.connect(addr2).castVote(pId, 1)
        vote = await governance.connect(addr3).castVote(pId, 1)
        vote = await governance.connect(addr4).castVote(pId, 0)
        vote = await governance.connect(addr5).castVote(pId, 2)
    });

    it('Check сurrent state of proposal equal 1', async function () {
        // States: Pending, Active, Canceled, Defeated, Succeeded, Queued, Expired, Executed
        proposalState = await governance.state(pId)
        console.log(`Current state of proposal: ${proposalState.toString()} (Active) \n`)

        expect(proposalState.toString()).to.equal('1');
    });

    it('Check сurrent state of proposal votes', async function () {
        // NOTE: Transfer serves no purposes, it's just used to fast foward one block after the voting period ends
        await token.transfer(owner.address, amount, { from: owner.address })

        const { againstVotes, forVotes, abstainVotes } = await governance.proposalVotes(pId)
        console.log(`Votes For: ${ethers.utils.formatUnits(forVotes.toString(), 'wei')}`)
        console.log(`Votes Against: ${ethers.utils.formatUnits(againstVotes.toString(), 'wei')}`)
        console.log(`Votes Neutral: ${ethers.utils.formatUnits(abstainVotes.toString(), 'wei')}\n`)

        expect(ethers.utils.formatUnits(forVotes.toString(), 'wei')).to.equal('150');
        expect(ethers.utils.formatUnits(againstVotes.toString(), 'wei')).to.equal('50');
        expect(ethers.utils.formatUnits(abstainVotes.toString(), 'wei')).to.equal('50');
    });

    it('Check сurrent blocknumber', async function () {
        const provider = waffle.provider;
        blockNumber = await provider.getBlockNumber()
        console.log(`Current blocknumber: ${blockNumber}\n`)
    });

    it('Check сurrent state of proposal', async function () {
        proposalState = await governance.state(pId)
        console.log(`Current state of proposal: ${proposalState.toString()} (Succeeded) \n`)
    });

    it('Check сurrent state of proposal Queued', async function () {
        // Queue
        const hash = ethers.utils.id("Release Funds from Treasury")
        await governance.queue([treasury.address], [0], [ethers.utils.id(encodedFunction)], hash, { from: executor.address })

        proposalState = await governance.state(pId)
        console.log(`Current state of proposal: ${proposalState.toString()} (Queued) \n`)
    });

    it('Check сurrent state of proposal Executed', async function () {
        // Execute
        const hash = ethers.utils.id("Release Funds from Treasury")
        await governance.execute([treasury.address], [0], [ethers.utils.id(encodedFunction)], hash, { from: executor.address  })

        proposalState = await governance.state(pId)
        console.log(`Current state of proposal: ${proposalState.toString()} (Executed) \n`)
    });

});