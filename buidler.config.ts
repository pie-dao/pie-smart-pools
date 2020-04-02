require("dotenv").config();
import { BuidlerConfig, usePlugin, task } from "@nomiclabs/buidler/config";
import { utils, constants } from "ethers";
import { MockTokenFactory } from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import { PBasicSmartPoolFactory } from "./typechain/PBasicSmartPoolFactory";
import { IBFactoryFactory } from "./typechain/IBFactoryFactory";
import { deployBalancerFactory } from "./utils";
import { IBPoolFactory } from "./typechain/IBPoolFactory";
import { IERC20Factory } from "./typechain/IERC20Factory";
import { parseUnits, parseEther, BigNumberish, BigNumber } from "ethers/utils";
import { PProxiedFactoryFactory } from "./typechain/PProxiedFactoryFactory";

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-etherscan");
usePlugin("buidler-typechain");
usePlugin("solidity-coverage");

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY || "";
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

interface ExtendedBuidlerConfig extends BuidlerConfig {
  [x:string]: any
}

const config: ExtendedBuidlerConfig = {
  defaultNetwork: "buidlerevm",
  solc: {
    version: "0.6.4",
    optimizer: {
      runs: 200,
      enabled: true,
    }
  },
  networks: {
    local: {
      url: "http://127.0.0.1:8545/"
    },
    buidlerevm: {
      gasPrice: 0,
      blockGasLimit: 100000000,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [MAINNET_PRIVATE_KEY]
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [KOVAN_PRIVATE_KEY]
    },
    coverage: {
      url: 'http://127.0.0.1:8555', // Coverage launches its own ganache-cli client
      gasPrice: 0,
      blockGasLimit: 100000000,
    }
  },
  etherscan: {
    // The url for the Etherscan API you want to use.
    url: "https://api-kovan.etherscan.io/api",
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY
  },
  typechain: {
    outDir: "typechain",
    target: "ethers"
  }
};

task("deploy-pie-smart-pool-factory", "deploys a pie smart pool factory")
  .addParam("balancerFactory", "Address of the balancer factory")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const factory = await (new PProxiedFactoryFactory(signers[0])).deploy();
    console.log(`Factory deployed at: ${factory.address}`);
    await factory.init(taskArgs.balancerFactory);
});

task("deploy-pool-from-factory", "deploys a pie smart pool from the factory")
  .addParam("factory")
  .addParam("allocation", "path to allocation configuration")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const factory = PProxiedFactoryFactory.connect(taskArgs.factory, signers[0]);

    const config = require(taskArgs.allocation);

    const name = config.name;
    const symbol = config.symbol
    const initialSupply = parseEther(config.initialSupply);
    const cap = parseEther(config.cap);
    const tokens = config.tokens;


    const tokenAddresses: string[] = [];
    const tokenAmounts: BigNumberish[] = [];
    const tokenWeights: BigNumberish[] = [];

    

    for (const token of tokens) {
      tokenAddresses.push(token.address);
      tokenWeights.push(constants.WeiPerEther.mul(token.weight).div(2));
      
      // Calc amount
      let amount = new BigNumber((config.initialValue / token.value * token.weight / 100 * config.initialSupply * 10 ** token.decimals).toString());
      // let amount = (new BigNumber((config.initialValue / token.value * token.weight / 100 * config.initialSupply) * 10 ** token.decimals));
      // let amount = parseUnits(config.initialValue, token.decimals).div()
      tokenAmounts.push(amount);

      // Approve factory to spend token
      const tokenContract = IERC20Factory.connect(token.address, signers[0]);

      const allowance = await tokenContract.allowance(await signers[0].getAddress(), factory.address);
      if(allowance.lt(amount)) {
        const approveTx = await tokenContract.approve(factory.address, constants.WeiPerEther);
        console.log(`Approved: ${token.address} tx: ${approveTx.hash}`);
        await approveTx.wait(1);
      }
      
    }

    const tx = await factory.newProxiedSmartPool(name, symbol, initialSupply, tokenAddresses, tokenAmounts, tokenWeights, cap);
    const receipt = await tx.wait(2); //wait for 2 confirmations
    const event = receipt.events.pop();
    console.log(`Deployed smart pool at : ${event.address}`);
});

task("deploy-pie-smart-pool", "deploys a pie smart pool")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const factory = new PBasicSmartPoolFactory(signers[0]);
    const smartpool = await factory.deploy();

    console.log(`PBasicSmartPool deployed at: ${smartpool.address}`);
});

task("init-smart-pool", "initialises a smart pool")
  .addParam("smartPool", "Smart pool address")
  .addParam("pool", "Balancer pool address (should have tokens binded)")
  .addParam("name", "Name of the token")
  .addParam("symbol", "Symbol of the token")
  .addParam("initialSupply", "Initial supply of the token")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const smartpool = PBasicSmartPoolFactory.connect(taskArgs.smartPool, signers[0]);
    const tx = await smartpool.init(taskArgs.pool, taskArgs.name, taskArgs.symbol, utils.parseEther(taskArgs.initialSupply));
    const receipt = await tx.wait(1);

    console.log(`Smart pool initialised: ${receipt.transactionHash}`);
});

task("join-smart-pool")
  .addParam("pool")
  .addParam("amount")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const smartpool = PBasicSmartPoolFactory.connect(taskArgs.pool, signers[0]);

    // TODO fix this confusing line
    const tokens = await IBPoolFactory.connect(await smartpool.bPool(), signers[0]).getCurrentTokens();

    for(const tokenAddress of tokens) {
      const token = IERC20Factory.connect(tokenAddress, signers[0]);
      // TODO make below more readable
      await (await token.approve(smartpool.address, constants.MaxUint256)).wait(1);
    }
    const tx = await smartpool.joinPool(parseEther(taskArgs.amount));
    const receipt = await tx.wait(1);

    console.log(`Pool joined tx: ${receipt.transactionHash}`)
});

task("approve-smart-pool")
  .addParam("pool")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const smartpool = PBasicSmartPoolFactory.connect(taskArgs.pool, signers[0]);

    // TODO fix this confusing line
    const tokens = await IBPoolFactory.connect(await smartpool.bPool(), signers[0]).getCurrentTokens();

    for(const tokenAddress of tokens) {
      const token = IERC20Factory.connect(tokenAddress, signers[0]);
      // TODO make below more readable
      const receipt = await (await token.approve(smartpool.address, constants.MaxUint256)).wait(1);
      console.log(`${tokenAddress} approved tx: ${receipt.transactionHash}`);
    }
});

task("deploy-mock-token", "deploys a mock token")
  .addParam("name", "Name of the token")
  .addParam("symbol", "Symbol of the token")
  .addParam("decimals", "Amount of decimals", "18")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const factory = await new MockTokenFactory(signers[0]);
    const token = await factory.deploy(taskArgs.name, taskArgs.symbol, taskArgs.decimals);
    await token.mint(await signers[0].getAddress(), constants.WeiPerEther.mul(10000000000000));
    console.log(`Deployed token at: ${token.address}`);
});

task("deploy-balancer-factory", "deploys a balancer factory")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const factoryAddress = await deployBalancerFactory(signers[0]);
    console.log(`Deployed balancer factory at: ${factoryAddress}`);
});

task("deploy-balancer-pool", "deploys a balancer pool from a factory")
  .addParam("factory", "Address of the balancer pool address")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const factory = await IBFactoryFactory.connect(taskArgs.factory, signers[0]);
    const tx = await factory.newBPool();
    const receipt = await tx.wait(2); //wait for 2 confirmations
    const event = receipt.events.pop();
    console.log(`Deployed balancer pool at : ${event.address}`);
});

//npx buidler balancer-bind-token --pool 0xfE682598599015d9f0EE4A4B56dE1CEfd27Cb7d5 --token 0x363BE4b8F3a341f720AbCDC666b1FB769BE73852 --balance 0.07 --decimals 6 --weight 3.5 --network kovan
task("balancer-bind-token", "binds a token to a balancer pool")
  .addParam("pool", "the address of the Balancer pool")
  .addParam("token", "address of the token to bind")
  .addParam("balance", "amount of token to bind")
  .addParam("weight", "denormalised weight (max total weight = 50, min_weight = 1 == 2%")
  .addParam("decimals", "amount of decimals the token has", "18")
  .setAction(async(taskArgs, { ethers }) => {
    // Approve token
    const signers = await ethers.getSigners();
    const account = await signers[0].getAddress();
    const pool = IBPoolFactory.connect(taskArgs.pool, signers[0]);

    const weight = parseUnits(taskArgs.weight, 18);
    const balance = utils.parseUnits(taskArgs.balance, parseInt(taskArgs.decimals));
    const token = await IERC20Factory.connect(taskArgs.token, signers[0]);

    const allowance = await token.allowance(account, pool.address);

    if(allowance.lt(balance)) {
      await token.approve(pool.address, constants.MaxUint256);
    }

    const tx = await pool.bind(taskArgs.token, balance, weight, {gasLimit: 1000000});
    const receipt = await tx.wait(1);

    console.log(`Token bound tx: ${receipt.transactionHash}`);
});

task("balancer-unbind-token", "removed a balancer token from a pool")
  .addParam("pool", "the address of the balancer pool")
  .addParam("token", "the address of the token to unbind")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const account = await signers[0].getAddress();
    const pool = IBPoolFactory.connect(taskArgs.pool, signers[0]);

    const tx = await pool.unbind(taskArgs.token);
    const receipt = await tx.wait(1);

    console.log(`Token unbound tx: ${receipt.transactionHash}`);
});

task("balancer-set-controller")
  .addParam("pool")
  .addParam("controller")
  .setAction(async(taskArgs, { ethers }) => {
    const signers = await ethers.getSigners();
    const pool = IBPoolFactory.connect(taskArgs.pool, signers[0]);
    
    const tx = await pool.setController(taskArgs.controller);
    const receipt = await tx.wait(1);

    console.log(`Controller set tx: ${receipt.transactionHash}`); 
});


export default config;
