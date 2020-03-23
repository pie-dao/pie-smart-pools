pragma solidity ^0.6.4;

interface IPSmartPool {
    function joinPool(uint256 _amount) external;
    function exitPool(uint256 _amount) external;
    function getController() external view returns(address);
    function getTokens() external view returns(address[] memory);
    function calcTokensForAmount(uint256 _amount) external view  returns(address[] memory tokens, uint256[] memory amounts);
}