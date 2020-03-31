/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";

import { PCTokenStorage } from "./PCTokenStorage";

export class PCTokenStorageFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(): Promise<PCTokenStorage> {
    return super.deploy() as Promise<PCTokenStorage>;
  }
  getDeployTransaction(): UnsignedTransaction {
    return super.getDeployTransaction();
  }
  attach(address: string): PCTokenStorage {
    return super.attach(address) as PCTokenStorage;
  }
  connect(signer: Signer): PCTokenStorageFactory {
    return super.connect(signer) as PCTokenStorageFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PCTokenStorage {
    return new Contract(address, _abi, signerOrProvider) as PCTokenStorage;
  }
}

const _abi = [
  {
    inputs: [],
    name: "ptSlot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b5060b88061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063ec565ffe14602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b60405180807f5043546f6b656e2e73746f726167652e6c6f636174696f6e0000000000000000815250601801905060405180910390208156fea2646970667358221220a3bd6ed9804f5e117dc6de693db64467b9414c825e0334d26aa64b66ec4e410d64736f6c63430006040033";
