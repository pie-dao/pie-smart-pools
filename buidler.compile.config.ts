import { BuidlerConfig, usePlugin, task } from "@nomiclabs/buidler/config";

usePlugin("buidler-typechain");

interface ExtendedBuidlerConfig extends BuidlerConfig {
    [x:string]: any
}

const config: ExtendedBuidlerConfig = {
    solc: {
      version: "0.6.4",
      optimizer: {
        runs: 200,
        enabled: true,
      }
    },
    typechain: {
        outDir: "typechain",
        target: "ethers"
    },
}

export default config;