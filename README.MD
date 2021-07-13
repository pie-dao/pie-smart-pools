# Pie Smart Pools

**Pie Smart Pools** are asset management agnostic(currently Balancer only) **D**ecentralised **T**raded **F**unds. They share a common interface to make them easy to integrate in other products.

All Smart Pools are fully upgradeable to make it easy to add features and optimise gas usage at later stages.

## Development

### Setup the dev enviroment

Clone this repo. And copy the contents of ``env.example`` to a new file called ``.env`` and edit the the relevant values inside. **DO NOT** share this file with anyone as it will contain sensitive data.

Install all dependencies: 
```
yarn
```
Build the project:
```
yarn build
```
Run the tests:
```
yarn test
```
Create coverage report:
```
yarn coverage
```

### Running mainnet/testnet test

To test a new implementation in testnet conditions. Set the implementation of a test pool to the new version and run the following script.

```
POOL=[POOL_ADDRESS] npx buidler test ./mainnet-test/test.ts --network [rinkeby|kovan|rinkeby]
```

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

## Managing pie smart pools

The pie smart pools have 4 roles which can manage the pie up to some extent: ``controller``, ``tokenBinder``, ``publicSwapSetter`` and the ``circuitBreaker``


### Setting public swap

Pie smart pools use an underlying balancer pool. If under some circumstances the swapping needs to be disabled/enabled this can be done by the ``publicSwapSetter`` by calling:

```solidity
function setPublicSwap(bool _public) external
```

### Setting the cap

Under some conditions it might be a good idea to limit the amount that can be minted to limit potential losses of new pools. You can set the cap by calling from the ``controller``:

```solidity
function setCap(uint256 _cap) external 
```

### Setting the swap fee

Every time a trade happens or the pool is joined with a single asset a swap fee is charged. To change the swap fee call from the ``controller``:

```solidity
function setSwapFee(uint256 _swapFee) external
```

### Enabling and disabling join and exit

During rebalances it is advised to disable joining and exiting the pool. This can be done by calling from the ``controller``:

```solidity
function setJoinExitEnabled(bool _newValue) external
```

### Setting the circuitBreaker address

The ``circuitBreaker`` is able to trip the circuit breaker. To set this address, call from the controller:

```solidity
function setCircuitBreaker(address _newCircuitBreaker) external
```

### Setting the annual fee

On every join and exit the annual fee is charged. 10**17 == 10%. A 10% fee is the maximum. To set the fee call from the ``controller``:

```solidity
function setAnnualFee(uint256 _newFee) external
```

### Setting fee recipient

To set the address which receives the annual fee call from the ``controller``:

```solidity
function setFeeRecipient(address _newRecipient) external
```

### Adding, removal, and weight adjustment of tokens through binding.

Binding and unbinding tokens removes them directly from the smart pool without changing the amount of pieTokens. These functions can only be called by the ``tokenBinder``. When using these functions the pool should be locked and ideally the per pool share value should remain the same. NOTE: adjusting weights should be done carefully and quickly to prevent value from the pool to be leaked out.

To unbind (remove) a token call from the ``tokenBinder``:

```solidity
function unbind(address _token) external
```

To bind (add) a token call from the ``tokenBinder``:

```solidity
function bind(address _token, uint256 _balance, uint256 _denorm) external
```

To rebind(change a tokens weight) call from the ``tokenBinder``:

```solidity
 function rebind(address _token, uint256 _balance, uint256 _denorm) external
```

### Circuit breaker

Due to the nature of unrestricted AMMs a single token in the pool experiencing catostrophic will result in all value of a pool being drained. To prevent this from happening a circuit breaker can be tripped by the ``circuitBreaker`` to halt swaps, joins and exits this can only be reverted by the ``controller``. This can be done by calling the following function from the ``circuitBreaker``:

```solidity
function tripCircuitBreaker() external
```

### Updating a token's weight

A token's weight can be updated while still retaining the per pool share value of a pie smart pool. When a token's weight goes down the underlying difference will be send to the controller and some of it's pool shares burned. When a tokens weight goes up the underlying difference will be send to the pool from the controller and pool shares will be minted. NOTE: Be aware of possible sandwhich attacks which could drain value from the pool during adjustment. To update a token's weight call from the controller:

```solidity
function updateWeight(address _token, uint256 _newWeight)
```

### Updating token weights gradually

By slowly shifting weights over the course of many blocks to the new tarket weights IL from the rebalancing can be minimised. Additionally this mechanic allows for deployment of so called "Liquidity Bootstrapping Pools" pools. Any pending weight adjust will be cancelled if new tokens are added or weights are adjusted. ``pokeWeights`` should be called periodically to trigger weight changes.

```solidity
function updateWeightsGradually(uint256[] calldata _newWeights, uint256 _startBlock, uint256 _endBlock) external
```

### Adding a token

For the sake of balancer smart pool compatibility adding a token is a two step process. During this process the price per pool share should remain the same because new pool shares are minted based on the weight of the new token added. To limit potential losses the weight should correctly reflect the market price of the token and the pool should be locked during adding. NOTE: always be wary about potential sandwhich attacks which could drain value from the pool

To add the token call the following two functions from the controller:

```solidity
function commitAddToken(address _token, uint256 _balance, uint256 _denormalizedWeight) external
```

```solidity
function applyAddToken() external
```

### Removing a token

When removing a token the tokens are send to the ``controller`` and in return pool tokens are burned from the ``controller``. This ensures the per pool share price should remain the same. Ideally you lock the pool to prevent value to be partially drained from the pool.

To remove a token call from the ``controller``:

```solidity
function removeToken(address _token) external
```