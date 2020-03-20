pragma solidity ^0.6.4;

interface IPSmartPool {
    function joinPool(uint256 _amount) external;
    function exitPool(uint256 _amount) external;
    function getController() external returns(address);
    function getTokens() external returns(address[] memory);
}