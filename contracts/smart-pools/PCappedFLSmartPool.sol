pragma solidity 0.6.4;
import "../interfaces/IBPool.sol";
import "../interfaces/IPSmartPool.sol";
import "../interfaces/IFlashLoanReceiver.sol";
import "./PCappedSmartPool.sol";


contract PCappedFLSmartPool is PCappedSmartPool {
    using Math for uint256;

    bytes32 public constant pcflsSlot = keccak256("PCappedFLSmartPool.storage.location");

    struct pcfls {
        uint256 flashLoanFee; // 10000 == 100%
    }

    modifier lockSwap() {
        IBPool bPool = lpbs().bPool;
        if(bPool.isPublicSwap()) {
            // If public swap is enabled turn it of, execute function and turn it off again
            bPool.setPublicSwap(false);
            _;
            bPool.setPublicSwap(true);
        } else {
            // If public swap is not enabled just execute
            _;
        }
    }

    function setFlashLoanFee(uint256 _newFee) external {
        lpcfls().flashLoanFee = _newFee;
    }

    function flashLoan(address _receiver, address _token, uint256 _amount, bytes calldata _params) external noReentry lockSwap {
        IBPool bPool = lpbs().bPool;
        require(_amount > 0, "PCappedFlSmartPool.flashloan: Cannot flash loan 0");
        uint256 liquidityBefore = bPool.getBalance(_token);
        require(liquidityBefore.bsub(_amount) > 10**6, "PCappedFlSmartPool.flashloan: Cannot drop below MIN_BALANCE");

        uint256 feeAmount = _amount.bmul(lpcfls().flashLoanFee).bdiv(10000);
        require(feeAmount > 0, "PCappedFlSmartPool.flashloan: Flash loan too small");
        uint256 denorm = bPool.getDenormalizedWeight(_token);
        // rebind token  (reducing amount)
        bPool.rebind(_token, liquidityBefore.bsub(_amount), denorm);
        // Push tokens
        require(IERC20(_token).transfer(_receiver, _amount), "PCappedFlSmartPool.flashloan: transfer failed");
        // execute function
        IFlashLoanReceiver(_receiver).executeOperation(_token, _amount, feeAmount, _params);
        // Pull token back
        require(
            IERC20(_token).transferFrom(_receiver, address(this), _amount.badd(feeAmount)),
            "PCappedFlSmartPool.flashloan: transferFrom failed"
        );
        // rebind token again (sending back amount)
        bPool.rebind(_token, _amount.badd(feeAmount), denorm);
    }

    function lpcfls() internal pure returns (pcfls storage s) {
    bytes32 loc = pcsSlot;
    assembly {
      s_slot := loc
    }
  }

}