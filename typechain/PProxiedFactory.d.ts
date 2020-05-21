/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import {Contract, ContractTransaction, EventFilter, Signer} from "ethers";
import {Listener, Provider} from "ethers/providers";
import {Arrayish, BigNumber, BigNumberish, Interface} from "ethers/utils";
import {TransactionOverrides, TypedEventDescription, TypedFunctionDescription} from ".";

interface PProxiedFactoryInterface extends Interface {
  functions: {
    balancerFactory: TypedFunctionDescription<{encode([]: []): string}>;

    init: TypedFunctionDescription<{
      encode([_balancerFactory]: [string]): string;
    }>;

    isPool: TypedFunctionDescription<{encode([]: [string]): string}>;

    newProxiedSmartPool: TypedFunctionDescription<{
      encode([_name, _symbol, _initialSupply, _tokens, _amounts, _weights, _cap]: [
        string,
        string,
        BigNumberish,
        string[],
        BigNumberish[],
        BigNumberish[],
        BigNumberish
      ]): string;
    }>;

    oSlot: TypedFunctionDescription<{encode([]: []): string}>;

    pools: TypedFunctionDescription<{encode([]: [BigNumberish]): string}>;

    smartPoolImplementation: TypedFunctionDescription<{
      encode([]: []): string;
    }>;

    transferOwnership: TypedFunctionDescription<{
      encode([_newOwner]: [string]): string;
    }>;
  };

  events: {
    OwnerChanged: TypedEventDescription<{
      encodeTopics([previousOwner, newOwner]: [string | null, string | null]): string[];
    }>;

    SmartPoolCreated: TypedEventDescription<{
      encodeTopics([poolAddress, name, symbol]: [string | null, null, null]): string[];
    }>;
  };
}

export class PProxiedFactory extends Contract {
  connect(signerOrProvider: Signer | Provider | string): PProxiedFactory;
  attach(addressOrName: string): PProxiedFactory;
  deployed(): Promise<PProxiedFactory>;

  on(event: EventFilter | string, listener: Listener): PProxiedFactory;
  once(event: EventFilter | string, listener: Listener): PProxiedFactory;
  addListener(eventName: EventFilter | string, listener: Listener): PProxiedFactory;
  removeAllListeners(eventName: EventFilter | string): PProxiedFactory;
  removeListener(eventName: any, listener: Listener): PProxiedFactory;

  interface: PProxiedFactoryInterface;

  functions: {
    balancerFactory(): Promise<string>;

    init(_balancerFactory: string, overrides?: TransactionOverrides): Promise<ContractTransaction>;

    isPool(arg0: string): Promise<boolean>;

    newProxiedSmartPool(
      _name: string,
      _symbol: string,
      _initialSupply: BigNumberish,
      _tokens: string[],
      _amounts: BigNumberish[],
      _weights: BigNumberish[],
      _cap: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    oSlot(): Promise<string>;

    pools(arg0: BigNumberish): Promise<string>;

    smartPoolImplementation(): Promise<string>;

    transferOwnership(
      _newOwner: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;
  };

  balancerFactory(): Promise<string>;

  init(_balancerFactory: string, overrides?: TransactionOverrides): Promise<ContractTransaction>;

  isPool(arg0: string): Promise<boolean>;

  newProxiedSmartPool(
    _name: string,
    _symbol: string,
    _initialSupply: BigNumberish,
    _tokens: string[],
    _amounts: BigNumberish[],
    _weights: BigNumberish[],
    _cap: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  oSlot(): Promise<string>;

  pools(arg0: BigNumberish): Promise<string>;

  smartPoolImplementation(): Promise<string>;

  transferOwnership(
    _newOwner: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  filters: {
    OwnerChanged(previousOwner: string | null, newOwner: string | null): EventFilter;

    SmartPoolCreated(poolAddress: string | null, name: null, symbol: null): EventFilter;
  };

  estimate: {
    balancerFactory(): Promise<BigNumber>;

    init(_balancerFactory: string): Promise<BigNumber>;

    isPool(arg0: string): Promise<BigNumber>;

    newProxiedSmartPool(
      _name: string,
      _symbol: string,
      _initialSupply: BigNumberish,
      _tokens: string[],
      _amounts: BigNumberish[],
      _weights: BigNumberish[],
      _cap: BigNumberish
    ): Promise<BigNumber>;

    oSlot(): Promise<BigNumber>;

    pools(arg0: BigNumberish): Promise<BigNumber>;

    smartPoolImplementation(): Promise<BigNumber>;

    transferOwnership(_newOwner: string): Promise<BigNumber>;
  };
}
