pragma solidity ^0.6.2;

interface IBFactory {
    function newBPool() external returns (address);
}