pragma solidity ^0.6.4;

import "../interfaces/IERC20.sol";
import "../interfaces/IBPool.sol";

import {PBasicSmartPoolStorage as PBStorage} from "../storage/PBasicSmartPoolStorage.sol";

import "./Math.sol";


library LibUnderlying {
  using Math for uint256;

  function _pullUnderlying(
    address _token,
    address _from,
    uint256 _amount,
    uint256 _tokenBalance
  ) internal {
    IBPool bPool = PBStorage.load().bPool;
    // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
    uint256 tokenWeight = bPool.getDenormalizedWeight(_token);

    require(
      IERC20(_token).transferFrom(_from, address(this), _amount),
      "PBasicSmartPool._pullUnderlying: transferFrom failed"
    );
    bPool.rebind(_token, _tokenBalance.badd(_amount), tokenWeight);
  }

  function _pushUnderlying(
    address _token,
    address _to,
    uint256 _amount,
    uint256 _tokenBalance
  ) internal {
    IBPool bPool = PBStorage.load().bPool;
    // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
    uint256 tokenWeight = bPool.getDenormalizedWeight(_token);
    bPool.rebind(_token, _tokenBalance.bsub(_amount), tokenWeight);

    require(
      IERC20(_token).transfer(_to, _amount),
      "PBasicSmartPool._pushUnderlying: transfer failed"
    );
  }
}
