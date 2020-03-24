pragma solidity ^0.6.4;

import "../interfaces/IERC20.sol";
import "../interfaces/IPSmartPool.sol";
import "../interfaces/IUniswapFactory.sol";
import "../interfaces/IUniswapExchange.sol";

// Takes ETH and mints smart pool tokens
contract PUniswapPoolRecipe {

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

        eth_sold = 0;
        // Buy and approve tokens
        for(uint256 i = 0; i < tokens.length; i ++) {
            eth_sold += _ethToToken(tokens[i], amounts[i]);
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
        return eth_sold;
    }

    function ethToTokenSwapOutput(uint256 _tokens_bought, uint256 _deadline) external payable returns (uint256 eth_sold) {
        return ethToTokenTransferOutput(_tokens_bought, _deadline, msg.sender);
    }

    function _ethToToken(address _token, uint256 _tokens_bought) internal virtual returns (uint256) {
        IUniswapExchange exchange = IUniswapExchange(uniswapFactory.getExchange(_token));
        return exchange.ethToTokenSwapOutput{value: address(this).balance}(_tokens_bought, uint256(-1));
    }

    function getEthToTokenOutputPrice(uint256 _tokens_bought) external view virtual returns (uint256 eth_sold) {
        (address[] memory tokens, uint256[] memory amounts) = pool.calcTokensForAmount(_tokens_bought);

        eth_sold = 0;

        for(uint256 i = 0; i < tokens.length; i ++) {
            IUniswapExchange exchange = IUniswapExchange(uniswapFactory.getExchange(tokens[i]));
            eth_sold += exchange.getEthToTokenOutputPrice(amounts[i]);
        }

        return eth_sold;
    }

    function tokenToEthTransferInput(uint256 _tokens_sold, uint256 _min_eth, uint256 _deadline, address _recipient) public returns (uint256 eth_bought) {
        require(_deadline >= block.timestamp);
        require(pool.transferFrom(msg.sender, address(this), _tokens_sold), "PUniswapPoolRecipe.tokenToEthTransferInput: transferFrom failed");

        pool.exitPool(_tokens_sold);

        address[] memory tokens = pool.getTokens();

        uint256 ethAmount = 0;

        for(uint256 i = 0; i < tokens.length; i ++) {
            IERC20 token = IERC20(tokens[i]);
            
            uint256 balance = token.balanceOf(address(this));
           
            // Exchange for ETH
            ethAmount += _tokenToEth(token, balance, _recipient);
        }

        require(ethAmount > _min_eth, "PUniswapPoolRecipe.tokenToEthTransferInput: not enough ETH");
        return ethAmount;
    }

    function tokenToEthSwapInput(uint256 _tokens_sold, uint256 _min_eth, uint256 _deadline) external returns (uint256 eth_bought) {
        return tokenToEthTransferInput(_tokens_sold, _min_eth, _deadline, msg.sender);
    }

    function _tokenToEth(IERC20 _token, uint256 _tokens_sold, address _recipient) internal virtual returns (uint256 eth_bought) {
        IUniswapExchange exchange = IUniswapExchange(uniswapFactory.getExchange(address(_token)));
        _token.approve(address(exchange), _tokens_sold);
        // Exchange for ETH
        return exchange.tokenToEthTransferInput(_tokens_sold, 1, uint256(-1), _recipient);
    }

    function getTokenToEthInputPrice(uint256 _tokens_sold) external view virtual returns (uint256 eth_bought) {
        (address[] memory tokens, uint256[] memory amounts) = pool.calcTokensForAmount(_tokens_sold);

        eth_bought = 0;

        for(uint256 i = 0; i < tokens.length; i ++) {
            IUniswapExchange exchange = IUniswapExchange(uniswapFactory.getExchange(address(tokens[i])));
            eth_bought += exchange.getTokenToEthInputPrice(amounts[i]);
        }

        return eth_bought;
    }

    fallback() external payable {

    }
} 
