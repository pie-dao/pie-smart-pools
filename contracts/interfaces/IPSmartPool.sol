pragma solidity ^0.6.4;


// Based on the liquidity bootstrapping pool by Balancer
interface IPSmartPool {
    function joinPool(uint256 _amount) external;
    function exitPool(uint256 _amount) external;
}