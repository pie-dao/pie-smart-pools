const bre = require("@nomiclabs/buidler");

import { PProxiedFactoryFactory } from '../typechain/PProxiedFactoryFactory';

async function main() {
    const { ethers } = bre;
    const signers = await ethers.getSigners();
    const account = await signers[0].getAddress();
    const factory = await (new PProxiedFactoryFactory(signers[0]).deploy(process.env.BALANCER_FACTORY));

    console.log(`Factory deployed at: ${factory.address}`);
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});