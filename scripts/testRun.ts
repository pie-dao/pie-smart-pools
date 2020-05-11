

const bre = require("@nomiclabs/buidler");


import { deployBalancerPool, deployUniswapFactory, deployAndAddLiquidityUniswapExchange } from "../utils";
import { IBPool } from "../typechain/IBPool";
import { IBPoolFactory } from "../typechain/IBPoolFactory";
import { PBasicSmartPool } from "../typechain/PBasicSmartPool";
import PBasicSmartPoolArtifact from "../artifacts/PBasicSmartPool.json";
import { Signer, Wallet, utils, constants } from "ethers";
import { PUniswapPoolRecipe } from "../typechain/PUniswapPoolRecipe";
import PUniswapPoolRecipeArtifact from "../artifacts/PUniswapPoolRecipe.json";
import { IUniswapFactory } from "../typechain/IUniswapFactory";
import { MockTokenFactory } from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import { MockToken } from "@pie-dao/mock-contracts/typechain/MockToken";
import { deployContract, solidity } from "ethereum-waffle";


const PLACE_HOLDER_ADDRESS = "0x1200000000000000000000000000000000000001";
const NAME = "TEST POOL";
const SYMBOL = "TPL";
const INITIAL_SUPPLY = constants.WeiPerEther;

async function main() {
    // You can run Buidler tasks from a script.
    // For example, we make sure everything is compiled by running "compile"
    // await bre.run("compile");

    // console.log(bre);

    const { ethers } = bre;

    // Deploy contracts


    const signers = await ethers.signers();
    const account = await signers[0].getAddress();

    const pool = IBPoolFactory.connect((await deployBalancerPool(signers[0])), signers[0]);

    const uniswapFactory = await deployUniswapFactory(signers[0]);

    const tokenFactory = new MockTokenFactory(signers[0]);
    const tokens = [];

    for(let i = 0; i < 3; i ++) {
        const token: MockToken = (await tokenFactory.deploy(`Mock ${i}`, `M${i}`, 18));
        await (await token.mint(account, constants.WeiPerEther.mul(1000000))).wait(1);
        // await token.mint(await signers[1].getAddress(), constants.WeiPerEther.mul(1000000));
        await (await token.approve(pool.address, constants.MaxUint256)).wait(1);
        await (await pool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther.mul(1))).wait(1);
        tokens.push(token);

        // Deploy Uniswap pool and approve
        const liquidityAmount = constants.WeiPerEther.mul(10)
        const uniswapExchange = await deployAndAddLiquidityUniswapExchange(uniswapFactory, token, liquidityAmount, liquidityAmount);
    }

    // Deploy this way to get the coverage provider to pick it up
    const smartpool = await deployContract(signers[0] as Wallet, PBasicSmartPoolArtifact, [], {gasLimit: 8000000}) as PBasicSmartPool
    await smartpool.init(pool.address, NAME, SYMBOL, INITIAL_SUPPLY)
    await(await pool.setController(smartpool.address)).wait(1);

    for(const token of tokens) {
        await(await token.approve(smartpool.address, constants.MaxUint256)).wait(1);
    }

    const recipe = await deployContract(signers[0] as Wallet, PUniswapPoolRecipeArtifact, [smartpool.address, uniswapFactory.address]) as PUniswapPoolRecipe;
    // approve contract
    await(await smartpool.approve(recipe.address, constants.MaxUint256)).wait(1);

    
    const amount = INITIAL_SUPPLY.div(2);
    const txToETH = await recipe.tokenToEthSwapInput(amount, 1, constants.MaxUint256);
    
    console.log(await(await (txToETH.wait(1))).transactionHash);

    const expectedEth = await recipe.getEthToTokenOutputPrice(amount);
    const txToToken = await recipe.ethToTokenSwapOutput(amount, constants.MaxUint256, {value: expectedEth.mul(2)});

    console.log(await(await (txToToken.wait(1))).transactionHash);
    
}
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });