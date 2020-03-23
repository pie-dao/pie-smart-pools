pragma solidity ^0.6.4;

import "../interfaces/IERC20.sol";
import "../interfaces/IPSmartPool.sol";
import "../interfaces/IUniswapFactory.sol";
import "../interfaces/IUniswapExchange.sol";

// Takes ETH and mints smart pool tokens
contract PUnsiwapPoolRecipe {

    IPSmartPool public pool;
    IUniswapFactory public uniswapFactory;
    

    constructor(address _pool, address _uniswapFactory) public {
        pool = IPSmartPool(_pool);
        uniswapFactory = IUniswapFactory(_uniswapFactory);
    }

    // Using same interface as Uniswap for compatibility
    function ethToTokenTransferOutput(uint256 _tokens_bought, uint256 _deadline, address _recipient) public payable returns (uint256  eth_sold) {
        require(_deadline >= block.timestamp);
        (address[] memory tokens, uint256[] memory amounts) = pool.calcTokensForAmount(_tokens_bought);

        // Buy and approve tokens
        for(uint256 i = 0; i < tokens.length; i ++) {
            IUniswapExchange exchange = IUniswapExchange(uniswapFactory.getExchange(tokens[i]));
            exchange.ethToTokenSwapOutput{value: address(this).balance}(amounts[i], block.timestamp + 1);
            IERC20(tokens[i]).approve(address(pool), uint256(-1));
        }

        // Calculate amount of eth sold
        eth_sold = msg.value - address(this).balance;
        // Send back excess eth
        msg.sender.transfer(address(this).balance);

        // Join pool
        pool.joinPool(_tokens_bought);

        // Send pool tokens to receiver
        pool.transfer(_recipient, pool.balanceOf(address(this)));
    }

    function ethToTokenSwapOutput(uint256 _tokens_bought, uint256 _deadline) external payable returns (uint256  eth_sold) {
        return ethToTokenTransferOutput(_tokens_bought, _deadline, msg.sender);
    }

    function getEthToTokenOutputPrice(uint256 _tokens_bought) external view returns (uint256 eth_sold) {
        (address[] memory tokens, uint256[] memory amounts) = pool.calcTokensForAmount(_tokens_bought);

        eth_sold = 0;

        for(uint256 i = 0; i < tokens.length; i ++) {
            IUniswapExchange exchange = IUniswapExchange(uniswapFactory.getExchange(tokens[i]));
            eth_sold += exchange.getEthToTokenOutputPrice(amounts[i]);
        }
    }


    fallback() external payable {

    }
}