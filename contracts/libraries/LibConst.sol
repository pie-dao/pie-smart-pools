pragma solidity ^0.6.4;

library LibConst {
  uint256 internal constant MIN_WEIGHT = 10**18;
  uint256 internal constant MAX_WEIGHT = 10**18 * 50;
  uint256 internal constant MAX_TOTAL_WEIGHT = 10**18 * 50;
  uint256 internal constant MIN_BALANCE = (10**18) / (10**12);
}
