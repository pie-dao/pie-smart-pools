interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}