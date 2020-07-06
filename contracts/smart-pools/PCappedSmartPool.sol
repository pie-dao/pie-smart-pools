pragma solidity 0.6.4;

import "./PBasicSmartPool.sol";
import "../interfaces/IPCappedSmartPool.sol";

import {PCappedSmartPoolStorage as PCSStorage} from "../storage/PCappedSmartPoolStorage.sol";

contract PCappedSmartPool is PBasicSmartPool, IPCappedSmartPool {

  event CapChanged(address indexed setter, uint256 oldCap, uint256 newCap);

  modifier withinCap() {
    _;
    require(totalSupply() < PCSStorage.load().cap, "PCappedSmartPool.withinCap: Cap limit reached");
  }

  /**
        @notice Set the maximum cap of the contract
        @param _cap New cap in wei
    */
  function setCap(uint256 _cap) external override onlyController noReentry {
    emit CapChanged(msg.sender, PCSStorage.load().cap, _cap);
    PCSStorage.load().cap = _cap;
  }

  /**
        @notice Takes underlying assets and mints smart pool tokens. Enforces the cap
        @param _amount Amount of pool tokens to mint
    */
  function joinPool(uint256 _amount)
    external
    override(PBasicSmartPool, IPSmartPool)
    withinCap
    ready
    noReentry
  {
    LibJoinPool.joinPool(_amount);
  }

}