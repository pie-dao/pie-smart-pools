// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.6.4;

import {PCTokenStorage as PCStorage} from "./smart-pools/storage/PCTokenStorage.sol";
import "./smart-pools/libraries/LibPoolToken.sol";
import "./interfaces/IERC20.sol";
import "./Math.sol";


// Highly opinionated token implementation
// Based on the balancer Implementation

contract PCToken is IERC20 {
  using Math for uint256;

  event Approval(address indexed _src, address indexed _dst, uint256 _amount);
  event Transfer(address indexed _src, address indexed _dst, uint256 _amount);

  uint8 public constant decimals = 18;

  function _mint(uint256 _amount) internal {
    LibPoolToken._mint(address(this), _amount);
  }

  function _burn(uint256 _amount) internal {
    LibPoolToken._burn(address(this), _amount);
  }

  function _move(
    address _src,
    address _dst,
    uint256 _amount
  ) internal {
    PCStorage.StorageStruct storage s = PCStorage.load();
    require(s.balance[_src] >= _amount, "ERR_INSUFFICIENT_BAL");
    s.balance[_src] = s.balance[_src].bsub(_amount);
    s.balance[_dst] = s.balance[_dst].badd(_amount);
    emit Transfer(_src, _dst, _amount);
  }

  function _push(address _to, uint256 _amount) internal {
    _move(address(this), _to, _amount);
  }

  function _pull(address _from, uint256 _amount) internal {
    _move(_from, address(this), _amount);
  }

  function allowance(address _src, address _dst) external override view returns (uint256) {
    return PCStorage.load().allowance[_src][_dst];
  }

  function balanceOf(address _whom) external override view returns (uint256) {
    return PCStorage.load().balance[_whom];
  }

  function totalSupply() public override view returns (uint256) {
    return PCStorage.load().totalSupply;
  }

  function name() external view returns (string memory) {
    return PCStorage.load().name;
  }

  function symbol() external view returns (string memory) {
    return PCStorage.load().symbol;
  }

  function approve(address _dst, uint256 _amount) external override returns (bool) {
    PCStorage.load().allowance[msg.sender][_dst] = _amount;
    emit Approval(msg.sender, _dst, _amount);
    return true;
  }

  function increaseApproval(address _dst, uint256 _amount) external returns (bool) {
    PCStorage.StorageStruct storage s = PCStorage.load();
    s.allowance[msg.sender][_dst] = s.allowance[msg.sender][_dst].badd(_amount);
    emit Approval(msg.sender, _dst, s.allowance[msg.sender][_dst]);
    return true;
  }

  function decreaseApproval(address _dst, uint256 _amount) external returns (bool) {
    PCStorage.StorageStruct storage s = PCStorage.load();
    uint256 oldValue = s.allowance[msg.sender][_dst];
    if (_amount > oldValue) {
      s.allowance[msg.sender][_dst] = 0;
    } else {
      s.allowance[msg.sender][_dst] = oldValue.bsub(_amount);
    }
    emit Approval(msg.sender, _dst, s.allowance[msg.sender][_dst]);
    return true;
  }

  function transfer(address _dst, uint256 _amount) external override returns (bool) {
    _move(msg.sender, _dst, _amount);
    return true;
  }

  function transferFrom(
    address _src,
    address _dst,
    uint256 _amount
  ) external override returns (bool) {
    PCStorage.StorageStruct storage s = PCStorage.load();
    require(
      msg.sender == _src || _amount <= s.allowance[_src][msg.sender],
      "ERR_PCTOKEN_BAD_CALLER"
    );
    _move(_src, _dst, _amount);
    if (msg.sender != _src && s.allowance[_src][msg.sender] != uint256(-1)) {
      s.allowance[_src][msg.sender] = s.allowance[_src][msg.sender].bsub(_amount);
      emit Approval(msg.sender, _dst, s.allowance[_src][msg.sender]);
    }
    return true;
  }
}
