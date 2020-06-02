pragma solidity 0.6.4;

import "../interfaces/IFlashLoanReceiver.sol";
import "../interfaces/IPCappedFLSmartPool.sol";
import "../interfaces/IBPool.sol";
import "../interfaces/IERC20.sol";

contract FlashLoanDemo is IFlashLoanReceiver{

    IPCappedFLSmartPool public flashLoanPool;
    IBPool public poolA;
    IBPool public poolB;

    IERC20 public tokenA;
    IERC20 public tokenB;

    address public owner;


    constructor(address _flashLoanPool, address _poolA, address _poolB, address _tokenA, address _tokenB) public {
        flashLoanPool = IPCappedFLSmartPool(_flashLoanPool);
        poolA = IBPool(_poolA);
        poolB = IBPool(_poolB);
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        owner = msg.sender;
    }

    function excecuteFlashLoan() external {
        // Execute flashloan and arb
        flashLoanPool.flashLoan(address(this), address(tokenA), 1 ether, "0x00");
        // Send remainder to owner
        tokenA.transfer(owner, tokenA.balanceOf(address(this)));
    }

    // function swapExactAmountIn(
    // address tokenIn,
    // uint tokenAmountIn,
    // address tokenOut,
    // uint minAmountOut,
    // uint maxPrice

    function executeOperation(address _token, uint256 _amount, uint256 _fee, bytes calldata _params) external override {

        // Buy Token B with A from pool A
        tokenA.approve(address(poolA), uint256(-1));
        poolA.swapExactAmountIn(address(tokenA), _amount, address(tokenB), 1, uint256(-1));

        // Buy Token A for token B from pool B
        tokenB.approve(address(poolB), uint256(-1));
        poolB.swapExactAmountIn(address(tokenB), tokenB.balanceOf(address(this)), address(tokenA), 1, uint256(-1));

        // Approve Flashloan contract to pull back token A
        tokenA.approve(address(flashLoanPool), uint256(-1));
    }


}