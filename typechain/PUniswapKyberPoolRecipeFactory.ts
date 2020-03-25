/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";

import { PUniswapKyberPoolRecipe } from "./PUniswapKyberPoolRecipe";

export class PUniswapKyberPoolRecipeFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(): Promise<PUniswapKyberPoolRecipe> {
    return super.deploy() as Promise<PUniswapKyberPoolRecipe>;
  }
  getDeployTransaction(): UnsignedTransaction {
    return super.getDeployTransaction();
  }
  attach(address: string): PUniswapKyberPoolRecipe {
    return super.attach(address) as PUniswapKyberPoolRecipe;
  }
  connect(signer: Signer): PUniswapKyberPoolRecipeFactory {
    return super.connect(signer) as PUniswapKyberPoolRecipeFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PUniswapKyberPoolRecipe {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as PUniswapKyberPoolRecipe;
  }
}

const _abi = [
  {
    stateMutability: "payable",
    type: "fallback"
  },
  {
    inputs: [],
    name: "ETH",
    outputs: [
      {
        internalType: "address",
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
      },
      {
        internalType: "address",
        name: "_kyber",
        type: "address"
      },
      {
        internalType: "address[]",
        name: "_swapOnKyber",
        type: "address[]"
      },
      {
        internalType: "address",
        name: "_feeReciever",
        type: "address"
      }
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "oSlot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address"
      },
      {
        internalType: "bool",
        name: "_value",
        type: "bool"
      }
    ],
    name: "setKyberSwap",
    outputs: [],
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
    inputs: [
      {
        internalType: "address",
        name: "_newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "ukprSlot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
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
  "0x608060405234801561001057600080fd5b506128e6806100206000396000f3fe6080604052600436106100e15760003560e01c806395b68fe71161007f578063f090784311610059578063f090784314610512578063f09a40161461053d578063f2fde38b146105ae578063f3c98da6146105ff576100e2565b806395b68fe71461031b57806395e3c50b1461036a578063ce8e6f78146103cd576100e2565b80636b1d4db7116100bb5780636b1d4db7146101ca5780637237e031146102165780637da8ca17146102995780638322fff2146102c4576100e2565b80630b573638146100e45780632662a75d1461015057806359e948621461017b576100e2565b5b005b61013a600480360360608110156100fa57600080fd5b810190808035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061065c565b6040518082815260200191505060405180910390f35b34801561015c57600080fd5b50610165610c73565b6040518082815260200191505060405180910390f35b34801561018757600080fd5b506101b46004803603602081101561019e57600080fd5b8101908080359060200190929190505050610c8f565b6040518082815260200191505060405180910390f35b610200600480360360408110156101e057600080fd5b810190808035906020019092919080359060200190929190505050611043565b6040518082815260200191505060405180910390f35b34801561022257600080fd5b506102836004803603608081101561023957600080fd5b81019080803590602001909291908035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611058565b6040518082815260200191505060405180910390f35b3480156102a557600080fd5b506102ae611520565b6040518082815260200191505060405180910390f35b3480156102d057600080fd5b506102d961153c565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561032757600080fd5b506103546004803603602081101561033e57600080fd5b8101908080359060200190929190505050611554565b6040518082815260200191505060405180910390f35b34801561037657600080fd5b506103b76004803603606081101561038d57600080fd5b81019080803590602001909291908035906020019092919080359060200190929190505050611908565b6040518082815260200191505060405180910390f35b3480156103d957600080fd5b50610510600480360360a08110156103f057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561046d57600080fd5b82018360208201111561047f57600080fd5b803590602001918460208302840111640100000000831117156104a157600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061191f565b005b34801561051e57600080fd5b50610527611a56565b6040518082815260200191505060405180910390f35b34801561054957600080fd5b506105ac6004803603604081101561056057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611a8f565b005b3480156105ba57600080fd5b506105fd600480360360208110156105d157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611bec565b005b34801561060b57600080fd5b5061065a6004803603604081101561062257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611ca7565b005b600080610667611dc0565b90504284101561067657600080fd5b6060808260000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663371babdc886040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b1580156106ee57600080fd5b505afa158015610702573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250604081101561072c57600080fd5b810190808051604051939291908464010000000082111561074c57600080fd5b8382019150602082018581111561076257600080fd5b825186602082028301116401000000008211171561077f57600080fd5b8083526020830192505050908051906020019060200280838360005b838110156107b657808201518184015260208101905061079b565b50505050905001604052602001805160405193929190846401000000008211156107df57600080fd5b838201915060208201858111156107f557600080fd5b825186602082028301116401000000008211171561081257600080fd5b8083526020830192505050908051906020019060200280838360005b8381101561084957808201518184015260208101905061082e565b50505050905001604052505050915091506000935060008090505b82518110156109c85761089d83828151811061087c57fe5b602002602001015183838151811061089057fe5b6020026020010151611de5565b850194508281815181106108ad57fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1663095ea7b38560000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff167fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561097f57600080fd5b505af1158015610993573d6000803e3d6000fd5b505050506040513d60208110156109a957600080fd5b8101908080519060200190929190505050508080600101915050610864565b5047340393503373ffffffffffffffffffffffffffffffffffffffff166108fc479081150290604051600060405180830381858888f19350505050158015610a14573d6000803e3d6000fd5b508260000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166334e7a19f886040518263ffffffff1660e01b815260040180828152602001915050600060405180830381600087803b158015610a8c57600080fd5b505af1158015610aa0573d6000803e3d6000fd5b505050508260000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb868560000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015610b8657600080fd5b505afa158015610b9a573d6000803e3d6000fd5b505050506040513d6020811015610bb057600080fd5b81019080805190602001909291905050506040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b158015610c2a57600080fd5b505af1158015610c3e573d6000803e3d6000fd5b505050506040513d6020811015610c5457600080fd5b8101908080519060200190929190505050508393505050509392505050565b60405180806127c6602891396028019050604051809103902081565b600080610c9a611dc0565b90506060808260000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663371babdc866040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b158015610d1457600080fd5b505afa158015610d28573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052506040811015610d5257600080fd5b8101908080516040519392919084640100000000821115610d7257600080fd5b83820191506020820185811115610d8857600080fd5b8251866020820283011164010000000082111715610da557600080fd5b8083526020830192505050908051906020019060200280838360005b83811015610ddc578082015181840152602081019050610dc1565b5050505090500160405260200180516040519392919084640100000000821115610e0557600080fd5b83820191506020820185811115610e1b57600080fd5b8251866020820283011164010000000082111715610e3857600080fd5b8083526020830192505050908051906020019060200280838360005b83811015610e6f578082015181840152602081019050610e54565b50505050905001604052505050915091506000935060008090505b82518110156110375760008460010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166306f2bf62858481518110610ee157fe5b60200260200101516040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015610f4957600080fd5b505afa158015610f5d573d6000803e3d6000fd5b505050506040513d6020811015610f7357600080fd5b810190808051906020019092919050505090508073ffffffffffffffffffffffffffffffffffffffff166359e94862848481518110610fae57fe5b60200260200101516040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b158015610fea57600080fd5b505afa158015610ffe573d6000803e3d6000fd5b505050506040513d602081101561101457600080fd5b810190808051906020019092919050505086019550508080600101915050610e8a565b50839350505050919050565b600061105083833361065c565b905092915050565b600080611063611dc0565b90504284101561107257600080fd5b8060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330896040518463ffffffff1660e01b8152600401808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019350505050602060405180830381600087803b15801561115157600080fd5b505af1158015611165573d6000803e3d6000fd5b505050506040513d602081101561117b57600080fd5b81019080805190602001909291905050506111e1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603f8152602001806127ee603f913960400191505060405180910390fd5b8060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663be1d24ad876040518263ffffffff1660e01b815260040180828152602001915050600060405180830381600087803b15801561125857600080fd5b505af115801561126c573d6000803e3d6000fd5b5050505060608160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663aa6ca8086040518163ffffffff1660e01b815260040160006040518083038186803b1580156112dc57600080fd5b505afa1580156112f0573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250602081101561131a57600080fd5b810190808051604051939291908464010000000082111561133a57600080fd5b8382019150602082018581111561135057600080fd5b825186602082028301116401000000008211171561136d57600080fd5b8083526020830192505050908051906020019060200280838360005b838110156113a4578082015181840152602081019050611389565b505050509050016040525050509050600080905060008090505b82518110156114b95760008382815181106113d557fe5b6020026020010151905060008173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561145e57600080fd5b505afa158015611472573d6000803e3d6000fd5b505050506040513d602081101561148857600080fd5b810190808051906020019092919050505090506114a682828a61203c565b84019350505080806001019150506113be565b50868111611512576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603a81526020018061282d603a913960400191505060405180910390fd5b809350505050949350505050565b6040518080612867602391396023019050604051809103902081565b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee81565b60008061155f611dc0565b90506060808260000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663371babdc866040518263ffffffff1660e01b81526004018082815260200191505060006040518083038186803b1580156115d957600080fd5b505afa1580156115ed573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250604081101561161757600080fd5b810190808051604051939291908464010000000082111561163757600080fd5b8382019150602082018581111561164d57600080fd5b825186602082028301116401000000008211171561166a57600080fd5b8083526020830192505050908051906020019060200280838360005b838110156116a1578082015181840152602081019050611686565b50505050905001604052602001805160405193929190846401000000008211156116ca57600080fd5b838201915060208201858111156116e057600080fd5b82518660208202830111640100000000821117156116fd57600080fd5b8083526020830192505050908051906020019060200280838360005b83811015611734578082015181840152602081019050611719565b50505050905001604052505050915091506000935060008090505b82518110156118fc5760008460010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166306f2bf628584815181106117a657fe5b60200260200101516040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561180e57600080fd5b505afa158015611822573d6000803e3d6000fd5b505050506040513d602081101561183857600080fd5b810190808051906020019092919050505090508073ffffffffffffffffffffffffffffffffffffffff166395b68fe784848151811061187357fe5b60200260200101516040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b1580156118af57600080fd5b505afa1580156118c3573d6000803e3d6000fd5b505050506040513d60208110156118d957600080fd5b81019080805190602001909291905050508601955050808060010191505061174f565b50839350505050919050565b600061191684848433611058565b90509392505050565b60006119296122b5565b90506119358686611a8f565b838160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506119c4336122da565b60008090505b8351811015611a4d5760018260000160008684815181106119e757fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555080806001019150506119ca565b50505050505050565b60405180807f4f776e61626c652e73746f726167652e6c6f636174696f6e00000000000000008152506018019050604051809103902081565b6000611a99611dc0565b9050600073ffffffffffffffffffffffffffffffffffffffff168160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614611b61576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260138152602001807f616c726561647920696e697469616c697365640000000000000000000000000081525060200191505060405180910390fd5b828160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505050565b611bf4612327565b60000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611c9b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602781526020018061288a6027913960400191505060405180910390fd5b611ca4816122da565b50565b611caf612327565b60000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611d56576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602781526020018061288a6027913960400191505060405180910390fd5b6000611d606122b5565b9050818160000160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550505050565b6000806040518080612867602391396023019050604051809103902090508091505090565b600080611df06122b5565b90508060000160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16611e5757611e4f8484612369565b915050612036565b60004790508160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663cb3c28c773eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee4788308960018960020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166040518863ffffffff1660e01b8152600401808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018781526020018673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018481526020018381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001975050505050505050602060405180830381600087803b158015611fec57600080fd5b505af1158015612000573d6000803e3d6000fd5b505050506040513d602081101561201657600080fd5b810190808051906020019092919050505050600047905080820393505050505b92915050565b6000806120476122b5565b90508060000160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166120af576120a7858585612517565b9150506122ae565b60004790508160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663cb3c28c7878773eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee307fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60018960020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166040518863ffffffff1660e01b8152600401808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018781526020018673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018481526020018381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001975050505050505050602060405180830381600087803b15801561226457600080fd5b505af1158015612278573d6000803e3d6000fd5b505050506040513d602081101561228e57600080fd5b810190808051906020019092919050505050600047905081810393505050505b9392505050565b6000806040518080612867602391396023019050604051809103902090508091505090565b806122e3612327565b60000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60008060405180807f4f776e61626c652e73746f726167652e6c6f636174696f6e00000000000000008152506018019050604051809103902090508091505090565b600080612374611dc0565b905060008160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166306f2bf62866040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561241957600080fd5b505afa15801561242d573d6000803e3d6000fd5b505050506040513d602081101561244357600080fd5b810190808051906020019092919050505090508073ffffffffffffffffffffffffffffffffffffffff16636b1d4db747867fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6040518463ffffffff1660e01b815260040180838152602001828152602001925050506020604051808303818588803b1580156124d157600080fd5b505af11580156124e5573d6000803e3d6000fd5b50505050506040513d60208110156124fc57600080fd5b81019080805190602001909291905050509250505092915050565b600080612522611dc0565b905060008160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166306f2bf62876040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156125c757600080fd5b505afa1580156125db573d6000803e3d6000fd5b505050506040513d60208110156125f157600080fd5b810190808051906020019092919050505090508573ffffffffffffffffffffffffffffffffffffffff1663095ea7b382876040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561268b57600080fd5b505af115801561269f573d6000803e3d6000fd5b505050506040513d60208110156126b557600080fd5b8101908080519060200190929190505050508073ffffffffffffffffffffffffffffffffffffffff16637237e0318660017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff886040518563ffffffff1660e01b8152600401808581526020018481526020018381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001945050505050602060405180830381600087803b15801561277f57600080fd5b505af1158015612793573d6000803e3d6000fd5b505050506040513d60208110156127a957600080fd5b810190808051906020019092919050505092505050939250505056fe50556e69737761704b79626572506f6f6c5265636970652e73746f726167652e6c6f636174696f6e50556e6973776170506f6f6c5265636970652e746f6b656e546f4574685472616e73666572496e7075743a207472616e7366657246726f6d206661696c656450556e6973776170506f6f6c5265636970652e746f6b656e546f4574685472616e73666572496e7075743a206e6f7420656e6f7567682045544850556e6973776170506f6f6c5265636970652e73746f726167652e6c6f636174696f6e4f776e61626c652e6f6e6c794f776e65723a206d73672e73656e646572206e6f74206f776e6572a26469706673582212201ab305190f3c649dc0eaa06f4700454b33790952b481dbe046b148e81c58d08564736f6c63430006040033";
