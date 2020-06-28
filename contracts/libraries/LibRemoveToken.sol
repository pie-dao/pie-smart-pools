pragma solidity ^0.6.4;

import {PBasicSmartPoolStorage as PBStorage} from "../storage/PBasicSmartPoolStorage.sol";
import {PCTokenStorage as PCStorage} from "../storage/PCTokenStorage.sol";
import "./LibPoolToken.sol";
import "./Math.sol";

import "../interfaces/IERC20.sol";


library LibRemoveToken {
  using Math for uint256;

  function removeToken(address _token) external {
    PBStorage.StorageStruct storage s = PBStorage.load();

    uint256 totalSupply = PCStorage.load().totalSupply;

    // poolShares = totalSupply * tokenWeight / totalWeight
    uint256 poolShares = totalSupply.bmul(s.bPool.getDenormalizedWeight(_token)).bdiv(
      s.bPool.getTotalDenormalizedWeight()
    );

    // this is what will be unbound from the pool
    // Have to get it before unbinding
    uint256 balance = s.bPool.getBalance(_token);

    // Unbind and get the tokens out of balancer pool
    s.bPool.unbind(_token);

    require(IERC20(_token).transfer(msg.sender, balance), "ERR_ERC20_FALSE");

    LibPoolToken._burn(msg.sender, poolShares);
  }
}
