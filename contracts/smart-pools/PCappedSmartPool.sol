pragma solidity ^0.6.4;

import "./PBasicSmartPool.sol";
contract PCappedSmartPool is PBasicSmartPool {

    // TODO switch to other storage parttern
    uint256 public cap;

    modifier withinCap() {
        _;
        require(totalSupply() < cap, "PCappedSmartPool.withinCap: Cap limit reached");
    }

    function setCap(uint256 _cap) onlyController external {
        cap = _cap;
    }

    // Override joinPool to enforce cap
    function joinPool(uint256 _amount) external override withinCap {
        super._joinPool(_amount);
    }

}