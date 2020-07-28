pragma experimental ABIEncoderV2;
pragma solidity ^0.6.4;

import "../interfaces/IERC20.sol";
import {PV2SmartPoolStorage as P2Storage} from "../storage/PV2SmartPoolStorage.sol";

interface IPV2SmartPool is IERC20 {
  /**
    @notice Initialise smart pool. Can only be called once
    @param _bPool Address of the underlying bPool
    @param _name Token name
    @param _symbol Token symbol (ticker)
    @param _initialSupply Initial token supply
  */
  function init(
    address _bPool,
    string calldata _name,
    string calldata _symbol,
    uint256 _initialSupply
  ) external;

  /**
    @notice Set the address that can set public swap enabled or disabled. 
    Can only be called by the controller
    @param _swapSetter Address of the new swapSetter
  */
  function setPublicSwapSetter(address _swapSetter) external;

  /**
    @notice Set the address that can bind, unbind and rebind tokens.
    Can only be called by the controller
    @param _tokenBinder Address of the new token binder
  */
  function setTokenBinder(address _tokenBinder) external;

  /**
    @notice Enable or disable trading on the underlying balancer pool.
    Can only be called by the public swap setter
    @param _public Wether public swap is enabled or not
  */
  function setPublicSwap(bool _public) external;

  /**
    @notice Set the swap fee. Can only be called by the controller
    @param _swapFee The new swap fee. 10**18 == 100%. Max 10%
  */
  function setSwapFee(uint256 _swapFee) external;

  /**
    @notice Set the totalSuppy cap. Can only be called by the controller
    @param _cap New cap
  */
  function setCap(uint256 _cap) external;

  /**
    @notice Set the annual fee. Can only be called by the controller
    @param _newFee new fee 10**18 == 100% per 365 days. Max 10%
  */
  function setAnnualFee(uint256 _newFee) external;

  /**
    @notice Charge the outstanding annual fee
  */
  function chargeOutstandingAnnualFee() external;

  /**
    @notice Set the address that receives the annual fee. Can only be called by the controller
  */
  function setFeeRecipient(address _newRecipient) external;

  /**
    @notice Set the controller address. Can only be called by the current address
    @param _controller Address of the new controller
  */
  function setController(address _controller) external;

  /**
    @notice Set the circuit breaker address. Can only be called by the controller
    @param _newCircuitBreaker Address of the new circuit breaker
  */
  function setCircuitBreaker(address _newCircuitBreaker) external;

  /**
    @notice Enable or disable joining and exiting
    @param _newValue enabled or not
  */
  function setJoinExitEnabled(bool _newValue) external;

  /**
    @notice Trip the circuit breaker which disabled exit, join and swaps
  */
  function tripCircuitBreaker() external;

  /**
    @notice Update the weight of a token. Can only be called by the controller
    @param _token Token to adjust the weight of
    @param _newWeight New denormalized weight
  */
  function updateWeight(address _token, uint256 _newWeight) external;

  /** 
    @notice Gradually adjust the weights of a token. Can only be called by the controller
    @param _newWeights Target weights
    @param _startBlock Block to start weight adjustment
    @param _endBlock Block to finish weight adjustment
  */
  function updateWeightsGradually(
    uint256[] calldata _newWeights,
    uint256 _startBlock,
    uint256 _endBlock
  ) external;

  /**
    @notice Poke the weight adjustment
  */
  function pokeWeights() external;

  /**
    @notice Apply the adding of a token. Can only be called by the controller
  */
  function applyAddToken() external;

  /** 
    @notice Commit a token to be added. Can only be called by the controller
    @param _token Address of the token to add
    @param _balance Amount of token to add
    @param _denormalizedWeight Denormalized weight
  */
  function commitAddToken(
    address _token,
    uint256 _balance,
    uint256 _denormalizedWeight
  ) external;

  /**
    @notice Remove a token from the smart pool. Can only be called by the controller
    @param _token Address of the token to remove
  */
  function removeToken(address _token) external;

  /**
    @notice Approve bPool to pull tokens from smart pool
  */
  function approveTokens() external;

  /** 
    @notice Mint pool tokens, locking underlying assets
    @param _amount Amount of pool tokens
  */
  function joinPool(uint256 _amount) external;

  /**
    @notice Mint pool tokens, locking underlying assets. With front running protection
    @param _amount Amount of pool tokens
    @param _maxAmountsIn Maximum amounts of underlying assets
  */
  function joinPool(uint256 _amount, uint256[] calldata _maxAmountsIn) external;

  /**
    @notice Burn pool tokens and redeem underlying assets
    @param _amount Amount of pool tokens to burn
  */
  function exitPool(uint256 _amount) external;

  /**
    @notice Burn pool tokens and redeem underlying assets. With front running protection
    @param _amount Amount of pool tokens to burn
    @param _minAmountsOut Minimum amounts of underlying assets
  */
  function exitPool(uint256 _amount, uint256[] calldata _minAmountsOut) external;

  /**
    @notice Join with a single asset, given amount of token in
    @param _token Address of the underlying token to deposit
    @param _amountIn Amount of underlying asset to deposit
    @param _minPoolAmountOut Minimum amount of pool tokens to receive
  */
  function joinswapExternAmountIn(
    address _token,
    uint256 _amountIn,
    uint256 _minPoolAmountOut
  ) external returns (uint256);

  /**
    @notice Join with a single asset, given amount pool out
    @param _token Address of the underlying token to deposit
    @param _amountOut Amount of pool token to mint
    @param _maxAmountIn Maximum amount of underlying asset
  */
  function joinswapPoolAmountOut(
    address _token,
    uint256 _amountOut,
    uint256 _maxAmountIn
  ) external returns (uint256 tokenAmountIn);

  /**
    @notice Exit with a single asset, given pool amount in
    @param _token Address of the underlying token to withdraw
    @param _poolAmountIn Amount of pool token to burn
    @param _minAmountOut Minimum amount of underlying asset to withdraw
  */
  function exitswapPoolAmountIn(
    address _token,
    uint256 _poolAmountIn,
    uint256 _minAmountOut
  ) external returns (uint256 tokenAmountOut);

  /**
    @notice Exit with a single asset, given token amount out
    @param _token Address of the underlying token to withdraw
    @param _tokenAmountOut Amount of underlying asset to withdraw
    @param _maxPoolAmountIn Maximimum pool amount to burn
  */
  function exitswapExternAmountOut(
    address _token,
    uint256 _tokenAmountOut,
    uint256 _maxPoolAmountIn
  ) external returns (uint256 poolAmountIn);

  /**
    @notice Exit pool, ignoring some tokens
    @param _amount Amount of pool tokens to burn
    @param _lossTokens Addresses of tokens to ignore
  */
  function exitPoolTakingloss(uint256 _amount, address[] calldata _lossTokens) external;

  /**
    @notice Bind(add) a token to the pool
    @param _token Address of the token to bind
    @param _balance Amount of token to bind
    @param _denorm Denormalised weight
  */
  function bind(
    address _token,
    uint256 _balance,
    uint256 _denorm
  ) external;

  /**
    @notice Rebind(adjust) a token's weight or amount
    @param _token Address of the token to rebind
    @param _balance New token amount
    @param _denorm New denormalised weight
  */
  function rebind(
    address _token,
    uint256 _balance,
    uint256 _denorm
  ) external;

  /**
    @notice Unbind(remove) a token from the smart pool
    @param _token Address of the token to unbind
  */
  function unbind(address _token) external;

  /**
    @notice Get the controller address
    @return Address of the controller
  */
  function getController() external view returns (address);

  /**
    @notice Get the public swap setter address
    @return Address of the public swap setter
  */
  function getPublicSwapSetter() external view returns (address);

  /**
    @notice Get the address of the token binder
    @return Token binder address
  */
  function getTokenBinder() external view returns (address);

  /**
    @notice Get the circuit breaker address
    @return Circuit breaker address
  */
  function getCircuitBreaker() external view returns (address);

  /**
    @notice Get if public trading is enabled or not
    @return Enabled or not
  */
  function isPublicSwap() external view returns (bool);

  /** 
    @notice Get the current tokens in the smart pool
    @return Addresses of the tokens in the smart pool
  */
  function getTokens() external view returns (address[] memory);

  /**
    @notice Get the totalSupply cap
    @return The totalSupply cap
  */
  function getCap() external view returns (uint256);

  /**
    @notice Get the annual fee
    @return the annual fee
  */
  function getAnnualFee() external view returns (uint256);

  /**
    @notice Get the address receiving the fees
    @return Fee recipient address
  */
  function getFeeRecipient() external view returns (address);

  /**
    @notice Get the denormalized weight of a token
    @param _token Address of the token
    @return The denormalised weight of the token
  */
  function getDenormalizedWeight(address _token) external view returns (uint256);

  /**
    @notice Get all denormalized weights
    @return weights Denormalized weights
  */
  function getDenormalizedWeights() external view returns (uint256[] memory weights);

  /**
    @notice Get the target weights
    @return weights Target weights
  */
  function getNewWeights() external view returns (uint256[] memory weights);

  /**
    @notice Get weights at start of weight adjustment
    @return weights Start weights
  */
  function getStartWeights() external view returns (uint256[] memory weights);

  /**
    @notice Get start block of weight adjustment
    @return Start block
  */
  function getStartBlock() external view returns (uint256);

  /**
    @notice Get end block of weight adjustment
    @return End block
  */
  function getEndBlock() external view returns (uint256);

  /**
    @notice Get new token being added
    @return New token
  */
  function getNewToken() external view returns (P2Storage.NewToken memory);

  /**
    @notice Get if joining and exiting is enabled
    @return Enabled or not
  */
  function getJoinExitEnabled() external view returns (bool);

  /**
    @notice Get the underlying Balancer pool address
    @return Address of the underlying Balancer pool
  */
  function getBPool() external view returns (address);

  /**
    @notice Get the swap fee
    @return Swap fee
  */
  function getSwapFee() external view returns (uint256);

  /**
    @notice Not supported
  */
  function finalizeSmartPool() external view;

  /**
    @notice Not supported
  */
  function createPool(uint256 initialSupply) external view;

  /**
    @notice Calculate the amount of underlying needed to mint a certain amount
    @return tokens Addresses of the underlying tokens
    @return amounts Amounts of the underlying tokens
  */
  function calcTokensForAmount(uint256 _amount)
    external
    view
    returns (address[] memory tokens, uint256[] memory amounts);

  /**
    @notice Calculate the amount of pool tokens out given underlying in
    @param _token Underlying asset to deposit
    @param _amount Amount of underlying asset to deposit
    @return Pool amount out
  */
  function calcPoolOutGivenSingleIn(address _token, uint256 _amount)
    external
    view
    returns (uint256);

  /**
    @notice Calculate underlying deposit amount given pool amount out
    @param _token Underlying token to deposit
    @param _amount Amount of pool out
    @return Underlying asset deposit amount
  */
  function calcSingleInGivenPoolOut(address _token, uint256 _amount)
    external
    view
    returns (uint256);

  /**
    @notice Calculate underlying amount out given pool amount in
    @param _token Address of the underlying token to withdraw
    @param _amount Pool amount to burn
    @return Amount of underlying to withdraw
  */
  function calcSingleOutGivenPoolIn(address _token, uint256 _amount)
    external
    view
    returns (uint256);

  /**
    @notice Calculate pool amount in given underlying input
    @param _token Address of the underlying token to withdraw
    @param _amount Underlying output amount
    @return Pool burn amount
  */
  function calcPoolInGivenSingleOut(address _token, uint256 _amount)
    external
    view
    returns (uint256);
}
