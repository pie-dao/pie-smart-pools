pragma solidity ^0.6.4;

import { PBasicSmartPoolStorage as PBStorage } from "../storage/PBasicSmartPoolStorage.sol";
import { PAdjustableSmartPoolStorage as PAStorage } from "../storage/PAdjustableSmartPoolStorage.sol";
import { PCTokenStorage as PCStorage } from "../storage/PCTokenStorage.sol";
import { LibConst as constants } from "./LibConst.sol";
import "./LibPoolToken.sol";
import "./Math.sol";
library LibAddToken {
    using Math for uint256;

    function applyAddToken() external {
        PAStorage.StorageStruct storage ws = PAStorage.load();
        PBStorage.StorageStruct storage s = PBStorage.load();

        require(ws.newToken.isCommitted, "ERR_NO_TOKEN_COMMIT");

        uint totalSupply = PCStorage.load().totalSupply;

        uint poolShares = totalSupply.bmul(ws.newToken.denorm).bdiv(s.bPool.getTotalDenormalizedWeight());

        ws.newToken.isCommitted = false;

        require(IERC20(ws.newToken.addr).transferFrom(msg.sender, address(this), ws.newToken.balance), "ERR_ERC20_FALSE");
        // Now with the tokens this contract can bind them to the pool it controls
        IERC20(ws.newToken.addr).approve(address(s.bPool), uint(-1));   // Approves bPool to pull from this controller
        s.bPool.bind(ws.newToken.addr, ws.newToken.balance, ws.newToken.denorm);
        LibPoolToken._mint(msg.sender, poolShares);
    }

    function commitAddToken(address _token, uint256 _balance, uint256 _denormalizedWeight)
        external
    {
        PAStorage.StorageStruct storage ws = PAStorage.load();
        PBStorage.StorageStruct storage s = PBStorage.load();

        require(!s.bPool.isBound(_token), "ERR_IS_BOUND");
        require(_denormalizedWeight <= constants.MAX_WEIGHT, "ERR_WEIGHT_ABOVE_MAX");
        require(_denormalizedWeight >= constants.MIN_WEIGHT, "ERR_WEIGHT_BELOW_MIN");
        require(s.bPool.getTotalDenormalizedWeight().badd(_denormalizedWeight) <= constants.MAX_TOTAL_WEIGHT, "ERR_MAX_TOTAL_WEIGHT");

        ws.newToken.addr = _token;
        ws.newToken.balance = _balance;
        ws.newToken.denorm = _denormalizedWeight;
        ws.newToken.commitBlock = block.number;
        ws.newToken.isCommitted = true;
    }
}