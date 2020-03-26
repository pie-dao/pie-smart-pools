pragma solidity ^0.6.4;

import "./PBasicSmartPool.sol";
contract PCappedSmartPool is PBasicSmartPool {

    bytes32 constant public pcsSlot = keccak256("PCappedSmartPool.storage.location");
    struct pcs {
        uint256 cap;
    }

    modifier withinCap() {
        _;
        require(totalSupply() < lpcs().cap, "PCappedSmartPool.withinCap: Cap limit reached");
    }

    function setCap(uint256 _cap) onlyController external {
        lpcs().cap = _cap;
    }

    // Override joinPool to enforce cap
    function joinPool(uint256 _amount) external override withinCap {
        super._joinPool(_amount);
    }

    function getCap() external view returns(uint256) {
        return lpcs().cap;
    }

    function lpcs() internal pure returns (pcs storage s) {
        bytes32 loc = pcsSlot;
        assembly {
            s_slot := loc
        }
    }

}