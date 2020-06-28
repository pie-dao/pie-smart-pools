pragma solidity 0.6.4;

import {PBasicSmartPoolStorage as PBStorage} from "../storage/PBasicSmartPoolStorage.sol";
import {PCTokenStorage as PCStorage} from "../storage/PCTokenStorage.sol";
import "./LibUnderlying.sol";
import "./LibPoolToken.sol";
import "./Math.sol";


library LibJoinPool {
  using Math for uint256;

  event LOG_JOIN(address indexed caller, address indexed tokenIn, uint256 tokenAmountIn);
  event PoolJoined(address indexed from, uint256 amount);

  function joinPool(uint256 _amount) external {
    IBPool bPool = PBStorage.load().bPool;
    uint256 poolTotal = PCStorage.load().totalSupply;
    uint256 ratio = _amount.bdiv(poolTotal);
    require(ratio != 0);

    address[] memory tokens = bPool.getCurrentTokens();

    for (uint256 i = 0; i < tokens.length; i++) {
      address t = tokens[i];
      uint256 bal = bPool.getBalance(t);
      uint256 tokenAmountIn = ratio.bmul(bal);
      emit LOG_JOIN(msg.sender, t, tokenAmountIn);
      LibUnderlying._pullUnderlying(t, msg.sender, tokenAmountIn, bal);
    }
    LibPoolToken._mint(msg.sender, _amount);
    emit PoolJoined(msg.sender, _amount);
  }

  function joinswapExternAmountIn(address _token, uint256 _amountIn)
    external
    returns (uint256 poolAmountOut)
  {
    IBPool bPool = PBStorage.load().bPool;

    require(bPool.isBound(_token), "PBasicSmartPool.joinswapExternAmountIn: Token Not Bound");

    poolAmountOut = bPool.calcPoolOutGivenSingleIn(
      bPool.getBalance(_token),
      bPool.getDenormalizedWeight(_token),
      PCStorage.load().totalSupply,
      bPool.getTotalDenormalizedWeight(),
      _amountIn,
      bPool.getSwapFee()
    );

    emit LOG_JOIN(msg.sender, _token, _amountIn);

    LibPoolToken._mint(msg.sender, poolAmountOut);

    emit PoolJoined(msg.sender, poolAmountOut);

    uint256 bal = bPool.getBalance(_token);
    LibUnderlying._pullUnderlying(_token, msg.sender, _amountIn, bal);

    return poolAmountOut;
  }

  function joinswapPoolAmountOut(address _token, uint256 _amountOut)
    external
    returns (uint256 tokenAmountIn)
  {
    IBPool bPool = PBStorage.load().bPool;

    require(bPool.isBound(_token), "PBasicSmartPool.joinswapPoolAmountOut: Token Not Bound");

    tokenAmountIn = bPool.calcSingleInGivenPoolOut(
      bPool.getBalance(_token),
      bPool.getDenormalizedWeight(_token),
      PCStorage.load().totalSupply,
      bPool.getTotalDenormalizedWeight(),
      _amountOut,
      bPool.getSwapFee()
    );

    emit LOG_JOIN(msg.sender, _token, tokenAmountIn);

    LibPoolToken._mint(msg.sender, _amountOut);

    emit PoolJoined(msg.sender, _amountOut);

    uint256 bal = bPool.getBalance(_token);
    LibUnderlying._pullUnderlying(_token, msg.sender, tokenAmountIn, bal);

    return tokenAmountIn;
  }
}
