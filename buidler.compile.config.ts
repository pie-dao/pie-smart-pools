import { BuidlerConfig } from "@nomiclabs/buidler/config";

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
}

export default config;