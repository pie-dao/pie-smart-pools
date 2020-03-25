// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import { MockTokenFactory } from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import { MockKyberNetworkFactory } from "@pie-dao/mock-contracts/dist/typechain/MockKyberNetworkFactory";
import { MockToken } from "@pie-dao/mock-contracts/typechain/MockToken";
import { MockKyberNetwork } from "@pie-dao/mock-contracts/typechain/MockKyberNetwork";
import { ethers } from "@nomiclabs/buidler";
import { Signer, Wallet, utils, constants } from "ethers";
import { BigNumber } from "ethers/utils";
import chai from "chai";
import { deployContract, solidity } from "ethereum-waffle";

import { deployBalancerPool, deployUniswapFactory, deployAndAddLiquidityUniswapExchange } from "../utils";
import { IBPool } from "../typechain/IBPool";
import { IBPoolFactory } from "../typechain/IBPoolFactory";
import { PBasicSmartPool } from "../typechain/PBasicSmartPool";
import PBasicSmartPoolArtifact from "../artifacts/PBasicSmartPool.json";
import { PUniswapKyberPoolRecipe } from "../typechain/PUniswapKyberPoolRecipe";
import PUniswapKyberPoolRecipeArtifact from "../artifacts/PUniswapKyberPoolRecipe.json";
import { IUniswapFactory } from "../typechain/IUniswapFactory";
import { WeiPerEther } from "ethers/constants";


chai.use(solidity);
const { expect } = chai;

const PLACE_HOLDER_ADDRESS = "0x1200000000000000000000000000000000000001";
const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const NAME = "TEST POOL";
const SYMBOL = "TPL";
const INITIAL_SUPPLY = constants.WeiPerEther;

describe("PUniswapKyberPoolRecipe", function() {
    this.timeout(300000);
    let signers: Signer[];
    let account: string;
    let account2: string;
    let tokens: MockToken[];
    let pool: IBPool;
    let smartpool: PBasicSmartPool;
    let recipe: PUniswapKyberPoolRecipe;
    let uniswapFactory:  IUniswapFactory;

    beforeEach(async() => {
        signers = await ethers.signers();
        account = await signers[0].getAddress();
        account2 = PLACE_HOLDER_ADDRESS;

        pool = IBPoolFactory.connect((await deployBalancerPool(signers[0])), signers[0]);

        uniswapFactory = await deployUniswapFactory(signers[0]);

        const tokenFactory = new MockTokenFactory(signers[0]);
        const kyber: MockKyberNetwork = await (new MockKyberNetworkFactory(signers[0]).deploy());
        tokens = [];

        for(let i = 0; i < 3; i ++) {
            const token: MockToken = (await tokenFactory.deploy(`Mock ${i}`, `M${i}`, 18));
            await token.mint(account, constants.WeiPerEther.mul(1000000));
            // await token.mint(await signers[1].getAddress(), constants.WeiPerEther.mul(1000000));
            await token.approve(pool.address, constants.MaxUint256);
            await pool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther.mul(1));
            tokens.push(token);

            // Deploy Uniswap pool and approve
            const liquidityAmount = constants.WeiPerEther.mul(10)
            const uniswapExchange = await deployAndAddLiquidityUniswapExchange(uniswapFactory, token, liquidityAmount, liquidityAmount);
            
            await kyber.setPairRate(ETH, token.address, WeiPerEther);
            await kyber.setPairRate(token.address, ETH, WeiPerEther);
        }

        // Send some eth to the mock kyber contract
        await signers[0].sendTransaction({to: kyber.address, value: WeiPerEther.mul(10)});

        // Deploy this way to get the coverage provider to pick it up
        smartpool = await deployContract(signers[0] as Wallet, PBasicSmartPoolArtifact, [], {gasLimit: 8000000}) as PBasicSmartPool
        await smartpool.init(pool.address, NAME, SYMBOL, INITIAL_SUPPLY)
        await pool.setController(smartpool.address);

        for(const token of tokens) {
            await token.approve(smartpool.address, constants.MaxUint256);
        }

        recipe = await deployContract(signers[0] as Wallet, PUniswapKyberPoolRecipeArtifact, []) as PUniswapKyberPoolRecipe;
        await recipe.initUK(smartpool.address, uniswapFactory.address, kyber.address, [tokens[1].address], PLACE_HOLDER_ADDRESS);

        // console.log(await recipe.pool());
        // process.exit();

        // approve contract
        await smartpool.approve(recipe.address, constants.MaxUint256);
    });

    describe("TokenToEth", async() => {
        it("TokenToEthTransferInput should work", async() => {
            // Exit with half the amount
            const amount = INITIAL_SUPPLY.div(2);

            const expectedEth = await recipe.getTokenToEthInputPrice(amount);
        
            await recipe.tokenToEthTransferInput(amount, 1, constants.MaxUint256, account2);

            const sPBalance = await smartpool.balanceOf(account);
            expect(sPBalance, "Smart pool token balance should have decreased by the amount").to.eq(INITIAL_SUPPLY.sub(amount));

            const ethBalance = await signers[0].provider.getBalance(account2);
            // expect(ethBalance).to.eq(expectedEth);
        });

        it("Calling TokenToEthTransferInput when the dealine passed should fail", async() => {
            // Exit with half the amount
            const amount = INITIAL_SUPPLY.div(2);
            await expect(recipe.tokenToEthTransferInput(amount, 1, 1, account2)).to.be.reverted;
        });

        it("Calling TokenToEthTransferInput when the recipe is not approved should fail", async() => {
            const amount = INITIAL_SUPPLY.div(2);

            // Reset approval for this test
            await smartpool.approve(recipe.address, 0);
            await expect(recipe.tokenToEthTransferInput(amount, 1, constants.MaxUint256, account2)).to.be.reverted;
        });

        it("Calling TokenToEthTransferInput and receiving less than min eth amount should fail", async() => {
            const amount = INITIAL_SUPPLY.div(2);
            await expect(recipe.tokenToEthTransferInput(amount, constants.MaxUint256, constants.MaxUint256, account2)).to.be.reverted;
        });

        it("TokenToEthSwapInput should work", async() => {
            const amount = INITIAL_SUPPLY.div(2);

            const expectedEth = await recipe.getTokenToEthInputPrice(amount);
            
            const ethBalanceBefore = await signers[0].provider.getBalance(account);

            await recipe.tokenToEthSwapInput(amount, 1, constants.MaxUint256);

            const sPBalance = await smartpool.balanceOf(account);
            expect(sPBalance, "Smart pool token balance should have decreased by the amount").to.eq(INITIAL_SUPPLY.sub(amount));

            const ethBalance = await signers[0].provider.getBalance(account);
            // expect(ethBalance).to.eq(ethBalanceBefore.add(expectedEth));
        });
    });

    describe("ethToToken", async() => {
        it("EthToTokenTransferOutput should work", async() => {
            const amount = INITIAL_SUPPLY.div(2);

            const expectedEth = await recipe.getEthToTokenOutputPrice(amount);
            const ethBalanceBefore = await signers[0].provider.getBalance(account);
            
            await recipe.ethToTokenTransferOutput(amount, constants.MaxUint256, account2, {value: expectedEth.mul(10)});

            const sPBalance = await smartpool.balanceOf(account2);
            expect(sPBalance).to.eq(amount);

            const ethBalance = await signers[0].provider.getBalance(account);
            // expect(ethBalance).to.eq(ethBalanceBefore.sub(expectedEth));
        });

        it("Calling EthToTokenTransferOutput when the dealine has passed should fail", async() => {
            const amount = INITIAL_SUPPLY.div(2);
            const expectedEth = await recipe.getEthToTokenOutputPrice(amount);

            await expect(recipe.ethToTokenTransferOutput(amount, 1, account2, {value: expectedEth.mul(10)})).to.be.reverted;
        });

        it("Calling EthToTokenTransferOutput when not sending enough eth should fail", async() => {
            const amount = INITIAL_SUPPLY.div(2);
            const expectedEth = await recipe.getEthToTokenOutputPrice(amount);

            await expect(recipe.ethToTokenTransferOutput(amount, 1, account2, {value: expectedEth.sub(1)})).to.be.reverted;
        })

        it("EthToTokenSwapOutput should work", async() => {
            const amount = INITIAL_SUPPLY.div(2);

            const expectedEth = await recipe.getEthToTokenOutputPrice(amount);
            const ethBalanceBefore = await signers[0].provider.getBalance(account);
            
            await recipe.ethToTokenSwapOutput(amount, constants.MaxUint256, {value: expectedEth.mul(2)});

            const sPBalance = await smartpool.balanceOf(account);
            expect(sPBalance).to.eq(amount.add(INITIAL_SUPPLY));

            const ethBalance = await signers[0].provider.getBalance(account);
            // expect(ethBalance).to.eq(ethBalanceBefore.sub(expectedEth));
        })
    })
});