import "./UniswapV2Recipe.sol";
import "../interfaces/IBPool.sol";

contract UniswapV2BalRecipe is UniswapV2Recipe {

    mapping(address => address) public tokenToBPool;

    function setBPool(address _token, address _bPool) external onlyOwner {
        tokenToBPool[_token] = _bPool;
    }

    function _swapToToken(address _token, uint256 _amount, address _pie) internal override {

        if(tokenToBPool[_token] != address(0)) {
            IBPool bPool = IBPool(tokenToBPool[_token]);
            uint256 ethAmount = calcEthAmount(_token, _amount);
            IERC20(WETH).safeApprove(address(bPool), ethAmount);
            IERC20(_token).safeApprove(_pie, _amount);
            bPool.swapExactAmountOut(address(WETH), ethAmount, _token, _amount, uint256(-1));

        } else { // no bPool swap regularly
            super._swapToToken(_token, _amount, _pie);
        }
        
    }

    function calcEthAmount(address _token, uint256 _buyAmount) internal override returns(uint256) {
        if(tokenToBPool[_token] != address(0)) {
            IBPool bPool = IBPool(tokenToBPool[_token]);

            uint256 wethBalance = bPool.getBalance(address(WETH));
            uint256 tokenBalance = bPool.getBalance(_token);

            uint256 wethWeight = bPool.getDenormalizedWeight(address(WETH));
            uint256 tokenWeight = bPool.getDenormalizedWeight(_token);

            uint256 swapFee = bPool.getSwapFee();

            return bPool.calcInGivenOut(wethBalance, wethWeight, tokenBalance, tokenWeight, _buyAmount, swapFee);
        } else { // no bPool calc regularly
           super.calcEthAmount(_token, _buyAmount);
        }
    }

}