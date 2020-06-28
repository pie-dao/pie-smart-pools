pragma solidity 0.6.4;

import {PBasicSmartPoolStorage as PBStorage} from "../storage/PBasicSmartPoolStorage.sol";
import {PCTokenStorage as PCStorage} from "../storage/PCTokenStorage.sol";

import "./LibPoolToken.sol";
import "./LibUnderlying.sol";
import "./Math.sol";


library LibExitPool {
  using Math for uint256;

  event PoolExited(address indexed from, uint256 amount);
  event LOG_EXIT(address indexed caller, address indexed tokenOut, uint256 tokenAmountOut);
  event PoolExitedWithLoss(address indexed from, uint256 amount, address[] lossTokens);

  function exitPool(uint256 _amount) external {
    IBPool bPool = PBStorage.load().bPool;
    uint256 poolTotal = PCStorage.load().totalSupply;
    uint256 ratio = _amount.bdiv(poolTotal);
    require(ratio != 0);

    LibPoolToken._burn(msg.sender, _amount);

    address[] memory tokens = bPool.getCurrentTokens();

    for (uint256 i = 0; i < tokens.length; i++) {
      address t = tokens[i];
      uint256 bal = bPool.getBalance(t);
      uint256 tAo = ratio.bmul(bal);
      emit LOG_EXIT(msg.sender, t, tAo);
      LibUnderlying._pushUnderlying(t, msg.sender, tAo, bal);
    }
    emit PoolExited(msg.sender, _amount);
  }

  function exitswapPoolAmountIn(address _token, uint256 _poolAmountIn)
    external
    returns (uint256 tokenAmountOut)
  {
    IBPool bPool = PBStorage.load().bPool;

    require(bPool.isBound(_token), "PBasicSmartPool.exitswapPoolAmountIn: Token Not Bound");

    tokenAmountOut = bPool.calcSingleOutGivenPoolIn(
      bPool.getBalance(_token),
      bPool.getDenormalizedWeight(_token),
      PCStorage.load().totalSupply,
      bPool.getTotalDenormalizedWeight(),
      _poolAmountIn,
      bPool.getSwapFee()
    );

    emit LOG_EXIT(msg.sender, _token, tokenAmountOut);

    LibPoolToken._burn(msg.sender, _poolAmountIn);

    emit PoolExited(msg.sender, tokenAmountOut);

    uint256 bal = bPool.getBalance(_token);
    LibUnderlying._pushUnderlying(_token, msg.sender, tokenAmountOut, bal);

    return tokenAmountOut;
  }

  function exitswapExternAmountOut(address _token, uint256 _tokenAmountOut)
    external
    returns (uint256 poolAmountIn)
  {
    IBPool bPool = PBStorage.load().bPool;

    require(bPool.isBound(_token), "PBasicSmartPool.exitswapExternAmountOut: Token Not Bound");

    poolAmountIn = bPool.calcPoolInGivenSingleOut(
      bPool.getBalance(_token),
      bPool.getDenormalizedWeight(_token),
      PCStorage.load().totalSupply,
      bPool.getTotalDenormalizedWeight(),
      _tokenAmountOut,
      bPool.getSwapFee()
    );

    emit LOG_EXIT(msg.sender, _token, _tokenAmountOut);

    LibPoolToken._burn(msg.sender, poolAmountIn);

    emit PoolExited(msg.sender, _tokenAmountOut);

    uint256 bal = bPool.getBalance(_token);
    LibUnderlying._pushUnderlying(_token, msg.sender, _tokenAmountOut, bal);

    return poolAmountIn;
  }

  function exitPoolTakingloss(uint256 _amount, address[] calldata _lossTokens)
    external
  {
    IBPool bPool = PBStorage.load().bPool;
    uint256 poolTotal = PCStorage.load().totalSupply;
    uint256 ratio = _amount.bdiv(poolTotal);
    require(ratio != 0);

    LibPoolToken._burn(msg.sender, _amount);

    address[] memory tokens = bPool.getCurrentTokens();

    for (uint256 i = 0; i < tokens.length; i++) {
      // If taking loss on token skip one iteration of the loop
      if (_contains(tokens[i], _lossTokens)) {
        continue;
      }
      address t = tokens[i];
      uint256 bal = bPool.getBalance(t);
      uint256 tAo = ratio.bmul(bal);
      emit LOG_EXIT(msg.sender, t, tAo);
      LibUnderlying._pushUnderlying(t, msg.sender, tAo, bal);
    }
    emit PoolExitedWithLoss(msg.sender, _amount, _lossTokens);
  }

    /**
        @notice Searches for an address in an array of addresses and returns if found
        @param _needle Address to look for
        @param _haystack Array to search
        @return If value is found
    */
  function _contains(address _needle, address[] memory _haystack) internal pure returns (bool) {
    for (uint256 i = 0; i < _haystack.length; i++) {
      if (_haystack[i] == _needle) {
        return true;
      }
    }
    return false;
  }
}
