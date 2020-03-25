/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";

import { PUniswapPoolRecipe } from "./PUniswapPoolRecipe";

export class PUniswapPoolRecipeFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(): Promise<PUniswapPoolRecipe> {
    return super.deploy() as Promise<PUniswapPoolRecipe>;
  }
  getDeployTransaction(): UnsignedTransaction {
    return super.getDeployTransaction();
  }
  attach(address: string): PUniswapPoolRecipe {
    return super.attach(address) as PUniswapPoolRecipe;
  }
  connect(signer: Signer): PUniswapPoolRecipeFactory {
    return super.connect(signer) as PUniswapPoolRecipeFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PUniswapPoolRecipe {
    return new Contract(address, _abi, signerOrProvider) as PUniswapPoolRecipe;
  }
}

const _abi = [
  {
    stateMutability: "payable",
    type: "fallback"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokens_bought",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256"
      }
    ],
    name: "ethToTokenSwapOutput",
    outputs: [
      {
        internalType: "uint256",
        name: "eth_sold",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokens_bought",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address"
      }
    ],
    name: "ethToTokenTransferOutput",
    outputs: [
      {
        internalType: "uint256",
        name: "eth_sold",
        type: "uint256"
      }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokens_bought",
        type: "uint256"
      }
    ],
    name: "getEthToTokenOutputPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "eth_sold",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokens_sold",
        type: "uint256"
      }
    ],
    name: "getTokenToEthInputPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "eth_bought",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pool",
        type: "address"
      },
      {
        internalType: "address",
        name: "_uniswapFactory",
        type: "address"
      }
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "pool",
    outputs: [
      {
        internalType: "contract IPSmartPool",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokens_sold",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_min_eth",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256"
      }
    ],
    name: "tokenToEthSwapInput",
    outputs: [
      {
        internalType: "uint256",
        name: "eth_bought",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokens_sold",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_min_eth",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address"
      }
    ],
    name: "tokenToEthTransferInput",
    outputs: [
      {
        internalType: "uint256",
        name: "eth_bought",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "uniswapFactory",
    outputs: [
      {
        internalType: "contract IUniswapFactory",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "uprSlot",
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
  "0x608060405234801561001057600080fd5b50611cfd806100206000396000f3fe6080604052600436106100955760003560e01c80637da8ca17116100595780637da8ca17146102795780638bdb2afa146102a457806395b68fe7146102fb57806395e3c50b1461034a578063f09a4016146103ad57610096565b80630b5736381461009857806316f0115b1461010457806359e948621461015b5780636b1d4db7146101aa5780637237e031146101f657610096565b5b005b6100ee600480360360608110156100ae57600080fd5b810190808035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061041e565b6040518082815260200191505060405180910390f35b34801561011057600080fd5b50610119610a1a565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561016757600080fd5b506101946004803603602081101561017e57600080fd5b8101908080359060200190929190505050610a3f565b6040518082815260200191505060405180910390f35b6101e0600480360360408110156101c057600080fd5b810190808035906020019092919080359060200190929190505050610de2565b6040518082815260200191505060405180910390f35b34801561020257600080fd5b506102636004803603608081101561021957600080fd5b81019080803590602001909291908035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610df7565b6040518082815260200191505060405180910390f35b34801561028557600080fd5b5061028e6112aa565b6040518082815260200191505060405180910390f35b3480156102b057600080fd5b506102b96112c6565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561030757600080fd5b506103346004803603602081101561031e57600080fd5b81019080803590602001909291905050506112ec565b6040518082815260200191505060405180910390f35b34801561035657600080fd5b506103976004803603606081101561036d57600080fd5b8101908080359060200190929190803590602001909291908035906020019092919050505061168f565b6040518082815260200191505060405180910390f35b3480156103b957600080fd5b5061041c600480360360408110156103d057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506116a6565b005b60004283101561042d57600080fd5b6060806000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663371babdc876040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b1580156104a257600080fd5b505afa1580156104b6573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f8201168201806040525060408110156104e057600080fd5b810190808051604051939291908464010000000082111561050057600080fd5b8382019150602082018581111561051657600080fd5b825186602082028301116401000000008211171561053357600080fd5b8083526020830192505050908051906020019060200280838360005b8381101561056a57808201518184015260208101905061054f565b505050509050016040526020018051604051939291908464010000000082111561059357600080fd5b838201915060208201858111156105a957600080fd5b82518660208202830111640100000000821117156105c657600080fd5b8083526020830192505050908051906020019060200280838360005b838110156105fd5780820151818401526020810190506105e2565b50505050905001604052505050915091506000925060008090505b82518110156107795761065183828151811061063057fe5b602002602001015183838151811061064457fe5b60200260200101516117ee565b8401935082818151811061066157fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1663095ea7b36000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff167fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561073057600080fd5b505af1158015610744573d6000803e3d6000fd5b505050506040513d602081101561075a57600080fd5b8101908080519060200190929190505050508080600101915050610618565b5047340392503373ffffffffffffffffffffffffffffffffffffffff166108fc479081150290604051600060405180830381858888f193505050501580156107c5573d6000803e3d6000fd5b506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166334e7a19f876040518263ffffffff1660e01b815260040180828152602001915050600060405180830381600087803b15801561083a57600080fd5b505af115801561084e573d6000803e3d6000fd5b505050506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb856000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561092e57600080fd5b505afa158015610942573d6000803e3d6000fd5b505050506040513d602081101561095857600080fd5b81019080805190602001909291905050506040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b1580156109d257600080fd5b505af11580156109e6573d6000803e3d6000fd5b505050506040513d60208110156109fc57600080fd5b81019080805190602001909291905050505082925050509392505050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60006060806000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663371babdc856040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b158015610ab657600080fd5b505afa158015610aca573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052506040811015610af457600080fd5b8101908080516040519392919084640100000000821115610b1457600080fd5b83820191506020820185811115610b2a57600080fd5b8251866020820283011164010000000082111715610b4757600080fd5b8083526020830192505050908051906020019060200280838360005b83811015610b7e578082015181840152602081019050610b63565b5050505090500160405260200180516040519392919084640100000000821115610ba757600080fd5b83820191506020820185811115610bbd57600080fd5b8251866020820283011164010000000082111715610bda57600080fd5b8083526020830192505050908051906020019060200280838360005b83811015610c11578082015181840152602081019050610bf6565b50505050905001604052505050915091506000925060008090505b8251811015610dd7576000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166306f2bf62858481518110610c8157fe5b60200260200101516040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015610ce957600080fd5b505afa158015610cfd573d6000803e3d6000fd5b505050506040513d6020811015610d1357600080fd5b810190808051906020019092919050505090508073ffffffffffffffffffffffffffffffffffffffff166359e94862848481518110610d4e57fe5b60200260200101516040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b158015610d8a57600080fd5b505afa158015610d9e573d6000803e3d6000fd5b505050506040513d6020811015610db457600080fd5b810190808051906020019092919050505085019450508080600101915050610c2c565b508292505050919050565b6000610def83833361041e565b905092915050565b600042831015610e0657600080fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330886040518463ffffffff1660e01b8152600401808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019350505050602060405180830381600087803b158015610ee257600080fd5b505af1158015610ef6573d6000803e3d6000fd5b505050506040513d6020811015610f0c57600080fd5b8101908080519060200190929190505050610f72576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603f815260200180611c4f603f913960400191505060405180910390fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663be1d24ad866040518263ffffffff1660e01b815260040180828152602001915050600060405180830381600087803b158015610fe657600080fd5b505af1158015610ffa573d6000803e3d6000fd5b5050505060606000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663aa6ca8086040518163ffffffff1660e01b815260040160006040518083038186803b15801561106757600080fd5b505afa15801561107b573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f8201168201806040525060208110156110a557600080fd5b81019080805160405193929190846401000000008211156110c557600080fd5b838201915060208201858111156110db57600080fd5b82518660208202830111640100000000821117156110f857600080fd5b8083526020830192505050908051906020019060200280838360005b8381101561112f578082015181840152602081019050611114565b505050509050016040525050509050600080905060008090505b825181101561124457600083828151811061116057fe5b6020026020010151905060008173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156111e957600080fd5b505afa1580156111fd573d6000803e3d6000fd5b505050506040513d602081101561121357600080fd5b8101908080519060200190929190505050905061123182828961198d565b8401935050508080600101915050611149565b5085811161129d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603a815260200180611c8e603a913960400191505060405180910390fd5b8092505050949350505050565b6040518080611c2d602291396022019050604051809103902081565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60006060806000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663371babdc856040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b15801561136357600080fd5b505afa158015611377573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f8201168201806040525060408110156113a157600080fd5b81019080805160405193929190846401000000008211156113c157600080fd5b838201915060208201858111156113d757600080fd5b82518660208202830111640100000000821117156113f457600080fd5b8083526020830192505050908051906020019060200280838360005b8381101561142b578082015181840152602081019050611410565b505050509050016040526020018051604051939291908464010000000082111561145457600080fd5b8382019150602082018581111561146a57600080fd5b825186602082028301116401000000008211171561148757600080fd5b8083526020830192505050908051906020019060200280838360005b838110156114be5780820151818401526020810190506114a3565b50505050905001604052505050915091506000925060008090505b8251811015611684576000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166306f2bf6285848151811061152e57fe5b60200260200101516040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561159657600080fd5b505afa1580156115aa573d6000803e3d6000fd5b505050506040513d60208110156115c057600080fd5b810190808051906020019092919050505090508073ffffffffffffffffffffffffffffffffffffffff166395b68fe78484815181106115fb57fe5b60200260200101516040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b15801561163757600080fd5b505afa15801561164b573d6000803e3d6000fd5b505050506040513d602081101561166157600080fd5b8101908080519060200190929190505050850194505080806001019150506114d9565b508292505050919050565b600061169d84848433610df7565b90509392505050565b600073ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614611769576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260138152602001807f616c726561647920696e697469616c697365640000000000000000000000000081525060200191505060405180910390fd5b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b600080600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166306f2bf62856040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561189057600080fd5b505afa1580156118a4573d6000803e3d6000fd5b505050506040513d60208110156118ba57600080fd5b810190808051906020019092919050505090508073ffffffffffffffffffffffffffffffffffffffff16636b1d4db747857fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6040518463ffffffff1660e01b815260040180838152602001828152602001925050506020604051808303818588803b15801561194857600080fd5b505af115801561195c573d6000803e3d6000fd5b50505050506040513d602081101561197357600080fd5b810190808051906020019092919050505091505092915050565b600080600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166306f2bf62866040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015611a2f57600080fd5b505afa158015611a43573d6000803e3d6000fd5b505050506040513d6020811015611a5957600080fd5b810190808051906020019092919050505090508473ffffffffffffffffffffffffffffffffffffffff1663095ea7b382866040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b158015611af357600080fd5b505af1158015611b07573d6000803e3d6000fd5b505050506040513d6020811015611b1d57600080fd5b8101908080519060200190929190505050508073ffffffffffffffffffffffffffffffffffffffff16637237e0318560017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff876040518563ffffffff1660e01b8152600401808581526020018481526020018381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001945050505050602060405180830381600087803b158015611be757600080fd5b505af1158015611bfb573d6000803e3d6000fd5b505050506040513d6020811015611c1157600080fd5b8101908080519060200190929190505050915050939250505056fe556e6973776170506f6f6c5265636970652e73746f726167652e6c6f636174696f6e50556e6973776170506f6f6c5265636970652e746f6b656e546f4574685472616e73666572496e7075743a207472616e7366657246726f6d206661696c656450556e6973776170506f6f6c5265636970652e746f6b656e546f4574685472616e73666572496e7075743a206e6f7420656e6f75676820455448a26469706673582212205df614d69b1bf963ab7752bb5c601eaec691c800a78375b1c1a0fdcf67816f4164736f6c63430006040033";
