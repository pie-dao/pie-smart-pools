// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import {MockTokenFactory} from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import {MockToken} from "@pie-dao/mock-contracts/typechain/MockToken";
import {ethers} from "@nomiclabs/buidler";
import {Signer, Wallet, utils, constants} from "ethers";
import {BigNumber} from "ethers/utils";
import chai from "chai";
import {deployContract, solidity} from "ethereum-waffle";

import {deployBalancerPool} from "../utils";
import {IBPool} from "../typechain/IBPool";
import {IBPoolFactory} from "../typechain/IBPoolFactory";
import {PWeightControlledSmartPoolFactory} from "../typechain/PWeightControlledSmartPoolFactory";
import {PWeightControlledSmartPool} from "../typechain/PWeightControlledSmartPool";
import PWeightControlledSmartPoolArtifact from "../artifacts/PWeightControlledSmartPool.json";

chai.use(solidity);
const {expect} = chai;

const PLACE_HOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";
const NAME = "TEST POOL";
const SYMBOL = "TPL";
const INITIAL_SUPPLY = constants.WeiPerEther;

describe.only("PWeightControlledSmartPool ", function () {
  this.timeout(300000);
  let signers: Signer[];
  let account: string;
  let tokens: MockToken[];
  let pool: IBPool;
  let smartpool: PWeightControlledSmartPool;

  beforeEach(async () => {
    signers = await ethers.signers();
    account = await signers[0].getAddress();

    pool = IBPoolFactory.connect(await deployBalancerPool(signers[0]), signers[0]);

    const tokenFactory = new MockTokenFactory(signers[0]);
    tokens = [];

    for (let i = 0; i < 8; i++) {
      const token: MockToken = await tokenFactory.deploy(`Mock ${i}`, `M${i}`, 18);
      await token.mint(account, constants.WeiPerEther.mul(1000000));
      await token.mint(await signers[1].getAddress(), constants.WeiPerEther.mul(1000000));
      await token.approve(pool.address, constants.MaxUint256);
      pool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther.mul(2));
      tokens.push(token);
    }

    // Deploy this way to get the coverage provider to pick it up
    smartpool = (await deployContract(signers[0] as Wallet, PWeightControlledSmartPoolArtifact, [], {
      gasLimit: 100000000,
    })) as PWeightControlledSmartPool;
    await smartpool.init(pool.address, NAME, SYMBOL, INITIAL_SUPPLY);
    await smartpool.approveTokens();
    await pool.setController(smartpool.address);

    for (const token of tokens) {
      await token.approve(smartpool.address, constants.MaxUint256);
      // Attach alt signer to token and approve pool
      await MockTokenFactory.connect(token.address, signers[1]).approve(
        smartpool.address,
        constants.MaxUint256
      );
    }
  });

  describe("updateWeight()", async() => {
    it("Updating the weigth from a non controller should fail", async() => {
      smartpool = smartpool.connect(signers[1]);
      await expect(smartpool.updateWeight(tokens[0].address, constants.WeiPerEther)).to.be.revertedWith("PBasicSmartPool.onlyController: not controller");
    });
    it.only("Updating down should work", async() => {
        const weightBefore = await smartpool.getDenormalizedWeight(tokens[0].address);
        const totalWeightBefore = await pool.getTotalDenormalizedWeight();
        const poolTokenBalanceBefore = await tokens[0].balanceOf(pool.address);
        const userTokenBalanceBefore = await tokens[0].balanceOf(account);
        const userSmartPoolTokenBalanceBefore = await smartpool.balanceOf(account);
        const poolSmartPoolTokenTotalSupplyBefore = await smartpool.totalSupply();

        await smartpool.updateWeight(tokens[0].address, constants.WeiPerEther);

        const newWeight = await smartpool.getDenormalizedWeight(tokens[0].address);
        const totalWeightAfter = await pool.getTotalDenormalizedWeight();
        const poolTokenBalanceAfter = await tokens[0].balanceOf(pool.address);
        const userTokenBalanceAfter = await tokens[0].balanceOf(account);
        const userSmartPoolTokenBalanceAfter = await smartpool.balanceOf(account);
        const poolSmartPoolTokenTotalSupplyAfter= await smartpool.totalSupply();

        const expectedBurn = poolSmartPoolTokenTotalSupplyBefore.mul(totalWeightBefore.sub(totalWeightAfter)).div(totalWeightBefore);
        const expectedTokenWithdraw = poolTokenBalanceBefore.mul(newWeight).div(weightBefore);

        console.log((await tokens[0].balanceOf(smartpool.address)).toString());

        expect(newWeight).to.eq(constants.WeiPerEther);
        expect(userSmartPoolTokenBalanceAfter).to.eq(userSmartPoolTokenBalanceBefore.sub(expectedBurn));
        expect(poolSmartPoolTokenTotalSupplyAfter).to.eq(poolSmartPoolTokenTotalSupplyBefore.sub(expectedBurn));
        // expect(userTokenBalanceAfter).to.eq(userTokenBalanceBefore.add(expectedBurn));
        expect(poolTokenBalanceAfter).to.eq(poolTokenBalanceBefore.sub(expectedTokenWithdraw));
    });
    it("Updating down while the token transfer returns false should fail", async() => {

    });
    it("Updating down  while not having enough pool tokens should fail", async() => {

    });
    it("Updating up should work", async() => {
        
    });
    it("Updating up while not having enough of the underlying should fail", async() => {

    });
    it("Updating up while the underlying token is not approved should fail", async() => {

    });
  });

  describe("updateWeightsGradually()", async() => {
    it("Updating from a non controller should work", async() => {

    });
    it("Updating should work", async() => {

    });
    it("Updating the weight of a token above the max should fail", async() => {

    });
    it("Updating the weight of a token below the minimum should fail", async() => {

    });
    it("Updating the weights above the total max weight should fail", async() => {

    });
    it("Updating to a start block which is bigger before the end block should fail", async => {

    });
  });

  describe("pokeWeight()", async() => {
    it("Poking the weights should work", async() => {

    });
    it("Poking the weight after the end block should work", async() => {

    });
  });

});