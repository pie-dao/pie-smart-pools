pragma solidity ^0.6.4;

import "../interfaces/IERC20.sol";

interface IPV2SmartPool is IERC20 {
  function init(
    address _bPool,
    string calldata _name,
    string calldata _symbol,
    uint256 _initialSupply
  ) external;

  function setPublicSwapSetter(address _swapSetter) external;

  function setTokenBinder(address _tokenBinder) external;

  function setPublicSwap(bool _public) external;

  function setSwapFee(uint256 _swapFee) external;

  function setCap(uint256 _cap) external;

  function setAnnualFee(uint256 _newFee) external;

  function setFeeRecipient(address _newRecipient) external;

  function setController(address _controller) external;

  function setCircuitBreaker(address _newCircuitBreaker) external;

  function updateWeight(address _token, uint256 _newWeight) external;

  function updateWeightsGradually(
    uint256[] calldata _newWeights,
    uint256 _startBlock,
    uint256 _endBlock
  ) external;

  function pokeWeights() external;

  function applyAddToken() external;

  function commitAddToken(
    address _token,
    uint256 _balance,
    uint256 _denormalizedWeight
  ) external;

  function removeToken(address _token) external;

  function approveTokens() external;

  function joinPool(uint256 _amount) external;

  function joinPool(uint256 _amount, uint256[] calldata _maxAmountsIn) external;

  function exitPool(uint256 _amount) external;

  function exitPool(uint256 _amount, uint256[] calldata _minAmountsOut) external;

  function joinswapExternAmountIn(
    address _token,
    uint256 _amountIn,
    uint256 _minPoolAmountOut
  ) external returns (uint256);

  function joinswapPoolAmountOut(
    address _token,
    uint256 _amountOut,
    uint256 _maxAmountIn
  ) external returns (uint256 tokenAmountIn);

  function exitswapPoolAmountIn(address _token, uint256 _poolAmountIn)
    external
    returns (uint256 tokenAmountOut);

  function exitswapExternAmountOut(address _token, uint256 _tokenAmountOut)
    external
    returns (uint256 poolAmountIn);

  function exitPoolTakingloss(uint256 _amount, address[] calldata _lossTokens) external;

  function bind(
    address _token,
    uint256 _balance,
    uint256 _denorm
  ) external;

  function rebind(
    address _token,
    uint256 _balance,
    uint256 _denorm
  ) external;

  function unbind(address _token) external;

  function getController() external view returns (address);

  function getPublicSwapSetter() external view returns (address);

  function getTokenBinder() external view returns (address);

  function getCircuitBreaker() external view returns (address);

  function isPublicSwap() external view returns (bool);

  function getTokens() external view returns (address[] memory);

  function getCap() external view returns (uint256);

  function getAnnualFee() external view returns (uint256);

  function getDenormalizedWeight(address _token) external view returns (uint256);

  function getDenormalizedWeights() external view returns (uint256[] memory weights);

  function getBPool() external view returns (address);

  function getSwapFee() external view returns (uint256);

  function finalizeSmartPool() external view;

  function createPool(uint256 initialSupply) external view;

  function calcTokensForAmount(uint256 _amount)
    external
    view
    returns (address[] memory tokens, uint256[] memory amounts);

  function calcPoolOutGivenSingleIn(address _token, uint256 _amount)
    external
    view
    returns (uint256);

  function calcSingleInGivenPoolOut(address _token, uint256 _amount)
    external
    view
    returns (uint256);

  function calcSingleOutGivenPoolIn(address _token, uint256 _amount)
    external
    view
    returns (uint256);

  function calcPoolInGivenSingleOut(address _token, uint256 _amount)
    external
    view
    returns (uint256);
}
