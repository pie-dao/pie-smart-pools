pragma solidity ^0.6.4;

contract PCTokenStorage {

    bytes32 constant public ptSlot = keccak256("PCToken.storage.location");
    struct pts {
        string name;
        string symbol;
        uint256 totalSupply;
        mapping(address => uint256) balance;
        mapping(address => mapping(address=>uint256)) allowance;
    }

    /**
        @notice Load pool token storage
        @return s Storage pointer to the pool token struct
    */
    function lpts() internal pure returns (pts storage s) {
        bytes32 loc = ptSlot;
        assembly {
            s_slot := loc
        }
    }

}