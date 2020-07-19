pragma solidity 0.6.4;

library PCTokenStorage {
  bytes32 public constant ptSlot = keccak256("PCToken.storage.location");
  struct StorageStruct {
    string name;
    string symbol;
    uint256 totalSupply;
    mapping(address => uint256) balance;
    mapping(address => mapping(address => uint256)) allowance;
  }

  /**
        @notice Load pool token storage
        @return s Storage pointer to the pool token struct
    */
  function load() internal pure returns (StorageStruct storage s) {
    bytes32 loc = ptSlot;
    assembly {
      s_slot := loc
    }
  }
}
