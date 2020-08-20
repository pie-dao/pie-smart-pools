// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import {ethers} from "@nomiclabs/buidler";
import {Signer, Wallet, utils, constants} from "ethers";
import chai from "chai";
import {deployContract, solidity} from "ethereum-waffle";
import {MockTokenFactory} from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import {MockToken} from "@pie-dao/mock-contracts/typechain/MockToken";
import {TestLibSafeApprove} from "../typechain/TestLibSafeApprove";
import TestLibSafeApproveArtifact from "../artifacts/TestLibSafeApprove.json";

chai.use(solidity);
const {expect} = chai;

describe("LibSafeApproval", function () {
  this.timeout(300000);
  let signers: Signer[];
  let account: string;
  let testContract: TestLibSafeApprove;
  let mockToken: MockToken;

  beforeEach(async () => {
    signers = await ethers.signers();
    account = await signers[0].getAddress();

    mockToken = await (new MockTokenFactory(signers[0])).deploy("MOCK", "MOCK", 18);

    await mockToken.setDoKyberLikeApproval(true);

    testContract = (await deployContract(
      signers[0] as Wallet,
      TestLibSafeApproveArtifact,
      []
    )) as TestLibSafeApprove;
  });

  it("Doing double approvals which are not \"safe\" should fail", async () => {
    // no reason
    await expect(testContract.doubleApprovalUnsafe(mockToken.address)).to.be.reverted;
  });

  it("Doing double approvals which are \"safe\" should work", async() => {
    await testContract.doubleApprovalSafe(mockToken.address);
  });
});
