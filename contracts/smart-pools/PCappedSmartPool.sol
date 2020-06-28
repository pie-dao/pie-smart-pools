pragma solidity 0.6.4;

import "./PBasicSmartPool.sol";
import "../interfaces/IPCappedSmartPool.sol";


contract PCappedSmartPool is PBasicSmartPool, IPCappedSmartPool {
  bytes32 public constant pcsSlot = keccak256("PCappedSmartPool.storage.location");

  event CapChanged(address indexed setter, uint256 oldCap, uint256 newCap);

  struct pcs {
    uint256 cap;
  }

  modifier withinCap() {
    _;
    require(totalSupply() < lpcs().cap, "PCappedSmartPool.withinCap: Cap limit reached");
  }

  /**
        @notice Set the maximum cap of the contract
        @param _cap New cap in wei
    */
  function setCap(uint256 _cap) external override onlyController noReentry {
    emit CapChanged(msg.sender, lpcs().cap, _cap);
    lpcs().cap = _cap;
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

  /**
        @notice Get the current cap
        @return The current cap in wei
    */
  function getCap() external view returns (uint256) {
    return lpcs().cap;
  }

  /**
        @notice Load the PCappedSmartPool storage
        @return s Pointer to the storage struct
    */
  function lpcs() internal pure returns (pcs storage s) {
    bytes32 loc = pcsSlot;
    assembly {
      s_slot := loc
    }
  }
}
