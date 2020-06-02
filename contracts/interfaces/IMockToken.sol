pragma solidity ^0.6.4;

import "../interfaces/IERC20.sol";
interface IMockToken is IERC20 {
    function mint(address _to, uint256 _amount) external;
}