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
import {PBasicSmartPoolFactory} from "../typechain/PBasicSmartPoolFactory";
import {PCappedSmartPool} from "../typechain/PCappedSmartPool";
import PCappedSmartPoolArtifact from "../artifacts/PCappedSmartPool.json";

chai.use(solidity);
const {expect} = chai;

const PLACE_HOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";
const NAME = "TEST POOL";
const SYMBOL = "TPL";
const INITIAL_SUPPLY = constants.WeiPerEther;

describe("PCappedSmartPool", function () {
  this.timeout(300000);
  let signers: Signer[];
  let account: string;
  let tokens: MockToken[];
  let pool: IBPool;
  let smartpool: PCappedSmartPool;

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
      pool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther.mul(1));
      tokens.push(token);
    }

    // Deploy this way to get the coverage provider to pick it up
    smartpool = (await deployContract(signers[0] as Wallet, PCappedSmartPoolArtifact, [], {
      gasLimit: 100000000,
    })) as PCappedSmartPool;
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

  it("Cap should initially zero", async () => {
    const cap = await smartpool.getCap();
    expect(cap).to.eq(constants.Zero);
  });

  it("Setting the cap should work", async () => {
    const capValue = new BigNumber(100);
    await smartpool.setCap(capValue);
    const cap = await smartpool.getCap();
    expect(cap).to.eq(capValue);
  });

  it("Setting the cap from a non controller address should fail", async () => {
    await smartpool.setController(await signers[1].getAddress());
    await expect(smartpool.setCap(100)).to.be.reverted;
  });

  it("JoinPool with less than the cap should work", async () => {
    await smartpool.setCap(constants.MaxUint256);

    const mintAmount = constants.WeiPerEther;
    await smartpool.joinPool(mintAmount);

    const balance = await smartpool.balanceOf(account);
    expect(balance).to.eq(mintAmount.add(INITIAL_SUPPLY));
  });

  it("JoinPool with more than the cap should fail", async () => {
    const cap = constants.WeiPerEther.mul(100);
    await smartpool.setCap(cap);
    await expect(smartpool.joinPool(cap.add(1))).to.be.reverted;
  });
});
