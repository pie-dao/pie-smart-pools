pragma solidity ^0.6.4;

interface IERC20 {
    event Approval(address indexed _src, address indexed _dst, uint _amount);
    event Transfer(address indexed _src, address indexed _dst, uint _amount);

    function totalSupply() external view returns (uint);
    function balanceOf(address _whom) external view returns (uint);
    function allowance(address _src, address _dst) external view returns (uint);

    function approve(address _dst, uint _amount) external returns (bool);
    function transfer(address _dst, uint _amount) external returns (bool);
    function transferFrom(
        address _src, address _dst, uint _amount
    ) external returns (bool);
}