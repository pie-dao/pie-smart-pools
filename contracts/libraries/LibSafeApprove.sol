pragma solidity 0.6.4;

import "../interfaces/IERC20.sol";

library LibSafeApprove {
    function safeApprove(IERC20 _token, address _spender, uint256 _amount) internal {
        uint256 currentAllowance = _token.allowance(address(this), _spender);

        // Do nothing if allowance is already set to this value
        if(currentAllowance == _amount) {
            return;
        }

        // If approval is not zero reset it to zero first
        if(currentAllowance != 0) {
            _token.approve(_spender, 0);
        }

        // do the actual approval
        _token.approve(_spender, _amount);
    }
}