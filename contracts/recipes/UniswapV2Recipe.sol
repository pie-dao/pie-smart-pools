import "../interfaces/IWETH.sol";
import {UniswapV2Library as UniLib} from "./UniswapV2Library.sol";
import "../interfaces/IPSmartPool.sol";
import "../interfaces/IUniswapV2Factory.sol";
import "../interfaces/IUniswapV2Exchange.sol";
import "../interfaces/ISmartPoolRegistry.sol";
import "../Ownable.sol";
import "@emilianobonassi/gas-saver/ChiGasSaver.sol";

contract UniswapV2Recipe is Ownable, ChiGasSaver {

    IWETH public WETH;
    IUniswapV2Factory public uniswapFactory;
    ISmartPoolRegistry public registry;

    constructor(address _WETH, address _uniswapFactory, address _registry) public {
        WETH = IWETH(_WETH);
        uniswapFactory = IUniswapV2Factory(_uniswapFactory);
        registry = ISmartPoolRegistry(_registry);
        _setOwner(msg.sender);
    }

    // Max eth amount enforced by msg.value
    function toPie(address _pie, uint256 _poolAmount) external payable saveGas(msg.sender) {
        uint256 totalEth = calcToPie(_pie, _poolAmount);
        require(msg.value >= totalEth, "Amount ETH too low");

        WETH.deposit{value: totalEth}();

        _toPie(_pie, _poolAmount);

        // return excess ETH
        if(address(this).balance != 0) {
            // Send any excess ETH back
            msg.sender.transfer(address(this).balance);
        }

        // Transfer pool tokens to msg.sender
        IERC20 pie = IERC20(_pie);

        IERC20(pie).transfer(msg.sender, pie.balanceOf(address(this)));
    }

    function _toPie(address _pie, uint256 _poolAmount) internal {
        (address[] memory tokens, uint256[] memory amounts) = IPSmartPool(_pie).calcTokensForAmount(_poolAmount);

        for(uint256 i = 0; i < tokens.length; i++) {
            if(registry.inRegistry(tokens[i])) {
                _toPie(tokens[i], amounts[i]);
            } else {
                IUniswapV2Exchange pair = IUniswapV2Exchange(uniswapFactory.getPair(tokens[i], address(WETH)));

                (uint256 reserveA, uint256 reserveB) = UniLib.getReserves(address(uniswapFactory), address(WETH), tokens[i]);
                uint256 amountIn = UniLib.getAmountIn(amounts[i], reserveA, reserveB);

                // UniswapV2 does not pull the token
                WETH.transfer(address(pair), amountIn);

                if(token0Or1(address(pair), tokens[i]) == 0) {
                    pair.swap(amounts[i], 0, address(this), new bytes(0));
                } else {
                    pair.swap(0, amounts[i], address(this), new bytes(0));
                }
            }

            IERC20(tokens[i]).approve(_pie, uint256(-1));
        }

        IPSmartPool pie = IPSmartPool(_pie);
        pie.joinPool(_poolAmount);
    }

    function calcToPie(address _pie, uint256 _poolAmount) public view returns(uint256) {
        (address[] memory tokens, uint256[] memory amounts) = IPSmartPool(_pie).calcTokensForAmount(_poolAmount);

        uint256 totalEth = 0;

        for(uint256 i = 0; i < tokens.length; i++) {
            if(registry.inRegistry(tokens[i])) {
                totalEth += calcToPie(tokens[i], amounts[i]);
            } else {
                (uint256 reserveA, uint256 reserveB) = UniLib.getReserves(address(uniswapFactory), address(WETH), tokens[i]);
                totalEth += UniLib.getAmountIn(amounts[i], reserveA, reserveB);
            }
        }

        return totalEth;
    }


    // TODO recursive exit
    function toEth(address _pie, uint256 _poolAmount, uint256 _minEthAmount) external saveGas(msg.sender) {
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

            // Uniswap V2 does not pull the token
            IERC20(tokens[i]).transfer(address(pair), amounts[i]);

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

    function saveEth() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function saveToken(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

}