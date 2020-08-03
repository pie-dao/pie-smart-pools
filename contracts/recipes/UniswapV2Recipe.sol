import "../interfaces/IWETH.sol";
import {UniswapV2Library as UniLib} from "./UniswapV2Library.sol";
import "../interfaces/IPSmartPool.sol";
import "../interfaces/IUniswapV2Factory.sol";
import "../interfaces/IUniswapV2Exchange.sol";

contract UniswapV2Recipe {

    IWETH public WETH;
    IUniswapV2Factory public uniswapFactory;

    constructor(address _WETH, address _uniswapFactory) public {
        WETH = IWETH(_WETH);
        uniswapFactory = IUniswapV2Factory(_uniswapFactory);
    }

    // Max eth amount enforced by msg.value
    function toPie(address _pie, uint256 _poolAmount) external payable {
        uint256 totalEth = calcToPie(_pie, _poolAmount);
        require(msg.value >= totalEth, "Amount ETH too low");

        WETH.deposit{value: totalEth}();

        (address[] memory tokens, uint256[] memory amounts) = IPSmartPool(_pie).calcTokensForAmount(_poolAmount);

        for(uint256 i = 0; i < tokens.length; i++) {
            IUniswapV2Exchange pair = IUniswapV2Exchange(uniswapFactory.getPair(tokens[i], address(WETH)));

            WETH.approve(address(pair), uint256(-1));

            if(token0Or1(address(pair), tokens[i]) == 0) {
                pair.swap(amounts[i], 0, address(this), new bytes(0));
            } else {
                pair.swap(0, amounts[i], address(this), new bytes(0));
            }

            IERC20(tokens[i]).approve(_pie, uint256(-1));
        }

        IPSmartPool pie = IPSmartPool(_pie);

        if(address(this).balance != 0) {
            // Send any excess ETH back
            msg.sender.transfer(address(this).balance);
        }
        
        // Join pool
        pie.joinPool(_poolAmount);
        // Transfer pool tokens to msg.sender
        pie.transfer(msg.sender, pie.balanceOf(address(this)));
    }

    function calcToPie(address _pie, uint256 _poolAmount) public view returns(uint256) {
        (address[] memory tokens, uint256[] memory amounts) = IPSmartPool(_pie).calcTokensForAmount(_poolAmount);

        uint256 totalEth = 0;

        for(uint256 i = 0; i < tokens.length; i++) {
            (uint256 reserveA, uint256 reserveB) = UniLib.getReserves(address(uniswapFactory), address(WETH), tokens[i]);
            totalEth += UniLib.getAmountIn(amounts[i], reserveA, reserveB);
        }

        return totalEth;
    }

    function toEth(address _pie, uint256 _poolAmount, uint256 _minEthAmount) external {
        uint256 totalEth = calcToPie(_pie, _poolAmount);
        require(_minEthAmount <= totalEth, "Output ETH amount too low");
        IPSmartPool pie = IPSmartPool(_pie);

        (address[] memory tokens, uint256[] memory amounts) = IPSmartPool(_pie).calcTokensForAmount(_poolAmount);
        pie.transferFrom(msg.sender, address(this), _poolAmount);
        pie.exitPool(_poolAmount);

        for(uint256 i = 0; i < tokens.length; i++) {
            (uint256 reserveA, uint256 reserveB) = UniLib.getReserves(address(uniswapFactory), tokens[i], address(WETH));
            uint256 wethAmountOut = UniLib.getAmountOut(amounts[i], reserveA, reserveB);
            IUniswapV2Exchange pair = IUniswapV2Exchange(uniswapFactory.getPair(tokens[i], address(WETH)));

            if(token0Or1(address(pair), tokens[i]) == 0) {
                pair.swap(0, wethAmountOut, address(this), new bytes(0));
            } else {
                pair.swap(wethAmountOut, 0, address(this), new bytes(0));
            }
        }

        WETH.withdraw(totalEth);
        msg.sender.transfer(address(this).balance);
    }

    function calcToEth(address _pie, uint256 _poolAmountOut) external view returns(uint256) {
        (address[] memory tokens, uint256[] memory amounts) = IPSmartPool(_pie).calcTokensForAmount(_poolAmountOut);

        uint256 totalEth = 0;

        for(uint256 i = 0; i < tokens.length; i++) {
            (uint256 reserveA, uint256 reserveB) = UniLib.getReserves(address(uniswapFactory), tokens[i], address(WETH));
            totalEth += UniLib.getAmountOut(amounts[i], reserveA, reserveB);
        }

        return totalEth;
    }

    function token0Or1(address _pair, address _token) internal view returns(uint256) {
        IUniswapV2Exchange pair = IUniswapV2Exchange(_pair);

        if(pair.token0() == _token) {
            return 0;
        }

        return 1;
    }

}