require("dotenv").config();
import { BuidlerConfig, usePlugin, task } from "@nomiclabs/buidler/config";
import { PBasicSmartPoolFactory } from "./typechain/PBasicSmartPoolFactory";
import { utils } from "ethers";

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-etherscan");
usePlugin("buidler-typechain");
usePlugin("solidity-coverage");

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

console.log(KOVAN_PRIVATE_KEY);

interface ExtendedBuidlerConfig extends BuidlerConfig {
  [x:string]: any
}

const config: ExtendedBuidlerConfig = {
  defaultNetwork: "buidlerevm",
  solc: {
    version: "0.6.2"
  },
  networks: {
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [KOVAN_PRIVATE_KEY]
    },
    coverage: {
      url: 'http://127.0.0.1:8555' // Coverage launches its own ganache-cli client
    }
  },
  etherscan: {
    // The url for the Etherscan API you want to use.
    url: "https://api-rinkeby.etherscan.io/api",
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY
  },
  typechain: {
    outDir: "typechain",
    target: "ethers"
  }
};

task("deploy-pie-smart-pool", "deploys a pie smart pool")
  .addParam("pool", "Balancer pool address (should have tokens binded)")
  .addParam("name", "Name of the token")
  .addParam("symbol", "Symbol of the token")
  .addParam("initialSupply", "Initial supply of the token")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const factory = new PBasicSmartPoolFactory(signers[0]);
    const smartpool = await factory.deploy(taskArgs.pool, taskArgs.name, taskArgs.symbol, utils.parseEther(taskArgs.initialSupply));

    console.log(`PBasicSmartPool deployed at: ${smartpool.address}`);
})

export default config;
