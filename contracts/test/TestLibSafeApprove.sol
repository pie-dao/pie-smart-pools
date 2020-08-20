pragma solidity 0.6.4;

import "../libraries/LibSafeApprove.sol";
import "../interfaces/IERC20.sol";

contract TestLibSafeApprove {
    using LibSafeApprove for IERC20;

    function doubleApprovalUnsafe(address _token) external {
        IERC20 token = IERC20(_token);

        token.approve(msg.sender, 1337);
        token.approve(msg.sender, 42);
    }

    function doubleApprovalSafe(address _token) external {
        IERC20 token = IERC20(_token);

        token.safeApprove(msg.sender, 1337);
        token.safeApprove(msg.sender, 42);
    }
}