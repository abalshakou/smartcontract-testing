// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Manager = await hre.ethers.getContractFactory("Manager");
  const manager = await Manager.deploy();

  await manager.deployed();

  console.log("contract deployed to:", manager.address);

  //
  // const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  // const mintnft = await MyNFT.deploy();
  //
  // await mintnft.deployed();
  //
  // console.log("contract deployed to:", mintnft.address);

  const MultiSigWallet = await hre.ethers.getContractFactory("MultiSigWallet");
  const multiSigWallet = await MultiSigWallet.deploy(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"], 1);

  await multiSigWallet.deployed();

  console.log("contract deployed to:", multiSigWallet.address);

  const ERC721 = await hre.ethers.getContractFactory("ERC721");
  const erc721 = await ERC721.deploy();

  await erc721.deployed();

  console.log("contract erc721 deployed to:", erc721.address);


  const EnglishAuction = await hre.ethers.getContractFactory("EnglishAuction");
  const englishAuction = await EnglishAuction.deploy(erc721.address, 77, 1);

  await englishAuction.deployed();

  console.log("contract englishAuction deployed to:", englishAuction.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
