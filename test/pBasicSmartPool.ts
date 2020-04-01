// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import { MockTokenFactory } from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import { MockToken } from "@pie-dao/mock-contracts/typechain/MockToken";
import { ethers } from "@nomiclabs/buidler";
import { Signer, Wallet, utils, constants } from "ethers";
import { BigNumber } from "ethers/utils";
import chai from "chai";
import { deployContract, solidity } from "ethereum-waffle";

import { deployBalancerPool } from "../utils";
import { IBPool } from "../typechain/IBPool";
import { IBPoolFactory } from "../typechain/IBPoolFactory";
import { PBasicSmartPoolFactory } from "../typechain/PBasicSmartPoolFactory";
import { PBasicSmartPool } from "../typechain/PBasicSmartPool";
import PBasicSmartPoolArtifact from "../artifacts/PBasicSmartPool.json";

chai.use(solidity);
const { expect } = chai;


const PLACE_HOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";
const NAME = "TEST POOL";
const SYMBOL = "TPL";
const INITIAL_SUPPLY = constants.WeiPerEther;

describe("PBasicSmartPool", function() {
    this.timeout(30000)
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
            await token.mint(account, constants.WeiPerEther.mul(1000000));
            await token.mint(await signers[1].getAddress(), constants.WeiPerEther.mul(1000000));
            await token.approve(pool.address, constants.MaxUint256);
            pool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther.mul(1));
            tokens.push(token);
        }
        // Deploy this way to get the coverage provider to pick it up
        smartpool = await deployContract(signers[0] as Wallet, PBasicSmartPoolArtifact, [], {gasLimit: 100000000}) as PBasicSmartPool
        await smartpool.init(pool.address, NAME, SYMBOL, INITIAL_SUPPLY);
        await smartpool.approveTokens();
        
        await pool.setController(smartpool.address);
        
        for(const token of tokens) {
            await token.approve(smartpool.address, constants.MaxUint256);    
            // Attach alt signer to token and approve pool
            await MockTokenFactory.connect(token.address, signers[1]).approve(smartpool.address, constants.MaxUint256);
        }
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
            const initialSupply = await smartpool.totalSupply();
            expect(initialSupply).to.eq(INITIAL_SUPPLY);
        });
        it("Controller should be correctly set", async() => {
            const controller = await smartpool.getController();
            expect(controller).to.eq(account);
        })
        it("PublicSwapSetter should be correctly set", async() => {
            const publicSwapSetter = await smartpool.getPublicSwapSetter();
            expect(publicSwapSetter).to.eq(account);
        })
        it("Calling init when already initialized should fail", async() => {
            await expect(smartpool.init(PLACE_HOLDER_ADDRESS, NAME, SYMBOL, constants.WeiPerEther)).to.be.reverted;
        });
        it("Smart pool should not hold any non balancer pool tokens after init", async() => {
            const smartPoolBalances = await getTokenBalances(smartpool.address);
            expectZero(smartPoolBalances);
        });
        
    });

    describe("Controller functions", async() => {
        it("Setting a new controller should work", async() => {
            await smartpool.setController(PLACE_HOLDER_ADDRESS);
            const controller = await smartpool.getController();
            expect(controller).to.eq(PLACE_HOLDER_ADDRESS);
        });
        it("Setting a new controller from a non controller address should fail", async() => {
            smartpool = smartpool.connect(signers[1]);
            await expect(smartpool.setController(PLACE_HOLDER_ADDRESS)).to.be.reverted;
        })
        it("Setting public swap setter should work", async() => {
            await smartpool.setPublicSwapSetter(PLACE_HOLDER_ADDRESS);
            const publicSwapSetter = await smartpool.getPublicSwapSetter();
            expect(publicSwapSetter).to.eq(PLACE_HOLDER_ADDRESS);
        });
        it("Setting public swap setter from a non controller address should fail", async() => {
            smartpool = smartpool.connect(signers[1]);
            await expect(smartpool.setPublicSwapSetter(PLACE_HOLDER_ADDRESS)).to.be.reverted;
        });
        it("Setting public swap should work", async() => {
            await smartpool.setPublicSwap(true);
            const publicSwap = await smartpool.isPublicSwap();
            expect(publicSwap).to.be.true;
        });
        it("Setting public swap from a non publicSwapSetter address should fail", async() => {
            smartpool = smartpool.connect(signers[1]);
            await expect(smartpool.setPublicSwap(true)).to.be.reverted;
        });
        it("Setting the swap fee should work", async() => {
            const feeValue = constants.WeiPerEther.div(20);
            await smartpool.setSwapFee(feeValue);
            const swapFee = await smartpool.getSwapFee();
            expect(swapFee).to.eq(feeValue);
        });
        it("Setting the swap fee from a non controller address should fail", async() => {
            smartpool = smartpool.connect(signers[1]);
            await expect(smartpool.setSwapFee(constants.WeiPerEther.div(20))).to.be.reverted;
        });
    });

    describe("Joining and Exiting", async() => {
        it("Adding liquidity should work", async() => {
            const mintAmount = constants.WeiPerEther;
            await smartpool.joinPool(mintAmount);

            const balance = await smartpool.balanceOf(account);
            expect(balance).to.eq(mintAmount.add(INITIAL_SUPPLY));

            // TODO Check if token balances are correct
        });
        it("Adding liquidity when a transfer fails should fail", async() => {
            const mintAmount = constants.WeiPerEther;
            await tokens[1].approve(smartpool.address, constants.Zero);
            await expect(smartpool.joinPool(mintAmount)).to.be.reverted;
        });
        it("Removing liquidity should work", async() => {
            const removeAmount = constants.WeiPerEther.div(2);

            await smartpool.exitPool(removeAmount);
            const balance = await smartpool.balanceOf(account);
            expect(balance).to.eq(INITIAL_SUPPLY.sub(removeAmount));

            // TODO check all balances
        })
        it("Removing all liquidity should fail", async() => {
            const removeAmount = constants.WeiPerEther;
            await expect(smartpool.exitPool(removeAmount)).to.be.reverted;
        });
        it("Removing liquidity should fail when removing more than balance", async() => {
            // First mint some more in another account to not withdraw all total liquidity in the actual test
            const altSignerSmartPool = PBasicSmartPoolFactory.connect(smartpool.address, signers[1]);
            await altSignerSmartPool.joinPool(constants.WeiPerEther);

            await expect(smartpool.exitPool(INITIAL_SUPPLY.add(1))).to.be.reverted;
        });
    })

    async function getTokenBalances(address: string) {
        const balances:BigNumber[] = [];

        for(const token of tokens) {
            balances.push(await token.balanceOf(address));
        }

        return balances;
    }

    function expectZero(amounts: BigNumber[]) {
        for(const amount of amounts) {
            expect(amount).to.eq(0);
        }
    }
});