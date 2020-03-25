pragma solidity ^0.6.4;

interface IKyberNetwork {

    function trade(
        address src,
        uint srcAmount,
        address dest,
        address payable destAddress,
        uint maxDestAmount,
        uint minConversionRate,
        address walletId
    ) external payable returns(uint256);
}