pragma solidity ^0.6.4;

import {PBasicSmartPoolStorage as PBStorage} from "../storage/PBasicSmartPoolStorage.sol";
import {PV2SmartPoolStorage as P2Storage} from "../storage/PV2SmartPoolStorage.sol";
import {PCTokenStorage as PCStorage} from "../storage/PCTokenStorage.sol";
import {LibConst as constants} from "./LibConst.sol";
import "./LibSafeApprove.sol";
import "./LibPoolToken.sol";
import "./Math.sol";

library LibAddRemoveToken {
  using Math for uint256;
  using LibSafeApprove for IERC20;

  function applyAddToken() external {
    P2Storage.StorageStruct storage ws = P2Storage.load();
    PBStorage.StorageStruct storage s = PBStorage.load();

    require(ws.newToken.isCommitted, "ERR_NO_TOKEN_COMMIT");

    uint256 totalSupply = PCStorage.load().totalSupply;

    uint256 poolShares = totalSupply.bmul(ws.newToken.denorm).bdiv(
      s.bPool.getTotalDenormalizedWeight()
    );

    ws.newToken.isCommitted = false;

    require(
      IERC20(ws.newToken.addr).transferFrom(msg.sender, address(this), ws.newToken.balance),
      "ERR_ERC20_FALSE"
    );

    // Cancel potential weight adjustment process.
    ws.startBlock = 0;

    // Approves bPool to pull from this controller
    IERC20(ws.newToken.addr).safeApprove(address(s.bPool), uint256(-1));
    s.bPool.bind(ws.newToken.addr, ws.newToken.balance, ws.newToken.denorm);
    LibPoolToken._mint(msg.sender, poolShares);
  }

  function commitAddToken(
    address _token,
    uint256 _balance,
    uint256 _denormalizedWeight
  ) external {
    P2Storage.StorageStruct storage ws = P2Storage.load();
    PBStorage.StorageStruct storage s = PBStorage.load();

    require(!s.bPool.isBound(_token), "ERR_IS_BOUND");
    require(_denormalizedWeight <= constants.MAX_WEIGHT, "ERR_WEIGHT_ABOVE_MAX");
    require(_denormalizedWeight >= constants.MIN_WEIGHT, "ERR_WEIGHT_BELOW_MIN");
    require(
      s.bPool.getTotalDenormalizedWeight().badd(_denormalizedWeight) <= constants.MAX_TOTAL_WEIGHT,
      "ERR_MAX_TOTAL_WEIGHT"
    );

    ws.newToken.addr = _token;
    ws.newToken.balance = _balance;
    ws.newToken.denorm = _denormalizedWeight;
    ws.newToken.commitBlock = block.number;
    ws.newToken.isCommitted = true;
  }

  function removeToken(address _token) external {
    P2Storage.StorageStruct storage ws = P2Storage.load();
    PBStorage.StorageStruct storage s = PBStorage.load();

    uint256 totalSupply = PCStorage.load().totalSupply;

    // poolShares = totalSupply * tokenWeight / totalWeight
    uint256 poolShares = totalSupply.bmul(s.bPool.getDenormalizedWeight(_token)).bdiv(
      s.bPool.getTotalDenormalizedWeight()
    );

    // this is what will be unbound from the pool
    // Have to get it before unbinding
    uint256 balance = s.bPool.getBalance(_token);

    // Cancel potential weight adjustment process.
    ws.startBlock = 0;

    // Unbind and get the tokens out of balancer pool
    s.bPool.unbind(_token);

    require(IERC20(_token).transfer(msg.sender, balance), "ERR_ERC20_FALSE");

    LibPoolToken._burn(msg.sender, poolShares);
  }
}
