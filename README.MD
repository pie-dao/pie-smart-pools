# Pie Smart Pools

**Pie Smart Pools** are asset management agnostic(currently Balancer only) **D**ecentralised **T**raded **F**unds. They share a common interface to make them easy to integrate in other products.

All Smart Pools are fully upgradeable to make it easy to add features and optimise gas usage at later stages.

## Integration

### Adding and removing liquidity

To add liquidity approve the smart pool to pull the underlying tokens. And call:

```solidity
function joinPool(uint256 _amount) external;
```

To remove liquidity:

```solidity
function exitPool(uint256 _amount) external;
```

### Getting pool details

To get the underlying tokens call:

```solidity
function getTokens() external view returns(address[] memory);
```

To get the underlying tokens and amounts needed to mint a certain amount of pool shares call:

```solidity
function calcTokensForAmount(uint256 _amount) external view returns(address[] memory tokens, uint256[] memory amounts);
```

#### Balancer smart pool specific
Get the address of the underlying balancer pool:

```solidity
function getBPool() external view returns(address);
```

Get the swap fee:

```solidity
function getSwapFee() external view returns (uint256);
```

Get if trading is enabled on the underlying balancer pool:

```solidity
function isPublicSwap() external view returns (bool);
```


#### Capped pool specific
Some pools have a cap which limits the totalSupply of the pool shares token. To get the cap you call:

```solidity
function getCap() external view returns(uint256);
```

## Deployed Pools

| Name         | Symbol | Address                                                                                                                       | Type            |
|--------------|--------|-------------------------------------------------------------------------------------------------------------------------------|-----------------|
| PieDAO BTC++ | BTC++  | [0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd](https://https://etherscan.io/address/0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd) | Balancer Capped |

## Development

To install the dependencies and run the tests, run the following commands.

```
yarn install
yarn build
yarn test
```