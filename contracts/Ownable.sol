pragma solidity 0.6.4;


import {OwnableStorage as OStorage} from "./storage/OwnableStorage.sol"; 

contract Ownable {
  event OwnerChanged(address indexed previousOwner, address indexed newOwner);

  modifier onlyOwner() {
    require(msg.sender == OStorage.load().owner, "Ownable.onlyOwner: msg.sender not owner");
    _;
  }

  /**
        @notice Transfer ownership to a new address
        @param _newOwner Address of the new owner
    */
  function transferOwnership(address _newOwner) external onlyOwner {
    _setOwner(_newOwner);
  }

  /**
        @notice Internal method to set the owner
        @param _newOwner Address of the new owner
    */
  function _setOwner(address _newOwner) internal {
    OStorage.StorageStruct storage s = OStorage.load();
    emit OwnerChanged(s.owner, _newOwner);
    s.owner = _newOwner;
  }

}