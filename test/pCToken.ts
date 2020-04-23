// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import { MockTokenFactory } from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import { MockToken } from "@pie-dao/mock-contracts/typechain/MockToken";
import { ethers } from "@nomiclabs/buidler";
import { Signer, Wallet, utils, constants } from "ethers";
import { BigNumber } from "ethers/utils";
import chai from "chai";
import { deployContract, solidity } from "ethereum-waffle";

import TestPCTokenArtifact from "../artifacts/TestPCToken.json";
import { TestPCToken } from "../typechain/TestPCToken";

chai.use(solidity);
const { expect } = chai;

const NAME = "TEST POOL";
const SYMBOL = "TPL";

describe.only("PCappedSmartPool", function() {
    this.timeout(300000);
    let signers: Signer[];
    let account: string;
    let pcToken: TestPCToken;
    
    beforeEach(async() => {
        signers = await ethers.signers();
        account = await signers[0].getAddress();

        pcToken = await deployContract(signers[0] as Wallet, TestPCTokenArtifact, [NAME, SYMBOL], {gasLimit: 100000000}) as TestPCToken
    })

    describe("token metadata", async() => {
        it("Should have 18 decimals", async() => {
            const decimals = await pcToken.decimals();
            expect(decimals).to.equal(18);
        });
        it("Token name should be correct", async() => {
            const name = await pcToken.name();
            expect(name).to.eq(NAME);
        });
        it("Symbol should be correct", async() => {
            const symbol = await pcToken.symbol();
            expect(symbol).to.eq(SYMBOL);
        });
        it("Initial supply should be zero", async() => {
            const totalSupply = await pcToken.totalSupply();
            expect(totalSupply).to.eq(0);
        });
        it("After minting total supply should go up by minted amount", async() => {
            const mintAmount = constants.WeiPerEther.mul(2);
            // Mint in two tx to check if that works
            await pcToken.mint(account, mintAmount.div(2));
            await pcToken.mint(account, mintAmount.div(2));

            const totalSupply = await pcToken.totalSupply();
            expect(totalSupply).to.eq(mintAmount);
        });
        it("Burning tokens should lower the total supply", async() => {
            const mintAmount = constants.WeiPerEther.mul(2);
            await pcToken.mint(account, mintAmount);
            await pcToken.burn(account, mintAmount.div(2));
            const totalSupply = await pcToken.totalSupply();
            expect(totalSupply).to.eq(mintAmount.div(2));
        });
    });
    describe("balanceOf", async() => {
        it("Should return zero if no balance", async() => {
            const balance = await pcToken.balanceOf(account);
            expect(balance).to.eq(0);
        });
        it("Should return correct amount if account has some tokens", async() => {
            const mintAmount = constants.WeiPerEther.mul(2);
            await pcToken.mint(account, mintAmount);
            const balance = await pcToken.balanceOf(account);
            expect(balance).to.eq(mintAmount);
        });
    });
    describe("transfer", async() => {

    });
});