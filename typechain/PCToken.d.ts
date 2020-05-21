/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import {Contract, ContractTransaction, EventFilter, Signer} from "ethers";
import {Listener, Provider} from "ethers/providers";
import {Arrayish, BigNumber, BigNumberish, Interface} from "ethers/utils";
import {TransactionOverrides, TypedEventDescription, TypedFunctionDescription} from ".";

interface PCTokenInterface extends Interface {
  functions: {
    allowance: TypedFunctionDescription<{
      encode([_src, _dst]: [string, string]): string;
    }>;

    approve: TypedFunctionDescription<{
      encode([_dst, _amount]: [string, BigNumberish]): string;
    }>;

    balanceOf: TypedFunctionDescription<{encode([_whom]: [string]): string}>;

    decimals: TypedFunctionDescription<{encode([]: []): string}>;

    decreaseApproval: TypedFunctionDescription<{
      encode([_dst, _amount]: [string, BigNumberish]): string;
    }>;

    increaseApproval: TypedFunctionDescription<{
      encode([_dst, _amount]: [string, BigNumberish]): string;
    }>;

    name: TypedFunctionDescription<{encode([]: []): string}>;

    ptSlot: TypedFunctionDescription<{encode([]: []): string}>;

    symbol: TypedFunctionDescription<{encode([]: []): string}>;

    totalSupply: TypedFunctionDescription<{encode([]: []): string}>;

    transfer: TypedFunctionDescription<{
      encode([_dst, _amount]: [string, BigNumberish]): string;
    }>;

    transferFrom: TypedFunctionDescription<{
      encode([_src, _dst, _amount]: [string, string, BigNumberish]): string;
    }>;
  };

  events: {
    Approval: TypedEventDescription<{
      encodeTopics([_src, _dst, _amount]: [string | null, string | null, null]): string[];
    }>;

    Transfer: TypedEventDescription<{
      encodeTopics([_src, _dst, _amount]: [string | null, string | null, null]): string[];
    }>;
  };
}

export class PCToken extends Contract {
  connect(signerOrProvider: Signer | Provider | string): PCToken;
  attach(addressOrName: string): PCToken;
  deployed(): Promise<PCToken>;

  on(event: EventFilter | string, listener: Listener): PCToken;
  once(event: EventFilter | string, listener: Listener): PCToken;
  addListener(eventName: EventFilter | string, listener: Listener): PCToken;
  removeAllListeners(eventName: EventFilter | string): PCToken;
  removeListener(eventName: any, listener: Listener): PCToken;

  interface: PCTokenInterface;

  functions: {
    allowance(_src: string, _dst: string): Promise<BigNumber>;

    approve(
      _dst: string,
      _amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    balanceOf(_whom: string): Promise<BigNumber>;

    decimals(): Promise<number>;

    decreaseApproval(
      _dst: string,
      _amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    increaseApproval(
      _dst: string,
      _amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    name(): Promise<string>;

    ptSlot(): Promise<string>;

    symbol(): Promise<string>;

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

  decimals(): Promise<number>;

  decreaseApproval(
    _dst: string,
    _amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  increaseApproval(
    _dst: string,
    _amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  name(): Promise<string>;

  ptSlot(): Promise<string>;

  symbol(): Promise<string>;

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
    Approval(_src: string | null, _dst: string | null, _amount: null): EventFilter;

    Transfer(_src: string | null, _dst: string | null, _amount: null): EventFilter;
  };

  estimate: {
    allowance(_src: string, _dst: string): Promise<BigNumber>;

    approve(_dst: string, _amount: BigNumberish): Promise<BigNumber>;

    balanceOf(_whom: string): Promise<BigNumber>;

    decimals(): Promise<BigNumber>;

    decreaseApproval(_dst: string, _amount: BigNumberish): Promise<BigNumber>;

    increaseApproval(_dst: string, _amount: BigNumberish): Promise<BigNumber>;

    name(): Promise<BigNumber>;

    ptSlot(): Promise<BigNumber>;

    symbol(): Promise<BigNumber>;

    totalSupply(): Promise<BigNumber>;

    transfer(_dst: string, _amount: BigNumberish): Promise<BigNumber>;

    transferFrom(_src: string, _dst: string, _amount: BigNumberish): Promise<BigNumber>;
  };
}
