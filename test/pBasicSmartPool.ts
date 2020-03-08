// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import { MockTokenFactory } from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import { MockToken } from "@pie-dao/mock-contracts/typechain/MockToken";
import { ethers } from "@nomiclabs/buidler";
import { Signer, Wallet, utils, constants } from "ethers";
import chai from "chai";
import { deployContract, solidity } from "ethereum-waffle";

import { deployBalancerPool } from "../utils";
import { IBPool } from "../typechain/IBPool";
import { IBPoolFactory } from "../typechain/IBPoolFactory";
import { PBasicSmartPoolFactory } from "../typechain/PBasicSmartPoolFactory";
import { PBasicSmartPool } from "../typechain/PBasicSmartPool";

chai.use(solidity);
const { expect } = chai;
const { BigNumber } = utils;


const PLACE_HOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";
const NAME = "TEST POOL";
const SYMBOL = "TPL";

describe("PProxiedBalancerFactory", () => {
    let signers: Signer[];
    let account: string;
    let tokens: MockToken[];
    let pool: IBPool;
    let smartpool: PBasicSmartPool;

    beforeEach(async() => {
        signers = await ethers.signers();
        account = await signers[0].getAddress();

        pool = IBPoolFactory.connect((await deployBalancerPool(signers[0])), signers[0]);

        const tokenFactory = new MockTokenFactory(signers[0]);
        tokens = [];

        for(let i = 0; i < 8; i ++) {
            const token: MockToken = (await tokenFactory.deploy(`Mock ${i}`, `M${i}`, 18));
            await token.mint(account, utils.parseEther("1000000000000"));
            await token.approve(pool.address, constants.MaxUint256);
            pool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther.mul(2));
            tokens.push(token);
        }

        smartpool = await (new PBasicSmartPoolFactory(signers[0])).deploy(pool.address, NAME, SYMBOL, constants.WeiPerEther);
    });

    describe("init", async() => {
        it("Token symbol should be correct", async() => {
            const name = await smartpool.name();
            expect(name).to.eq(NAME);
        });
        it("Token name should be correct", async() => {
            const symbol = await smartpool.symbol();
            expect(symbol).to.eq(SYMBOL);
        });
        it("Initial supply should be correct", async() => {

        });
        it("Calling init when already initialized should fail", async() => {

        });
        it("Pool should not hold any non balancer pool tokens after init", async() => {

        });
    });

    describe("Joining and Exiting", async() => {
        it("Adding liquidity should work", async() => {

        });
        it("Adding liquidity when a transfer fails should fail", async() => {

        });
        it("After adding liquidity the pool should not hold any non balancer pool tokens", async() => {

        });
        it("Removing liquidity should work", async() => {

        });
        it("Removing liquidity should fail when removing more than balance", async() => {

        });
        it("After removing liquidity the pool should not hold any non balancer pool tokens", async() => {

        });
    })

});