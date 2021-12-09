pragma solidity ^0.6.4;

library AccessControlStorage {
  bytes32 public constant acSlot = keccak256("AccessControl.storage.location");

  struct StorageStruct {
      bool blacklistControlEnabled; // if false, blacklist protection is on 
      bool contractAccessControlEnabled; // if false, contract access protection is on (only eoa can call)

      mapping(address => bool) isBlacklisted; // if address entry is true, the address is blacklisted
  }
  function load() internal pure returns (StorageStruct storage s) {
    bytes32 loc = acSlot;
    assembly {
      s_slot := loc
    }
  }
}
