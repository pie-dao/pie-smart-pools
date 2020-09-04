pragma solidity ^0.6.4;


interface IKyberNetwork {
  function trade(
    address src,
    uint256 srcAmount,
    address dest,
    address payable destAddress,
    uint256 maxDestAmount,
    uint256 minConversionRate,
    address walletId
  ) external payable returns (uint256);
}
