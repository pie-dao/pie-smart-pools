pragma solidity ^0.6.4;

import {PCTokenStorage as PCStorage} from "../storage/PCTokenStorage.sol";
import "../libraries/Math.sol";
import "../interfaces/IERC20.sol";


library LibPoolToken {
  using Math for uint256;

  event Transfer(address indexed _src, address indexed _dst, uint256 _amount);

  function _mint(address _to, uint256 _amount) internal {
    PCStorage.StorageStruct storage s = PCStorage.load();
    s.balance[_to] = s.balance[_to].badd(_amount);
    s.totalSupply = s.totalSupply.badd(_amount);
    emit Transfer(address(0), _to, _amount);
  }

  function _burn(address _from, uint256 _amount) internal {
    PCStorage.StorageStruct storage s = PCStorage.load();
    require(s.balance[_from] >= _amount, "ERR_INSUFFICIENT_BAL");
    s.balance[_from] = s.balance[_from].bsub(_amount);
    s.totalSupply = s.totalSupply.bsub(_amount);
    emit Transfer(_from, address(0), _amount);
  }
}
