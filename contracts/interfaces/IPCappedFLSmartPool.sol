pragma solidity ^0.6.4;

interface IPCappedFLSmartPool {
    function flashLoan(address _receiver, address _token, uint256 _amount, bytes calldata _params) external;
}