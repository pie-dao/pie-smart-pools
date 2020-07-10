pragma solidity 0.6.4;

import "./PBasicSmartPool.sol";
import "../interfaces/IPCappedSmartPool.sol";

import {PCappedSmartPoolStorage as PCSStorage} from "../storage/PCappedSmartPoolStorage.sol";


contract PCappedSmartPool is PBasicSmartPool, IPCappedSmartPool {
  event CapChanged(address indexed setter, uint256 oldCap, uint256 newCap);

  modifier withinCap() {
    _;
    require(totalSupply() < PCSStorage.load().cap, "PCappedSmartPool.withinCap: Cap limit reached");
  }

  /**
        @notice Set the maximum cap of the contract
        @param _cap New cap in wei
    */
  function setCap(uint256 _cap) external override onlyController noReentry {
    emit CapChanged(msg.sender, PCSStorage.load().cap, _cap);
    PCSStorage.load().cap = _cap;
  }

  /**
        @notice Takes underlying assets and mints smart pool tokens. Enforces the cap
        @param _amount Amount of pool tokens to mint
    */
  function joinPool(uint256 _amount)
    external
    override(PBasicSmartPool, IPSmartPool)
    withinCap
    ready
    noReentry
  {
    LibPoolEntryExit.joinPool(_amount);
  }

  /**
        @notice Joinswap single asset pool entry given token amount in
        @param _token Address of entry token
        @param _amountIn Amount of entry tokens
        @return poolAmountOut
    */
  function joinswapExternAmountIn(address _token, uint256 _amountIn)
    external
    override
    ready
    withinCap
    onlyPublicSwap
    noReentry
    returns (uint256 poolAmountOut)
  {
    return LibPoolEntryExit.joinswapExternAmountIn(_token, _amountIn);
  }

  /**
        @notice Joinswap single asset pool entry given pool amount out
        @param _token Address of entry token
        @param _amountOut Amount of entry tokens to deposit into the pool
        @return tokenAmountIn
    */
  function joinswapPoolAmountOut(address _token, uint256 _amountOut)
    external
    override
    ready
    withinCap
    onlyPublicSwap
    noReentry
    returns (uint256 tokenAmountIn)
  {
    return LibPoolEntryExit.joinswapPoolAmountOut(_token, _amountOut);
  }

  /**
      @notice Get the current cap
      @return The current cap in wei
  */
  function getCap() external view returns (uint256) {
    return PCSStorage.load().cap;
  }
}
