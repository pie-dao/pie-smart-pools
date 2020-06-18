pragma solidity ^0.6.4;

import "./IPSmartPool.sol";


interface IPCappedSmartPool is IPSmartPool {
  function setCap(uint256 _cap) external;
}
