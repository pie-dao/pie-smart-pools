pragma solidity ^0.6.4;

import "./PUniswapPoolRecipe.sol";
import "../interfaces/IKyberNetwork.sol";

contract PUniswapKyberPoolRecipe is PUniswapPoolRecipe {

    // TODO use diamond storage
    mapping(address => bool) public swapOnKyber;
    IKyberNetwork public kyber;
    address public feeReceiver;

    address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    function init(address _pool, address _uniswapFactory, address _kyber, address[] memory _swapOnKyber, address _feeReciever) public {
        // UnsiwapRecipe enforces that init can only be called once
        super.init(_pool, _uniswapFactory);
        kyber = IKyberNetwork(_kyber);
        feeReceiver = _feeReciever;

        for(uint256 i = 0; i < _swapOnKyber.length; i ++) {
            swapOnKyber[_swapOnKyber[i]] = true;
        }
    }

    // TODO set swap on kyber

    function _ethToToken(address _token, uint256 _tokens_bought) internal override returns (uint256) {
        if(!swapOnKyber[_token]) {
            return super._ethToToken(_token, _tokens_bought);
        }

        uint256 ethBefore = address(this).balance;
        kyber.trade(ETH, address(this).balance, _token, address(this), _tokens_bought, 1, feeReceiver);
        uint256 ethAfter = address(this).balance;

        // return amount of ETH spend
        return ethBefore - ethAfter;
    }

    function _tokenToEth(IERC20 _token, uint256 _tokens_sold, address _recipient) internal override returns (uint256 eth_bought) {
        if(!swapOnKyber[address(_token)]) {
            return super._tokenToEth(_token, _tokens_sold, _recipient);
        }

        // TODO swap on kyber
        uint256 ethBefore = address(this).balance;
        kyber.trade(address(_token), _tokens_sold, ETH, address(this), uint256(-1), 1, feeReceiver);
        uint256 ethAfter = address(this).balance;

        // return amount of ETH received
        return ethAfter - ethBefore;
    }

}