pragma solidity ^0.6.2;

import "../interfaces/IBPool.sol";
import "../interfaces/IPSmartPool.sol";
import "../PCToken.sol";

contract PBasicSmartPool is IPSmartPool, PCToken {
    
    IBPool public bPool;

    modifier ready() {
        require(address(bPool) == address(0), "PBasicSmartPool.initialise: not ready");
        _;
    }

     event LOG_JOIN(
        address indexed caller,
        address indexed tokenIn,
        uint256         tokenAmountIn
    );

    event LOG_EXIT(
        address indexed caller,
        address indexed tokenOut,
        uint256         tokenAmountOut
    );

    constructor(address _bPool) public {
        init(_bPool);
    }

    // Seperated initializer for easier use with proxies
    function init(address _bPool) public {
        require(address(bPool) == address(0), "PBasicSmartPool.init: already initialised");
        bPool = IBPool(_bPool);
    }

    function joinPool(uint _amount) external override ready {
        uint poolTotal = totalSupply();

        uint ratio = bdiv(_amount, poolTotal);
        require(ratio != 0);

        address[] memory tokens = bPool.getCurrentTokens();

        for (uint i = 0; i < tokens.length; i++) {
            address t = tokens[i];
            uint bal = bPool.getBalance(t);
            uint tokenAmountIn = bmul(ratio, bal);
            emit LOG_JOIN(msg.sender, t, tokenAmountIn);
            _pullUnderlying(t, msg.sender, tokenAmountIn);
        }
        _mintPoolShare(_amount);
        _pushPoolShare(msg.sender, _amount);
    }

    function exitPool(uint _amount) external override ready {

        uint poolTotal = totalSupply();
        uint ratio = bdiv(_amount, poolTotal);
        require(ratio != 0);

        _pullPoolShare(msg.sender, _amount);
        _burnPoolShare(_amount);

        address[] memory tokens = bPool.getCurrentTokens();

        for (uint i = 0; i < tokens.length; i++) {
            address t = tokens[i];
            uint bal = bPool.getBalance(t);
            uint tAo = bmul(ratio, bal);
            emit LOG_EXIT(msg.sender, t, tAo);
            _pushUnderlying(t, msg.sender, tAo);
        }
    }

    // Pull tokens from address and rebind BPool
    function _pullUnderlying(address _token, address _from, uint _amount)
        internal
    {
        // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
        uint tokenBalance = bPool.getBalance(_token);
        uint tokenWeight = bPool.getDenormalizedWeight(_token);

        bool xfer = IERC20(_token).transferFrom(_from, address(this), _amount);
        require(xfer, "ERR_ERC20_FALSE");
        bPool.rebind(_token, badd(tokenBalance, _amount), tokenWeight);
    }

    // Rebind BPool and push tokens to address
    function _pushUnderlying(address _token, address _to, uint _amount)
        internal
    {
        // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
        uint tokenBalance = bPool.getBalance(_token);
        uint tokenWeight = bPool.getDenormalizedWeight(_token);
        bPool.rebind(_token, bsub(tokenBalance, _amount), tokenWeight);

        bool xfer = IERC20(_token).transfer(_to, _amount);
        require(xfer, "ERR_ERC20_FALSE");
    }
    function _pullPoolShare(address _from, uint _amount)
        internal
    {
        _pull(_from, _amount);
    }

    function _burnPoolShare(uint _amount)
        internal
    {
        _burn(_amount);
    }

    function _mintPoolShare(uint _amount)
        internal
    {
        _mint(_amount);
    }

    function _pushPoolShare(address _to, uint _amount)
        internal
    {
        _push(_to, _amount);
    }

}