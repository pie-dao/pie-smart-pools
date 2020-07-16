// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import {ethers} from "@nomiclabs/buidler";
import {Signer, Wallet, utils, constants} from "ethers";
import chai from "chai";
import {deployContract, solidity} from "ethereum-waffle";
import {TestReentryProtection} from "../typechain/TestReentryProtection";
import TestReentryArtifact from "../artifacts/TestReentryProtection.json";

chai.use(solidity);
const {expect} = chai;

describe("ReentryProtection", function () {
  this.timeout(300000);
  let signers: Signer[];
  let account: string;
  let testContract: TestReentryProtection;

  beforeEach(async () => {
    signers = await ethers.signers();
    account = await signers[0].getAddress();

    // smartpool = await deployContract(signers[0] as Wallet, PBasicSmartPoolArtifact, [], {gasLimit: 8000000}) as PBasicSmartPool
    testContract = (await deployContract(
      signers[0] as Wallet,
      TestReentryArtifact,
      []
    )) as TestReentryProtection;
  });

  it("Should prevent reentry", async () => {
    await expect(testContract.test()).to.be.revertedWith(
      "ReentryProtection.noReentry: reentry detected"
    );
  });
});
