pragma solidity 0.6.4;

import "../interfaces/IFlashLoanReceiver.sol";
import "../interfaces/IPCappedFLSmartPool.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/IMockToken.sol";
import "@nomiclabs/buidler/console.sol";

contract TestFlashLoanReceiver is IFlashLoanReceiver {

    constructor(address _pool) public {
        // Saving pool var bec
        pool = _pool;
    }
    address public pool;
    address public token;
    uint256 public amount;
    uint256 public amountReceived;
    uint256 public fee;
    bytes public params;

    function excecuteFlashLoan(address _pool, address _token, uint256 _amount, bytes calldata _params) external {
        IPCappedFLSmartPool(_pool).flashLoan(address(this), _token, _amount, _params);
    }

    function executeOperation(address _token, uint256 _amount, uint256 _fee, bytes calldata _params) external override {
        token = _token;
        amount = _amount;
        fee = _fee;
        params = _params;

        IMockToken tokenContract = IMockToken(_token);

        amountReceived = tokenContract.balanceOf(address(this));
        tokenContract.mint(address(this), _fee);
        console.log(pool);
        tokenContract.approve(pool, uint256(-1));
    }
}