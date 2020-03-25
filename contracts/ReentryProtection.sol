pragma solidity ^0.6.4;

// TODO move this generic contract to a seperate repo with all generic smart contracts

contract ReentryProtection {

    bytes32 constant public rpSlot = keccak256("ReentryProtection.storage.location");

    // reentry protection storage
    struct rps {
        uint256 lockCounter;
    }

    modifier noReentry {
        // Use counter to only write to storage once
        uint256 lockValue = lrps().lockCounter;
        _;
        require(lockValue == lrps().lockCounter, "ReentryProtection.noReentry: reentry detected");
    }

    // Load rentry protection storage
    function lrps() internal pure returns (rps storage s) {
        bytes32 loc = rpSlot;
        assembly {
            s_slot := loc
        }
    }

}