import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying HypeChain to Somnia Testnet...\n");

  // Get deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  if (!deployer) {
    console.error("ERROR: No signer found! Check your PRIVATE_KEY in .env.local");
    process.exit(1);
  }
  
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "STT\n");

  if (balance === BigInt(0)) {
    console.error("ERROR: Account has no balance!");
    console.log("Get testnet tokens from: https://faucet.somnia.network");
    process.exit(1);
  }

  // Deploy contract
  console.log("Deploying HypeChain contract...");
  const HypeChain = await ethers.getContractFactory("HypeChain");
  const hypeChain = await HypeChain.deploy();

  await hypeChain.waitForDeployment();
  const address = await hypeChain.getAddress();

  console.log("\nSUCCESS: HypeChain deployed to:", address);
  console.log("\nSave this info:");
  console.log("Contract Address:", address);
  console.log("Network: Somnia Dream Testnet");
  console.log("Chain ID: 50312");
  console.log("Explorer:", `https://explorer.somnia.network/address/${address}`);
  
  // Test the contract
  console.log("\nTesting contract...");
  const tx = await hypeChain.createContent("ipfs://test-deployment");
  await tx.wait();
  console.log("SUCCESS: Test transaction successful!");
  
  const counters = await hypeChain.getCounters();
  console.log("Content count:", counters.totalContents.toString());
  console.log("Share count:", counters.totalShares.toString());

  console.log("\nDeployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

