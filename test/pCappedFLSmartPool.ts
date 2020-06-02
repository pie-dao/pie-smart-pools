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
import {PCappedFLSmartPool} from "../typechain/PCappedFLSmartPool";
import {TestFlashLoanReceiver} from "../typechain/TestFlashLoanReceiver";
import {TestFlashLoanReceiverFactory}  from "../typechain/TestFlashLoanReceiverFactory";
import PCappedFLSmartPoolArtifact from "../artifacts/PCappedFLSmartPool.json";

chai.use(solidity);
const {expect} = chai;

const PLACE_HOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";
const NAME = "TEST POOL";
const SYMBOL = "TPL";
const INITIAL_SUPPLY = constants.WeiPerEther;

describe.only("PCappedFLSmartPool", function () {
  this.timeout(300000);
  let signers: Signer[];
  let account: string;
  let tokens: MockToken[];
  let pool: IBPool;
  let smartpool: PCappedFLSmartPool;
  let flashLoanReceiver: TestFlashLoanReceiver;

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
        pool.bind(token.address, constants.WeiPerEther.mul(100), constants.WeiPerEther);
        tokens.push(token);
    }

    // Deploy this way to get the coverage provider to pick it up
    smartpool = (await deployContract(signers[0] as Wallet, PCappedFLSmartPoolArtifact, [], {
        gasLimit: 100000000,
    })) as PCappedFLSmartPool;

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

    flashLoanReceiver = await (new TestFlashLoanReceiverFactory(signers[0])).deploy(smartpool.address);
  });

  describe("flashLoan", async() => {

    it.only("Taking a flashLoan should work", async() => {
      console.log(account, "account");
      await smartpool.flashLoan(flashLoanReceiver.address, tokens[0].address, constants.WeiPerEther, "0x1337");
    });

  //   it("Not repaying flashLoan should fail", async() => {

  //   });

  //   it("Taking a flashLoan with a zero amount should fail", async() => {

  //   });

  //   it("Taking a too small flashLoan should fail", async() => {

  //   });

  //   it("FlashLoan should fail when transferFrom returns false", async() => {

  //   });

  //   it("FlashLoan should fail if transfer returns false", async() => {

  //   });

  //   it("FlashLoan should correctly pass the params", async() => {

  //   });

  //   it("FlashLoan should correctly pass the fee amount", async() => {

  //   });

  //   it("FlashLoan should correctly pass the token", async() => {

  //   });

  //   it("FlashLoan should correctly pass the amount", async() => {

  //   });

  // });

  // describe("Setting flashLoanFee", async() => {
  //   it("Setting the fee should work", async() => {

  //   })
  // });

});