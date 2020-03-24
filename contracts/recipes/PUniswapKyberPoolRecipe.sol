pragma solidity ^0.6.4;

import "./PUniswapPoolRecipe.sol";
import "../interfaces/IKyberNetwork.sol";

contract PUniswapKyberPoolRecipe is PUniswapPoolRecipe {

    mapping(address => bool) public swapOnKyber;
    IKyberNetwork public kyber;
    
    constructor(address _pool, address _uniswapFactory, address _kyber, address[] memory _swapOnKyber) PUniswapPoolRecipe(_pool, _uniswapFactory) public {
        kyber = IKyberNetwork(_kyber);

        for(uint256 i = 0; i < _swapOnKyber.length; i ++) {
            swapOnKyber[_swapOnKyber[i]] = true;
        }
    }


    // TODO implement getting prices from kyber

    // function getEthToTokenOutputPrice(uint256 _tokens_bought) external view override returns (uint256 eth_sold) {
    //     if(!swapOnKyber[_token]) {
    //         return super.getEthToTokenOutputPrice(_tokens_bought);
    //     }

    //     // TODO get kyber price
    // }


    // function getTokenToEthInputPrice(uint256 _tokens_sold) external view override returns (uint256 eth_bought) {
    //     if(!swapOnKyber[_token]) {
    //         return super.getTokenToEthInputPrice(_tokens_sold);
    //     }

    //     // TODO get kyber price
    // }


    function _ethToToken(address _token, uint256 _tokens_bought) internal override returns (uint256) {
        if(!swapOnKyber[_token]) {
            return super._ethToToken(_token, _tokens_bought);
        }

        // TODO swap on kyber
    }

    function _tokenToEth(IERC20 _token, uint256 _tokens_sold, address _recipient) internal override returns (uint256 eth_bought) {
        if(!swapOnKyber[address(_token)]) {
            return super._tokenToEth(_token, _tokens_sold, _recipient);
        }

        // TODO swap on kyber
    }

}