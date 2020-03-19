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

    function lpts() internal view returns (pts storage s) {
        bytes32 loc = ptSlot;
        assembly {
            s_slot := loc
        }
    }

}