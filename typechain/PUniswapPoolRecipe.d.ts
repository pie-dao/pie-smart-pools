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

interface PUniswapPoolRecipeInterface extends Interface {
  functions: {
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

    init: TypedFunctionDescription<{
      encode([_pool, _uniswapFactory]: [string, string]): string;
    }>;

    pool: TypedFunctionDescription<{ encode([]: []): string }>;

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

    uniswapFactory: TypedFunctionDescription<{ encode([]: []): string }>;

    uprSlot: TypedFunctionDescription<{ encode([]: []): string }>;
  };

  events: {};
}

export class PUniswapPoolRecipe extends Contract {
  connect(signerOrProvider: Signer | Provider | string): PUniswapPoolRecipe;
  attach(addressOrName: string): PUniswapPoolRecipe;
  deployed(): Promise<PUniswapPoolRecipe>;

  on(event: EventFilter | string, listener: Listener): PUniswapPoolRecipe;
  once(event: EventFilter | string, listener: Listener): PUniswapPoolRecipe;
  addListener(
    eventName: EventFilter | string,
    listener: Listener
  ): PUniswapPoolRecipe;
  removeAllListeners(eventName: EventFilter | string): PUniswapPoolRecipe;
  removeListener(eventName: any, listener: Listener): PUniswapPoolRecipe;

  interface: PUniswapPoolRecipeInterface;

  functions: {
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
      _pool: string,
      _uniswapFactory: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    pool(): Promise<string>;

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

    uniswapFactory(): Promise<string>;

    uprSlot(): Promise<string>;
  };

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
    _pool: string,
    _uniswapFactory: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  pool(): Promise<string>;

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

  uniswapFactory(): Promise<string>;

  uprSlot(): Promise<string>;

  filters: {};

  estimate: {
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

    init(_pool: string, _uniswapFactory: string): Promise<BigNumber>;

    pool(): Promise<BigNumber>;

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

    uniswapFactory(): Promise<BigNumber>;

    uprSlot(): Promise<BigNumber>;
  };
}
