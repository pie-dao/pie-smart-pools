pragma solidity 0.6.4;

import "./PUniswapPoolRecipe.sol";
import "../Ownable.sol";
import "../interfaces/IKyberNetwork.sol";

contract PUniswapKyberPoolRecipe is PUniswapPoolRecipe, Ownable {

    bytes32 constant public ukprSlot = keccak256("PUniswapKyberPoolRecipe.storage.location");

    // Uniswap pool recipe struct
    struct ukprs {
        mapping(address => bool) swapOnKyber;
        IKyberNetwork kyber;
        address feeReceiver;
    }

    address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    function init(address, address) public override {
        require(false, "not enabled");
    }

    // Use seperate init function
    function initUK(address _pool, address _uniswapFactory, address _kyber, address[] memory _swapOnKyber, address _feeReciever) public {
        // UnsiwapRecipe enforces that init can only be called once
        ukprs storage s = lukprs();

        PUniswapPoolRecipe.init(_pool, _uniswapFactory);
        s.kyber = IKyberNetwork(_kyber);
        s.feeReceiver = _feeReciever;

        _setOwner(msg.sender);

        for(uint256 i = 0; i < _swapOnKyber.length; i ++) {
            s.swapOnKyber[_swapOnKyber[i]] = true;
        }
    }

    function setKyberSwap(address _token, bool _value) external onlyOwner {
        ukprs storage s = lukprs();
        s.swapOnKyber[_token] = _value;
    }

    function _ethToToken(address _token, uint256 _tokens_bought) internal override returns (uint256) {
        ukprs storage s = lukprs();
        if(!s.swapOnKyber[_token]) {
            return super._ethToToken(_token, _tokens_bought);
        }

        uint256 ethBefore = address(this).balance;
        s.kyber.trade{value: address(this).balance}(ETH, address(this).balance, _token, address(this), _tokens_bought, 1, s.feeReceiver);
        uint256 ethAfter = address(this).balance;

        // return amount of ETH spend
        return ethBefore - ethAfter;
    }

    function _tokenToEth(IERC20 _token, uint256 _tokens_sold, address _recipient) internal override returns (uint256 eth_bought) {
        ukprs storage s = lukprs();
        if(!s.swapOnKyber[address(_token)]) {
            return super._tokenToEth(_token, _tokens_sold, _recipient);
        }

        uint256 ethBefore = address(this).balance;
        _token.approve(address(s.kyber), uint256(-1));
        s.kyber.trade(address(_token), _tokens_sold, ETH, address(this), uint256(-1), 1, s.feeReceiver);
        uint256 ethAfter = address(this).balance;

        // return amount of ETH received
        return ethAfter - ethBefore;
    }

    // Load uniswap pool recipe
    function lukprs() internal pure returns (ukprs storage s) {
        bytes32 loc = ukprSlot;
        assembly {
            s_slot := loc
        }
    }

}