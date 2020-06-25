pragma solidity ^0.6.4;

library PAdjustableSmartPoolStorage {

    bytes32 public constant pasSlot = keccak256("PAdjustableSmartPool.storage.location");

    struct StorageStruct {
        uint256 startBlock;
        uint256 endBlock;
        uint256[] startWeights;
        uint256[] newWeights;
        NewToken newToken;
    }

    struct NewToken {
        address addr;
        bool isCommitted;
        uint256 balance;
        uint256 denorm;
        uint256 commitBlock;
    }

    function load() internal pure returns (StorageStruct storage s) {
        bytes32 loc = pasSlot;
        assembly {
        s_slot := loc
    }
  }

}