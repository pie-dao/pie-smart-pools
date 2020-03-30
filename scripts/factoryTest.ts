const bre = require("@nomiclabs/buidler");

import { PProxiedFactoryFactory } from '../typechain/PProxiedFactoryFactory';
import { Signer, Wallet, utils, constants } from "ethers";
import { MockTokenFactory } from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import { MockToken } from "@pie-dao/mock-contracts/typechain/MockToken";
import { BigNumberish } from 'ethers/utils';
import { WeiPerEther } from 'ethers/constants';

async function main() {
    const { ethers } = bre;
    const signers = await ethers.getSigners();
    const account = await signers[0].getAddress();

    let factory;

    if(process.env.FACTORY) {
        factory = PProxiedFactoryFactory.connect(process.env.FACTORY, signers[0]);
    } else {
        const factory = await (new PProxiedFactoryFactory(signers[0]).deploy(process.env.BALANCER_FACTORY));
    }

    const tokenFactory = new MockTokenFactory(signers[0]);

    const tokens: MockToken[] = [];

    for(let i = 0; i < 3; i ++) {
        const token: MockToken = (await tokenFactory.deploy(`Mock ${i}`, `M${i}`, 18));
        await (await token.mint(account, constants.WeiPerEther.mul(1000000))).wait(1);
        await (await token.approve(factory.address, constants.MaxUint256)).wait(1);
        tokens.push(token);
    }
    
    const addresses: string[]  = tokens.map(token => token.address);
    const amounts: BigNumberish[] = tokens.map((token, index) => constants.WeiPerEther.mul(index + 1));
    const weights = tokens.map(token => constants.WeiPerEther.mul(10));
    const cap = constants.WeiPerEther.mul(1);

    await(factory.newProxiedSmartPool("TEST", "TEST", constants.WeiPerEther.mul(10), addresses, amounts, weights, cap))

    // console.log(`Factory deployed at: ${factory.address}`);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});