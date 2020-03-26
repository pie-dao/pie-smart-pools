/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractTransaction, EventFilter, Signer } from "ethers";
import { Listener, Provider } from "ethers/providers";
import { Arrayish, BigNumber, BigNumberish, Interface } from "ethers/utils";
import {
  TransactionOverrides,
  TypedEventDescription,
  TypedFunctionDescription
} from ".";

interface PUniswapKyberPoolRecipeInterface extends Interface {
  functions: {
    ETH: TypedFunctionDescription<{ encode([]: []): string }>;

    ethToTokenSwapOutput: TypedFunctionDescription<{
      encode([_tokens_bought, _deadline]: [BigNumberish, BigNumberish]): string;
    }>;

    ethToTokenTransferOutput: TypedFunctionDescription<{
      encode([_tokens_bought, _deadline, _recipient]: [
        BigNumberish,
        BigNumberish,
        string
      ]): string;
    }>;

    getEthToTokenOutputPrice: TypedFunctionDescription<{
      encode([_tokens_bought]: [BigNumberish]): string;
    }>;

    getTokenToEthInputPrice: TypedFunctionDescription<{
      encode([_tokens_sold]: [BigNumberish]): string;
    }>;

    init: TypedFunctionDescription<{ encode([,]: [string, string]): string }>;

    initUK: TypedFunctionDescription<{
      encode([_pool, _uniswapFactory, _kyber, _swapOnKyber, _feeReciever]: [
        string,
        string,
        string,
        string[],
        string
      ]): string;
    }>;

    oSlot: TypedFunctionDescription<{ encode([]: []): string }>;

    pool: TypedFunctionDescription<{ encode([]: []): string }>;

    setKyberSwap: TypedFunctionDescription<{
      encode([_token, _value]: [string, boolean]): string;
    }>;

    tokenToEthSwapInput: TypedFunctionDescription<{
      encode([_tokens_sold, _min_eth, _deadline]: [
        BigNumberish,
        BigNumberish,
        BigNumberish
      ]): string;
    }>;

    tokenToEthTransferInput: TypedFunctionDescription<{
      encode([_tokens_sold, _min_eth, _deadline, _recipient]: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        string
      ]): string;
    }>;

    transferOwnership: TypedFunctionDescription<{
      encode([_newOwner]: [string]): string;
    }>;

    ukprSlot: TypedFunctionDescription<{ encode([]: []): string }>;

    uprSlot: TypedFunctionDescription<{ encode([]: []): string }>;
  };

  events: {};
}

export class PUniswapKyberPoolRecipe extends Contract {
  connect(
    signerOrProvider: Signer | Provider | string
  ): PUniswapKyberPoolRecipe;
  attach(addressOrName: string): PUniswapKyberPoolRecipe;
  deployed(): Promise<PUniswapKyberPoolRecipe>;

  on(event: EventFilter | string, listener: Listener): PUniswapKyberPoolRecipe;
  once(
    event: EventFilter | string,
    listener: Listener
  ): PUniswapKyberPoolRecipe;
  addListener(
    eventName: EventFilter | string,
    listener: Listener
  ): PUniswapKyberPoolRecipe;
  removeAllListeners(eventName: EventFilter | string): PUniswapKyberPoolRecipe;
  removeListener(eventName: any, listener: Listener): PUniswapKyberPoolRecipe;

  interface: PUniswapKyberPoolRecipeInterface;

  functions: {
    ETH(): Promise<string>;

    ethToTokenSwapOutput(
      _tokens_bought: BigNumberish,
      _deadline: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    ethToTokenTransferOutput(
      _tokens_bought: BigNumberish,
      _deadline: BigNumberish,
      _recipient: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    getEthToTokenOutputPrice(_tokens_bought: BigNumberish): Promise<BigNumber>;

    getTokenToEthInputPrice(_tokens_sold: BigNumberish): Promise<BigNumber>;

    init(
      arg0: string,
      arg1: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    initUK(
      _pool: string,
      _uniswapFactory: string,
      _kyber: string,
      _swapOnKyber: string[],
      _feeReciever: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    oSlot(): Promise<string>;

    pool(): Promise<string>;

    setKyberSwap(
      _token: string,
      _value: boolean,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    tokenToEthSwapInput(
      _tokens_sold: BigNumberish,
      _min_eth: BigNumberish,
      _deadline: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    tokenToEthTransferInput(
      _tokens_sold: BigNumberish,
      _min_eth: BigNumberish,
      _deadline: BigNumberish,
      _recipient: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    transferOwnership(
      _newOwner: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    ukprSlot(): Promise<string>;

    uprSlot(): Promise<string>;
  };

  ETH(): Promise<string>;

  ethToTokenSwapOutput(
    _tokens_bought: BigNumberish,
    _deadline: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  ethToTokenTransferOutput(
    _tokens_bought: BigNumberish,
    _deadline: BigNumberish,
    _recipient: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  getEthToTokenOutputPrice(_tokens_bought: BigNumberish): Promise<BigNumber>;

  getTokenToEthInputPrice(_tokens_sold: BigNumberish): Promise<BigNumber>;

  init(
    arg0: string,
    arg1: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  initUK(
    _pool: string,
    _uniswapFactory: string,
    _kyber: string,
    _swapOnKyber: string[],
    _feeReciever: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  oSlot(): Promise<string>;

  pool(): Promise<string>;

  setKyberSwap(
    _token: string,
    _value: boolean,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  tokenToEthSwapInput(
    _tokens_sold: BigNumberish,
    _min_eth: BigNumberish,
    _deadline: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  tokenToEthTransferInput(
    _tokens_sold: BigNumberish,
    _min_eth: BigNumberish,
    _deadline: BigNumberish,
    _recipient: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  transferOwnership(
    _newOwner: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  ukprSlot(): Promise<string>;

  uprSlot(): Promise<string>;

  filters: {};

  estimate: {
    ETH(): Promise<BigNumber>;

    ethToTokenSwapOutput(
      _tokens_bought: BigNumberish,
      _deadline: BigNumberish
    ): Promise<BigNumber>;

    ethToTokenTransferOutput(
      _tokens_bought: BigNumberish,
      _deadline: BigNumberish,
      _recipient: string
    ): Promise<BigNumber>;

    getEthToTokenOutputPrice(_tokens_bought: BigNumberish): Promise<BigNumber>;

    getTokenToEthInputPrice(_tokens_sold: BigNumberish): Promise<BigNumber>;

    init(arg0: string, arg1: string): Promise<BigNumber>;

    initUK(
      _pool: string,
      _uniswapFactory: string,
      _kyber: string,
      _swapOnKyber: string[],
      _feeReciever: string
    ): Promise<BigNumber>;

    oSlot(): Promise<BigNumber>;

    pool(): Promise<BigNumber>;

    setKyberSwap(_token: string, _value: boolean): Promise<BigNumber>;

    tokenToEthSwapInput(
      _tokens_sold: BigNumberish,
      _min_eth: BigNumberish,
      _deadline: BigNumberish
    ): Promise<BigNumber>;

    tokenToEthTransferInput(
      _tokens_sold: BigNumberish,
      _min_eth: BigNumberish,
      _deadline: BigNumberish,
      _recipient: string
    ): Promise<BigNumber>;

    transferOwnership(_newOwner: string): Promise<BigNumber>;

    ukprSlot(): Promise<BigNumber>;

    uprSlot(): Promise<BigNumber>;
  };
}
