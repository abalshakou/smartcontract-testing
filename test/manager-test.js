const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("Manager", function () {
    let Manager, manager;

    before(async function () {
        Manager = await ethers.getContractFactory("Manager");
        manager = await Manager.deploy();
        await manager.deployed();
    });

    it("Should create a new ticket", async function () {
        await manager.createTicket("test");
        let tickets = await manager.getTickets();
        expect(tickets[0].name).to.equal("test");
    });

    it("Should update ticket name", async function () {
        await manager.updateTicketName(0, "new name");
        let tickets = await manager.getTickets();
        expect(tickets[0].name).to.equal("new name");
    });

    it("Should update ticket description", async function () {
        await manager.updateTicketDescription(0, "new description");
        let tickets = await manager.getTickets();
        expect(tickets[0].description).to.equal("new description");
    });

    it("Should update ticket status", async function () {
        await manager.updateTicketStatus(0, 1);
        let tickets = await manager.getTickets();
        expect(tickets[0].status).to.equal(1);
    });

    it("Should delete ticket", async function () {
        const expected = [];
        await manager.deleteTicket(0);
        let tickets = await manager.getTickets();
        expect(tickets).to.deep.equal(expected);
    });
});
