// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import {MockTokenFactory} from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import {MockToken} from "@pie-dao/mock-contracts/typechain/MockToken";
import {ethers} from "@nomiclabs/buidler";
import {Signer, Wallet, utils, constants} from "ethers";
import {BigNumber, BigNumberish} from "ethers/utils";
import chai from "chai";
import {deployContract, solidity} from "ethereum-waffle";

import {deployBalancerPool} from "../utils";
import {IBPool} from "../typechain/IBPool";
import {IBPoolFactory} from "../typechain/IBPoolFactory";
import {PWeightControlledSmartPoolFactory} from "../typechain/PWeightControlledSmartPoolFactory";
import {PAdjustableSmartPool} from "../typechain/PAdjustableSmartPool";
import PAdjustableSmartPoolArtifact from "../artifacts/PAdjustableSmartPool.json";

chai.use(solidity);
const {expect} = chai;

const NAME = "TEST POOL";
const SYMBOL = "TPL";
const INITIAL_SUPPLY = constants.WeiPerEther;

describe.only("PAdjustableSmartPool ", function () {
  this.timeout(3000000);
  let signers: Signer[];
  let account: string;
  let account2: string;
  let tokens: MockToken[];
  let pool: IBPool;
  let smartpool: PAdjustableSmartPool;
  let startBlock: number;
  let endBlock: number;

  beforeEach(async () => {
    signers = await ethers.signers();
    account = await signers[0].getAddress();
    account2 = await signers[1].getAddress();

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
    smartpool = (await deployContract(
      signers[0] as Wallet,
      PAdjustableSmartPoolArtifact,
      [],
      {
        gasLimit: 100000000,
      }
    )) as PAdjustableSmartPool;
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

    startBlock = (await ethers.provider.getBlockNumber()) + 1;
    endBlock = startBlock + 100;
  });

  describe("updateWeight()", async () => {
    it("Updating the weigth from a non controller should fail", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(
        smartpool.updateWeight(tokens[0].address, constants.WeiPerEther)
      ).to.be.revertedWith("PBasicSmartPool.onlyController: not controller");
    });

    it("Updating down should work", async () => {
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
      const poolSmartPoolTokenTotalSupplyAfter = await smartpool.totalSupply();

      const expectedBurn = poolSmartPoolTokenTotalSupplyBefore
        .mul(totalWeightBefore.sub(totalWeightAfter))
        .div(totalWeightBefore);
      const expectedTokenWithdraw = poolTokenBalanceBefore.mul(newWeight).div(weightBefore);

      expect(newWeight).to.eq(constants.WeiPerEther);
      expect(userSmartPoolTokenBalanceAfter).to.eq(
        userSmartPoolTokenBalanceBefore.sub(expectedBurn)
      );
      expect(poolSmartPoolTokenTotalSupplyAfter).to.eq(
        poolSmartPoolTokenTotalSupplyBefore.sub(expectedBurn)
      );
      expect(userTokenBalanceAfter).to.eq(userTokenBalanceBefore.add(expectedTokenWithdraw));
      expect(poolTokenBalanceAfter).to.eq(poolTokenBalanceBefore.sub(expectedTokenWithdraw));
      expect(totalWeightAfter).to.eq(totalWeightBefore.sub(constants.WeiPerEther));
    });

    it("Updating down while the token transfer returns false should fail", async () => {
      await tokens[0].setTransferReturnFalse(true);
      await expect(
        smartpool.updateWeight(tokens[0].address, constants.WeiPerEther)
      ).to.be.revertedWith("ERR_ERC20_FALSE");
    });

    it("Updating down while not having enough pool tokens should fail", async () => {
      const balance = await smartpool.balanceOf(account);
      await smartpool.transfer(account2, balance);

      await expect(
        smartpool.updateWeight(tokens[0].address, constants.WeiPerEther)
      ).to.be.revertedWith("ERR_INSUFFICIENT_BAL");
    });

    it("Updating up should work", async () => {
      const weightBefore = await smartpool.getDenormalizedWeight(tokens[0].address);
      const totalWeightBefore = await pool.getTotalDenormalizedWeight();
      const poolTokenBalanceBefore = await tokens[0].balanceOf(pool.address);
      const userTokenBalanceBefore = await tokens[0].balanceOf(account);
      const userSmartPoolTokenBalanceBefore = await smartpool.balanceOf(account);
      const poolSmartPoolTokenTotalSupplyBefore = await smartpool.totalSupply();

      await smartpool.updateWeight(tokens[0].address, constants.WeiPerEther.mul(4));

      const newWeight = await smartpool.getDenormalizedWeight(tokens[0].address);
      const totalWeightAfter = await pool.getTotalDenormalizedWeight();
      const poolTokenBalanceAfter = await tokens[0].balanceOf(pool.address);
      const userTokenBalanceAfter = await tokens[0].balanceOf(account);
      const userSmartPoolTokenBalanceAfter = await smartpool.balanceOf(account);
      const poolSmartPoolTokenTotalSupplyAfter = await smartpool.totalSupply();

      const expectedMint = poolSmartPoolTokenTotalSupplyBefore
        .mul(totalWeightAfter.sub(totalWeightBefore))
        .div(totalWeightBefore);
      const expectedTokenDeposit = poolTokenBalanceBefore
        .mul(newWeight)
        .div(weightBefore)
        .sub(poolTokenBalanceBefore);

      expect(newWeight).to.eq(constants.WeiPerEther.mul(4));
      expect(userSmartPoolTokenBalanceAfter).to.eq(
        userSmartPoolTokenBalanceBefore.add(expectedMint)
      );
      expect(poolSmartPoolTokenTotalSupplyAfter).to.eq(
        poolSmartPoolTokenTotalSupplyBefore.add(expectedMint)
      );
      expect(userTokenBalanceAfter).to.eq(userTokenBalanceBefore.sub(expectedTokenDeposit));
      expect(poolTokenBalanceAfter).to.eq(poolTokenBalanceBefore.add(expectedTokenDeposit));
      expect(totalWeightAfter).to.eq(totalWeightBefore.add(constants.WeiPerEther.mul(2)));
    });

    it("Updating up while not having enough of the underlying should fail", async () => {
      const balance = await tokens[0].balanceOf(account);
      await tokens[0].transfer(account2, balance);

      await expect(
        smartpool.updateWeight(tokens[0].address, constants.WeiPerEther.mul(4))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Updating up while the token transferFrom returns false should fail", async () => {
      await tokens[0].setTransferFromReturnFalse(true);
      await expect(
        smartpool.updateWeight(tokens[0].address, constants.WeiPerEther.mul(4))
      ).to.be.revertedWith("TRANSFER_FAILED");
    });

    it("Updating up while the underlying token is not approved should fail", async () => {
      await tokens[0].approve(smartpool.address, 0);
      await expect(
        smartpool.updateWeight(tokens[0].address, constants.WeiPerEther.mul(4))
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });
  });

  describe("updateWeightsGradually()", async () => {
    const weightsFixtureUp = [
      constants.WeiPerEther.mul(4),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
    ];

    const weightsFixtureTokenAboveMax = [
      constants.WeiPerEther.mul(51),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
    ];

    const weightsFixtureTokenBelowMin = [
      constants.WeiPerEther.div(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
      constants.WeiPerEther.mul(2),
    ];

    const weightsFixtureTotalAboveMax = [
      constants.WeiPerEther.mul(10),
      constants.WeiPerEther.mul(10),
      constants.WeiPerEther.mul(10),
      constants.WeiPerEther.mul(10),
      constants.WeiPerEther.mul(10),
      constants.WeiPerEther.mul(10),
      constants.WeiPerEther.mul(10),
      constants.WeiPerEther.mul(10),
    ];

    it("Updating from a non controller should fail", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(
        smartpool.updateWeightsGradually(weightsFixtureUp, startBlock, endBlock)
      ).to.be.revertedWith("PBasicSmartPool.onlyController: not controller");
    });

    it("Updating should work", async () => {
      const currentWeights = await smartpool.getDenormalizedWeights();

      await smartpool.updateWeightsGradually(weightsFixtureUp, startBlock, endBlock);

      const newWeights = await smartpool.getNewWeights();
      const newCurrentWeights = await smartpool.getDenormalizedWeights();

      expect(newWeights).to.eql(weightsFixtureUp);
      expect(newCurrentWeights).to.eql(currentWeights);
    });

    it("Setting a start block in the past should set it to the current block", async () => {
      const currentWeights = await smartpool.getDenormalizedWeights();

      await smartpool.updateWeightsGradually(weightsFixtureUp, 0, endBlock);
      const currentBlock = await ethers.provider.getBlockNumber();

      const newWeights = await smartpool.getNewWeights();
      const newCurrentWeights = await smartpool.getDenormalizedWeights();
      const startBlockVal = await smartpool.getStartBlock();

      expect(startBlockVal).to.eq(currentBlock);

      expect(newWeights).to.eql(weightsFixtureUp);
      expect(newCurrentWeights).to.eql(currentWeights);
    });

    it("Updating the weight of a token above the max should fail", async () => {
      await expect(
        smartpool.updateWeightsGradually(weightsFixtureTokenAboveMax, startBlock, endBlock)
      ).to.be.revertedWith("ERR_WEIGHT_ABOVE_MAX");
    });

    it("Updating the weight of a token below the minimum should fail", async () => {
      await expect(
        smartpool.updateWeightsGradually(weightsFixtureTokenBelowMin, startBlock, endBlock)
      ).to.be.revertedWith("ERR_WEIGHT_BELOW_MIN");
    });

    it("Updating the weights above the total max weight should fail", async () => {
      await expect(
        smartpool.updateWeightsGradually(weightsFixtureTotalAboveMax, startBlock, endBlock)
      ).to.be.revertedWith("ERR_MAX_TOTAL_WEIGHT");
    });

    it("Updating to a start block which is bigger before the end block should fail", async () => {
      await expect(
        smartpool.updateWeightsGradually(weightsFixtureUp, endBlock + 1, endBlock)
      ).to.be.revertedWith(
        "PWeightControlledSmartPool.updateWeightsGradually: End block must be after start block"
      );
    });
  });

  describe("pokeWeight()", async () => {
    const weigthsFixturePokeWeightsUp = [
      constants.WeiPerEther.mul(4),
      constants.WeiPerEther.mul(4),
      constants.WeiPerEther.mul(4),
      constants.WeiPerEther.mul(4),
      constants.WeiPerEther.mul(4),
      constants.WeiPerEther.mul(4),
      constants.WeiPerEther.mul(4),
      constants.WeiPerEther.mul(4),
    ];

    const weigthsFixturePokeWeightsDown = [
      constants.WeiPerEther.mul(1),
      constants.WeiPerEther.mul(1),
      constants.WeiPerEther.mul(1),
      constants.WeiPerEther.mul(1),
      constants.WeiPerEther.mul(1),
      constants.WeiPerEther.mul(1),
      constants.WeiPerEther.mul(1),
      constants.WeiPerEther.mul(1),
    ];

    it("Poking the weights up should work", async () => {
      await smartpool.updateWeightsGradually(weigthsFixturePokeWeightsUp, startBlock, endBlock);
      const weightsBefore = await smartpool.getDenormalizedWeights();
      await smartpool.pokeWeights();
      const currentBlock = await ethers.provider.getBlockNumber();
      const weightsAfter = await smartpool.getDenormalizedWeights();

      for (let i = 0; i < weightsAfter.length; i++) {
        const expectedIncrease = weigthsFixturePokeWeightsUp[i]
          .sub(weightsBefore[i])
          .mul(currentBlock - startBlock)
          .div(endBlock - startBlock);
        expect(weightsAfter[i]).to.eq(
          weightsBefore[i].add(expectedIncrease),
          "Weight increase incorrect"
        );
      }
    });

    it("Poking the weights down should work", async () => {
      await smartpool.updateWeightsGradually(weigthsFixturePokeWeightsDown, startBlock, endBlock);
      const weightsBefore = await smartpool.getDenormalizedWeights();
      await smartpool.pokeWeights();
      const currentBlock = await ethers.provider.getBlockNumber();
      const weightsAfter = await smartpool.getDenormalizedWeights();

      for (let i = 0; i < weightsAfter.length; i++) {
        const expectedDecrease = weightsBefore[i]
          .sub(weigthsFixturePokeWeightsDown[i])
          .mul(currentBlock - startBlock)
          .div(endBlock - startBlock);
        expect(weightsAfter[i]).to.eq(
          weightsBefore[i].sub(expectedDecrease),
          "Weight decrease incorrect"
        );
      }
    });

    it("Poking the weight after the end block should work", async () => {
      await smartpool.updateWeightsGradually(weigthsFixturePokeWeightsUp, startBlock, endBlock);
      await mine_blocks(200);

      await smartpool.pokeWeights();
      const weightsAfter = await smartpool.getDenormalizedWeights();

      expect(weightsAfter).to.eql(weigthsFixturePokeWeightsUp, "Weight increase incorrect");
    });
  });
});

async function mine_blocks(amount: number) {
  for (let i = 0; i < amount; i++) {
    await ethers.provider.send("evm_mine", []);
  }
}
