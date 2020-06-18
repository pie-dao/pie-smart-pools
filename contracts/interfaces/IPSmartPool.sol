pragma solidity ^0.6.4;

import "./IERC20.sol";


interface IPSmartPool is IERC20 {
  function init(
    address _bPool,
    string calldata _name,
    string calldata _symbol,
    uint256 _initialSupply
  ) external;

  function setPublicSwapSetter(address _swapSetter) external;

  function setTokenBinder(address _tokenBinder) external;

  function setController(address _controller) external;

  function approveTokens() external;

  function joinPool(uint256 _amount) external;

  function exitPool(uint256 _amount) external;

  function getController() external view returns (address);

  function getTokens() external view returns (address[] memory);

  function calcTokensForAmount(uint256 _amount)
    external
    view
    returns (address[] memory tokens, uint256[] memory amounts);
}
