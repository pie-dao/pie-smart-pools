

const bre = require("@nomiclabs/buidler");

import { utils, constants } from "ethers";
import { IBPoolFactory } from "../typechain/IBPoolFactory";
import { IERC20Factory } from "../typechain/IERC20Factory";


const config = {
    pool: "0xE80d0143E671224f5EA0bf46a2be7D57e12798f8",
    units: 20,

    components: [
        // cDAI
        {
            token: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
            weight: 8,
            decimals: 8,
            amountPerUnit: 7.8677
        },
        // cUSDC
        {
            token: "0x39aa39c021dfbae8fac545936693ac917d5e7563",
            weight: 8,
            decimals: 8,
            amountPerUnit: 7.6178
        },
        // aDAI
        {
            token: "0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d",
            weight: 3,
            decimals: 18,
            amountPerUnit: 0.06
        },
        // aUSDT
        {
            token: "0x71fc860F7D3A592A4a98740e39dB31d25db65ae8",
            weight: 3.5,
            decimals: 6,
            amountPerUnit: 0.07
        },
        // aUSDC
        {
            token: "0x9bA00D6856a4eDF4665BcA2C2309936572473B7E",
            weight: 10,
            decimals: 6,
            amountPerUnit: 0.2
        },
        // CHAI
        {
            token: "0x06af07097c9eeb7fd685c692751d5c66db49c215",
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