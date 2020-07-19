pragma solidity 0.6.4;

library ReentryProtectionStorage {
  bytes32 public constant rpSlot = keccak256("ReentryProtection.storage.location");
  struct StorageStruct {
    uint256 lockCounter;
  }

  /**
        @notice Load pool token storage
        @return s Storage pointer to the pool token struct
    */
  function load() internal pure returns (StorageStruct storage s) {
    bytes32 loc = rpSlot;
    assembly {
      s_slot := loc
    }
  }
}
