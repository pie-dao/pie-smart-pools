// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import {MockTokenFactory} from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import {MockToken} from "@pie-dao/mock-contracts/typechain/MockToken";
import {ethers} from "@nomiclabs/buidler";
import {Signer, Wallet, utils, constants} from "ethers";
import {BigNumber} from "ethers/utils";
import chai from "chai";
import {deployContract, solidity} from "ethereum-waffle";

import TestPCTokenArtifact from "../artifacts/TestPCToken.json";
import {TestPcToken} from "../typechain/TestPcToken";

chai.use(solidity);
const {expect} = chai;

const NAME = "TEST POOL";
const SYMBOL = "TPL";

describe("poolToken", function () {
  this.timeout(300000);
  let signers: Signer[];
  let account: string;
  let account2: string;
  let pcToken: TestPcToken;

  beforeEach(async () => {
    signers = await ethers.signers();
    account = await signers[0].getAddress();
    account2 = await signers[1].getAddress();

    pcToken = (await deployContract(signers[0] as Wallet, TestPCTokenArtifact, [NAME, SYMBOL], {
      gasLimit: 100000000,
    })) as TestPcToken;
  });

  describe("token metadata", async () => {
    it("Should have 18 decimals", async () => {
      const decimals = await pcToken.decimals();
      expect(decimals).to.equal(18);
    });
    it("Token name should be correct", async () => {
      const name = await pcToken.name();
      expect(name).to.eq(NAME);
    });
    it("Symbol should be correct", async () => {
      const symbol = await pcToken.symbol();
      expect(symbol).to.eq(SYMBOL);
    });
    it("Initial supply should be zero", async () => {
      const totalSupply = await pcToken.totalSupply();
      expect(totalSupply).to.eq(0);
    });
    it("After minting total supply should go up by minted amount", async () => {
      const mintAmount = constants.WeiPerEther.mul(2);
      // Mint in two tx to check if that works
      await pcToken.mint(account, mintAmount.div(2));
      await pcToken.mint(account, mintAmount.div(2));

      const totalSupply = await pcToken.totalSupply();
      expect(totalSupply).to.eq(mintAmount);
    });
    it("Burning tokens should lower the total supply", async () => {
      const mintAmount = constants.WeiPerEther.mul(2);
      await pcToken.mint(account, mintAmount);
      await pcToken.burn(account, mintAmount.div(2));
      const totalSupply = await pcToken.totalSupply();
      expect(totalSupply).to.eq(mintAmount.div(2));
    });
    it("Burning more than an address's balance should fail", async () => {
      const mintAmount = constants.WeiPerEther;
      await pcToken.mint(account, mintAmount);
      await expect(pcToken.burn(account, constants.WeiPerEther.add(1))).to.be.revertedWith(
        "ERR_INSUFFICIENT_BAL"
      );
    });
  });
  describe("balanceOf", async () => {
    it("Should return zero if no balance", async () => {
      const balance = await pcToken.balanceOf(account);
      expect(balance).to.eq(0);
    });
    it("Should return correct amount if account has some tokens", async () => {
      const mintAmount = constants.WeiPerEther.mul(2);
      await pcToken.mint(account, mintAmount);
      const balance = await pcToken.balanceOf(account);
      expect(balance).to.eq(mintAmount);
    });
  });
  describe("transfer", async () => {
    it("Should fail when the sender does not have enought balance", async () => {
      await pcToken.mint(account, constants.WeiPerEther);
      await expect(pcToken.transfer(account2, constants.WeiPerEther.add(1))).to.be.revertedWith(
        "ERR_INSUFFICIENT_BAL"
      );
    });
    it("Sending the entire balance should work", async () => {
      await pcToken.mint(account, constants.WeiPerEther);
      await pcToken.transfer(account2, constants.WeiPerEther);

      const accountBalance = await pcToken.balanceOf(account);
      const account2Balance = await pcToken.balanceOf(account2);

      expect(accountBalance).to.eq(0);
      expect(account2Balance).to.eq(constants.WeiPerEther);
    });
    it("Should emit transfer event", async () => {
      await pcToken.mint(account, constants.WeiPerEther);
      await expect(pcToken.transfer(account2, constants.WeiPerEther))
        .to.emit(pcToken, "Transfer")
        .withArgs(account, account2, constants.WeiPerEther);
    });
    it("Sending 0 tokens should work", async () => {
      await pcToken.mint(account, constants.WeiPerEther);
      await pcToken.transfer(account2, constants.Zero);

      const accountBalance = await pcToken.balanceOf(account);
      const account2Balance = await pcToken.balanceOf(account2);

      expect(accountBalance).to.eq(constants.WeiPerEther);
      expect(account2Balance).to.eq(0);
    });
  });
  describe("approve", async () => {
    it("Should emit event", async () => {
      await expect(pcToken.approve(account2, constants.WeiPerEther))
        .to.emit(pcToken, "Approval")
        .withArgs(account, account2, constants.WeiPerEther);
    });
    it("Should work when there was no approved amount before", async () => {
      await pcToken.approve(account2, constants.WeiPerEther);
      const approvalAmount = await pcToken.allowance(account, account2);
      expect(approvalAmount).to.eq(constants.WeiPerEther);
    });
    it("Should work when there was a approved amount before", async () => {
      await pcToken.approve(account2, constants.WeiPerEther);
      await pcToken.approve(account2, constants.WeiPerEther.mul(2));
      const approvalAmount = await pcToken.allowance(account, account2);
      expect(approvalAmount).to.eq(constants.WeiPerEther.mul(2));
    });
    it("Setting approval back to zero should work", async () => {
      await pcToken.approve(account2, constants.WeiPerEther);
      await pcToken.approve(account2, 0);
    });
  });
  describe("increaseApproval", async () => {
    it("Should emit event", async () => {
      await expect(pcToken.increaseApproval(account2, constants.WeiPerEther))
        .to.emit(pcToken, "Approval")
        .withArgs(account, account2, constants.WeiPerEther);
    });
    it("Should work when there was no approved amount before", async () => {
      await pcToken.increaseApproval(account2, constants.WeiPerEther);
      const approvalAmount = await pcToken.allowance(account, account2);
      expect(approvalAmount).to.eq(constants.WeiPerEther);
    });
    it("Should work when there was an approved amount before", async () => {
      await pcToken.increaseApproval(account2, constants.WeiPerEther);
      await pcToken.increaseApproval(account2, constants.WeiPerEther);
      const approvalAmount = await pcToken.allowance(account, account2);
      expect(approvalAmount).to.eq(constants.WeiPerEther.mul(2));
    });
    it("Increasing approval beyond max uint256 should fail", async () => {
      await pcToken.increaseApproval(account2, constants.MaxUint256);
      await expect(pcToken.increaseApproval(account2, constants.WeiPerEther)).to.be.revertedWith(
        "ERR_ADD_OVERFLOW"
      );
    });
  });
  describe("decreaseApproval", async () => {
    beforeEach(async () => {
      await pcToken.approve(account2, constants.WeiPerEther);
    });
    it("Should emit event", async () => {
      await expect(pcToken.decreaseApproval(account2, constants.WeiPerEther))
        .to.emit(pcToken, "Approval")
        .withArgs(account, account2, constants.Zero);
    });
    it("Decreasing part of the approval should work", async () => {
      await pcToken.decreaseApproval(account2, constants.WeiPerEther.div(2));
      const approvalAmount = await pcToken.allowance(account, account2);
      expect(approvalAmount).to.eq(constants.WeiPerEther.div(2));
    });
    it("Decreasing the entire approval should work", async () => {
      await pcToken.decreaseApproval(account2, constants.WeiPerEther);
      const approvalAmount = await pcToken.allowance(account, account2);
      expect(approvalAmount).to.eq(constants.Zero);
    });
    it("Decreasing more than the approval amount should set approval to zero", async () => {
      await pcToken.decreaseApproval(account2, constants.WeiPerEther.mul(2));
      const approvalAmount = await pcToken.allowance(account, account2);
      expect(approvalAmount).to.eq(constants.Zero);
    });
  });
  describe("transferFrom", async () => {
    beforeEach(async () => {
      await pcToken.mint(account, constants.WeiPerEther);
    });
    it("Should emit event", async () => {
      await pcToken.approve(account2, constants.WeiPerEther);
      pcToken = pcToken.connect(signers[1]);
      await expect(pcToken.transferFrom(account, account2, constants.WeiPerEther))
        .to.emit(pcToken, "Transfer")
        .withArgs(account, account2, constants.WeiPerEther);
    });
    it("Should work when sender has enough balance and approved spender", async () => {
      await pcToken.approve(account2, constants.WeiPerEther);
      pcToken = pcToken.connect(signers[1]);
      await pcToken.transferFrom(account, account2, constants.WeiPerEther);

      const accountBalance = await pcToken.balanceOf(account);
      const account2Balance = await pcToken.balanceOf(account2);
      const approvalAmount = await pcToken.allowance(account, account2);

      expect(accountBalance).to.eq(constants.Zero);
      expect(account2Balance).to.eq(constants.WeiPerEther);
      expect(approvalAmount).to.eq(constants.Zero);
    });
    it("Should fail when not enough allowance is set", async () => {
      await pcToken.approve(account2, constants.WeiPerEther.sub(1));
      pcToken = pcToken.connect(signers[1]);
      await expect(
        pcToken.transferFrom(account, account2, constants.WeiPerEther)
      ).to.be.revertedWith("ERR_PCTOKEN_BAD_CALLER");
    });
    it("Should fail when sender does not have enough balance", async () => {
      await pcToken.approve(account2, constants.WeiPerEther.add(1));
      pcToken = pcToken.connect(signers[1]);
      await expect(
        pcToken.transferFrom(account, account2, constants.WeiPerEther.add(1))
      ).to.be.revertedWith("ERR_INSUFFICIENT_BAL");
    });
    it("Should not change approval amount when it was set to max uint256", async () => {
      await pcToken.approve(account2, constants.MaxUint256);
      pcToken = pcToken.connect(signers[1]);
      await pcToken.transferFrom(account, account2, constants.WeiPerEther);
      const approvalAmount = await pcToken.allowance(account, account2);
      expect(approvalAmount).to.eq(constants.MaxUint256);
    });
  });
});
