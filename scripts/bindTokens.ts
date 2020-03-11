

const bre = require("@nomiclabs/buidler");

import { utils, constants } from "ethers";
import { IBPoolFactory } from "../typechain/IBPoolFactory";
import { IERC20Factory } from "../typechain/IERC20Factory";


const config = {
    pool: "0xbE7439d6AecDeBf67c0B1A9c08dd672Fd6353A27",
    units: 20,

    components: [
        // cDAI
        {
            token: "0x17C634e1081A2e02c83Bf008cd8E156415028F67",
            weight: 8,
            decimals: 8,
            amountPerUnit: 7.8677
        },
        // cUSDC
        {
            token: "0x3e62991D1e91871340dd57E78e45e470bc30e503",
            weight: 8,
            decimals: 8,
            amountPerUnit: 7.6178
        },
        // aDAI
        {
            token: "0x7A60c3482D96F0bCFE1fb48e94689669c6214e09",
            weight: 3,
            decimals: 18,
            amountPerUnit: 0.06
        },
        // aUSDT
        {
            token: "0x9Da3507f137c99297939dc885C158Be9e04e8510",
            weight: 3.5,
            decimals: 6,
            amountPerUnit: 0.07
        },
        // aUSDC
        {
            token: "0xF9155b335FAa6C184aB2F2c4D5939d86268F3668",
            weight: 10,
            decimals: 6,
            amountPerUnit: 0.2
        },
        // CHAI
        {
            token: "0x2e8294800691c71d9343Fb636dda9dEa46515843",
            weight: 17.5,
            decimals: 18,
            amountPerUnit: 0.344
        }

    ]
}

async function main() {
    // You can run Buidler tasks from a script.
    // For example, we make sure everything is compiled by running "compile"
    // await bre.run("compile");

    // console.log(bre);

    const { ethers } = bre;
    const signers = await ethers.getSigners();
    console.log(signers);
    const account = await signers[0].getAddress();
    const pool = IBPoolFactory.connect(config.pool, signers[0]);

    for (const component of config.components) {

        const weight = utils.parseUnits(component.weight.toString(), 18);
        const balance = utils.parseUnits(component.amountPerUnit.toString(), component.decimals).mul(config.units);
        const token = await IERC20Factory.connect(component.token, signers[0]);

        const allowance = await token.allowance(account, pool.address);

        if(allowance.lt(balance)) {
            const apprtx = await token.approve(pool.address, constants.MaxUint256);
            await apprtx.wait(1);
        }

        const tx = await pool.bind(component.token, balance, weight, {gasLimit: 5000000});
        const receipt = await tx.wait(1);

        console.log(`Token bound tx: ${receipt.transactionHash}`);
  
    }
  
    
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });