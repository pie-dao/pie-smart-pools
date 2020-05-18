import { ethers } from "@nomiclabs/buidler";
import { Signer, Wallet, utils, constants } from "ethers";
import chai from "chai";
import { deployContract, solidity } from "ethereum-waffle";
import { PCappedSmartPool } from "../typechain/PCappedSmartPool";
import { PCappedSmartPoolFactory } from "../typechain/PCappedSmartPoolFactory";
import { IBPoolFactory } from "../typechain/IBPoolFactory";
import { IERC20Factory } from "../typechain/IERC20Factory";
import { IERC20 } from "../typechain/IERC20";
import { IBPool } from "../typechain/IBPool";
import { parseEther, BigNumber, bigNumberify } from "ethers/utils";
import { MockTokenFactory } from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import { MockToken } from "@pie-dao/mock-contracts/typechain/MockToken";

chai.use(solidity);
const { expect } = chai;



describe("MAINNET TEST", function() {
    this.timeout(10000000);
    let signers: Signer[];
    let account: string;
    let account2: string;
    let bPool: IBPool;
    let pool: PCappedSmartPool;
    let mockToken: MockToken;
    // Pool Alt Signer
    let poolAS: PCappedSmartPool;
    const tokens: IERC20[] = [];
    const mintAmount = parseEther("0.001");
    const poolAddress = process.env.POOL

    before(async() => {
        signers = await ethers.signers();
        account = await signers[0].getAddress();
        account2 = await signers[1].getAddress();
        pool = PCappedSmartPoolFactory.connect(poolAddress, signers[0]);
        poolAS = PCappedSmartPoolFactory.connect(poolAddress, signers[1]);
        bPool = IBPoolFactory.connect(await pool.getBPool(), signers[0]);

        const tokenAddresses = await bPool.getCurrentTokens();

        mockToken = await new MockTokenFactory(signers[0]).deploy("TEST", "TEST", 18);
        await (await mockToken.mint(account, parseEther("1000000"))).wait(1);
        await (await mockToken.approve(pool.address, constants.MaxUint256)).wait(1);

        // Approve tokens
        console.log("Approving tokens");
        for(const tokenAddress of tokenAddresses) {
          const token = IERC20Factory.connect(tokenAddress, signers[0]);
          tokens.push(token);

          if((await token.allowance(account, pool.address)).gt(constants.MaxUint256.div(2))) {
            // TODO make below more readable
            console.log(`Approving ${tokenAddress}`);
            await (await token.approve(pool.address, constants.MaxUint256)).wait(1);
          }
          
        }
    });
    it(`Controller should be correct`, async() => {
        const controller = await pool.getController();
        expect(controller).to.eq(account);
        console.log(controller);
    });
    it("Cap should be zero", async() => {
        const cap = await pool.getCap();
        expect(cap).to.eq(0);
    });
    it("Exiting the pool should work", async() => {
        const balanceBefore = await pool.balanceOf(account);
        console.log(await (await (await pool.exitPool(mintAmount, { gasLimit: 2000000})).wait(1)).transactionHash);
        const balanceAfter = await pool.balanceOf(account);
        expect(balanceAfter).to.eq(balanceBefore.sub(mintAmount));
    });
    it("Cap should be enforced", async() => {
        const balanceBefore = await pool.balanceOf(account);
        try {
            await (await pool.joinPool(parseEther("0.001"), {gasLimit: 2000000})).wait(1);
        } catch {
            // nothing
        }
        const balanceAfter = await pool.balanceOf(account);
        expect(balanceBefore).to.eq(balanceAfter);
    });
    it("Setting the cap should work", async() => {
        console.log((await (await pool.setCap(parseEther("1000000000"), { gasLimit: 2000000 })).wait(1)).transactionHash);
    });
    it("Joining the pool should work", async() => {
        const balanceBefore = await pool.balanceOf(account);
        await (await pool.joinPool(mintAmount, { gasLimit: 2000000 })).wait(1);
        const balanceAfter = await pool.balanceOf(account);
        expect(balanceAfter).to.eq(balanceBefore.add(mintAmount));
    });
    it("Exit pool taking loss should work", async() => {
        const exitAmount = parseEther("0.001")
        const tokenBalanceBefore = await tokens[0].balanceOf(account);
        const balanceBefore = await pool.balanceOf(account);
        await (await pool.exitPoolTakingloss(exitAmount, [tokens[0].address])).wait(1);
        const balanceAfter = await pool.balanceOf(account);
        const tokenBalanceAfter = await tokens[0].balanceOf(account);

        expect(balanceAfter).to.eq(balanceBefore.sub(exitAmount));
        expect(tokenBalanceBefore).to.eq(tokenBalanceAfter);
    });
    it("Setting the cap back to zero should work", async() => {
        await (await pool.setCap(0, { gasLimit: 2000000 })).wait(1);
    });
    it("Setting public swap setter from non controller should fail", async() => {
        const publicSwapSetterBefore = await poolAS.getPublicSwapSetter();
        try {
            await (await poolAS.setPublicSwapSetter(account2, { gasLimit: 2000000 })).wait(1);
        } catch {
            // 
        }
        const publicSwapSetterAfter = await poolAS.getPublicSwapSetter();
        expect(publicSwapSetterBefore).to.eq(publicSwapSetterAfter);
    });
    it("Setting public swap setter from the controller should work", async() => {
        await(await pool.setPublicSwapSetter(account, { gasLimit: 2000000 })).wait(1);
        const publicSwapSetter = await pool.getPublicSwapSetter();
        expect(publicSwapSetter).to.eq(account);
    });
    it("Setting public swap to true from the correct address should work", async() => {
        await(await pool.setPublicSwap(true, { gasLimit: 2000000 })).wait(1);
        const publicSwap = await bPool.isPublicSwap();
        expect(publicSwap).to.be.true;
    });
    it("Setting public swap to false from the correct address should work", async() => {
        await(await pool.setPublicSwap(false, { gasLimit: 2000000 })).wait(1);
        const publicSwap = await bPool.isPublicSwap();
        expect(publicSwap).to.be.false;
    });
    it("Setting public swap setter to zero again should work", async() => {
        await(await pool.setPublicSwapSetter(constants.AddressZero, { gasLimit: 2000000 })).wait(1);
        const publicSwapSetter = await pool.getPublicSwapSetter();
        expect(publicSwapSetter).to.eq(constants.AddressZero);
    });
    it("Changing tokenBinder should work", async() => {
        await(await pool.setTokenBinder(account, { gasLimit: 2000000 })).wait(1);
        const tokenBinder = await pool.getTokenBinder();
        expect(tokenBinder).to.eq(account);
    });
    it("Unbinding a token from a non tokenBinder should fail", async() => {
        try {
            await(await poolAS.unbind(tokens[0].address, { gasLimit: 2000000 })).wait(1);
        } catch {
            // 
        }
        const poolTokens = await poolAS.getTokens();
        expect(poolTokens[0]).to.eq(tokens[0].address);
    });
    it("Binding a token from a non tokenBinder should fail", async() => {
        const tokensBefore = await bPool.getCurrentTokens();
        try {
            await(await poolAS.bind(mockToken.address, constants.WeiPerEther, constants.WeiPerEther)).wait(1);
        } catch {
            // 
        }
        const tokensAfter = await bPool.getCurrentTokens();
        expect(tokensAfter).to.eql(tokensBefore);
    });
    it("Rebinding a token from a non tokenBinder should fail", async() => {
        const balanceBefore = await bPool.getBalance(tokens[0].address);
        try {
            await(await poolAS.rebind(tokens[0].address, balanceBefore.div(2), constants.WeiPerEther)).wait(1);
        } catch {
            // 
        }
        const balanceAfter = await bPool.getBalance(tokens[0].address);
        expect(balanceBefore).to.eq(balanceAfter);
    });
    it("Rebinding a token should work", async() => {
        // Reducing the weight of a token to make room to bind another one
        const balanceBefore = await bPool.getBalance(tokens[0].address);
        await(await pool.rebind(tokens[0].address, balanceBefore, constants.WeiPerEther, { gasLimit: 2000000 })).wait(1);

        const weight = await bPool.getDenormalizedWeight(tokens[0].address);
        expect(weight).to.eq(constants.WeiPerEther);
    });
    it("Binding a token should work", async() => {
        await(await pool.bind(mockToken.address, constants.WeiPerEther, constants.WeiPerEther, { gasLimit: 2000000 })).wait(1);
        const poolTokens = await bPool.getCurrentTokens();
        expect(poolTokens[poolTokens.length - 1]).to.eq(mockToken.address);
    });
    it("Unbinding a token should work", async() => {
        await (await pool.unbind(mockToken.address, { gasLimit: 2000000 })).wait(1);
        const poolTokens = await bPool.getCurrentTokens();
        expect(tokens.length).to.eq(poolTokens.length);
    });
    it("Setting the token binder to zero should work", async() => {
        await (await pool.setTokenBinder(constants.AddressZero, { gasLimit: 2000000 })).wait(1);
        const tokenBinder = await pool.getTokenBinder();
        expect(tokenBinder).to.eq(constants.AddressZero);
    });
});