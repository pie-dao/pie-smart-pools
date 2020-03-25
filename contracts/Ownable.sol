pragma solidity ^0.6.4;

// TODO move this generic contract to a seperate repo with all generic smart contracts

contract Ownable {

    bytes32 constant public oSlot = keccak256("Ownable.storage.location");

    // Ownable struct
    struct os {
        address owner;
    }

    modifier onlyOwner(){
        require(msg.sender == los().owner, "Ownable.onlyOwner: msg.sender not owner");
        _;
    }

    function transferOwnership(address _newOwner) onlyOwner external {
        _setOwner(_newOwner);
    }


    function _setOwner(address _newOwner) internal {
        los().owner = _newOwner;
    }

    // Load ownable storage
    function los() internal view returns (os storage s) {
        bytes32 loc = oSlot;
        assembly {
            s_slot := loc
        }
    }

}