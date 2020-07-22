import {EthereumProvider} from "@nomiclabs/buidler/types";

class TimeTraveler {
  private snapshotID: any;
  private ethereum: EthereumProvider;

  constructor(ethereum: EthereumProvider) {
    this.ethereum = ethereum;
  }

  public async snapshot() {
    console.log("snapshotting");
    const snapshot = await this.ethereum.send("evm_snapshot", []);
    await this.mine_blocks(1);
    this.snapshotID = snapshot;
    console.log("new snapshot", this.snapshotID);
    return;
  }

  public async revertSnapshot() {
    await this.ethereum.send("evm_revert", [this.snapshotID]);
    await this.mine_blocks(1);
    return;
  }

  public async mine_blocks(amount: number) {
    for (let i = 0; i < amount; i++) {
      await this.ethereum.send("evm_mine", []);
    }
  }
}

export default TimeTraveler;
