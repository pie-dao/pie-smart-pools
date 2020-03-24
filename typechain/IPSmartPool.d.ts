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

interface IPSmartPoolInterface extends Interface {
  functions: {
    allowance: TypedFunctionDescription<{
      encode([_src, _dst]: [string, string]): string;
    }>;

    approve: TypedFunctionDescription<{
      encode([_dst, _amount]: [string, BigNumberish]): string;
    }>;

    balanceOf: TypedFunctionDescription<{ encode([_whom]: [string]): string }>;

    calcTokensForAmount: TypedFunctionDescription<{
      encode([_amount]: [BigNumberish]): string;
    }>;

    exitPool: TypedFunctionDescription<{
      encode([_amount]: [BigNumberish]): string;
    }>;

    getController: TypedFunctionDescription<{ encode([]: []): string }>;

    getTokens: TypedFunctionDescription<{ encode([]: []): string }>;

    joinPool: TypedFunctionDescription<{
      encode([_amount]: [BigNumberish]): string;
    }>;

    totalSupply: TypedFunctionDescription<{ encode([]: []): string }>;

    transfer: TypedFunctionDescription<{
      encode([_dst, _amount]: [string, BigNumberish]): string;
    }>;

    transferFrom: TypedFunctionDescription<{
      encode([_src, _dst, _amount]: [string, string, BigNumberish]): string;
    }>;
  };

  events: {
    Approval: TypedEventDescription<{
      encodeTopics([_src, _dst, _amount]: [
        string | null,
        string | null,
        null
      ]): string[];
    }>;

    Transfer: TypedEventDescription<{
      encodeTopics([_src, _dst, _amount]: [
        string | null,
        string | null,
        null
      ]): string[];
    }>;
  };
}

export class IPSmartPool extends Contract {
  connect(signerOrProvider: Signer | Provider | string): IPSmartPool;
  attach(addressOrName: string): IPSmartPool;
  deployed(): Promise<IPSmartPool>;

  on(event: EventFilter | string, listener: Listener): IPSmartPool;
  once(event: EventFilter | string, listener: Listener): IPSmartPool;
  addListener(eventName: EventFilter | string, listener: Listener): IPSmartPool;
  removeAllListeners(eventName: EventFilter | string): IPSmartPool;
  removeListener(eventName: any, listener: Listener): IPSmartPool;

  interface: IPSmartPoolInterface;

  functions: {
    allowance(_src: string, _dst: string): Promise<BigNumber>;

    approve(
      _dst: string,
      _amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    balanceOf(_whom: string): Promise<BigNumber>;

    calcTokensForAmount(
      _amount: BigNumberish
    ): Promise<{
      tokens: string[];
      amounts: BigNumber[];
      0: string[];
      1: BigNumber[];
    }>;

    exitPool(
      _amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    getController(): Promise<string>;

    getTokens(): Promise<string[]>;

    joinPool(
      _amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    totalSupply(): Promise<BigNumber>;

    transfer(
      _dst: string,
      _amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    transferFrom(
      _src: string,
      _dst: string,
      _amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;
  };

  allowance(_src: string, _dst: string): Promise<BigNumber>;

  approve(
    _dst: string,
    _amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  balanceOf(_whom: string): Promise<BigNumber>;

  calcTokensForAmount(
    _amount: BigNumberish
  ): Promise<{
    tokens: string[];
    amounts: BigNumber[];
    0: string[];
    1: BigNumber[];
  }>;

  exitPool(
    _amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  getController(): Promise<string>;

  getTokens(): Promise<string[]>;

  joinPool(
    _amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  totalSupply(): Promise<BigNumber>;

  transfer(
    _dst: string,
    _amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  transferFrom(
    _src: string,
    _dst: string,
    _amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  filters: {
    Approval(
      _src: string | null,
      _dst: string | null,
      _amount: null
    ): EventFilter;

    Transfer(
      _src: string | null,
      _dst: string | null,
      _amount: null
    ): EventFilter;
  };

  estimate: {
    allowance(_src: string, _dst: string): Promise<BigNumber>;

    approve(_dst: string, _amount: BigNumberish): Promise<BigNumber>;

    balanceOf(_whom: string): Promise<BigNumber>;

    calcTokensForAmount(_amount: BigNumberish): Promise<BigNumber>;

    exitPool(_amount: BigNumberish): Promise<BigNumber>;

    getController(): Promise<BigNumber>;

    getTokens(): Promise<BigNumber>;

    joinPool(_amount: BigNumberish): Promise<BigNumber>;

    totalSupply(): Promise<BigNumber>;

    transfer(_dst: string, _amount: BigNumberish): Promise<BigNumber>;

    transferFrom(
      _src: string,
      _dst: string,
      _amount: BigNumberish
    ): Promise<BigNumber>;
  };
}
