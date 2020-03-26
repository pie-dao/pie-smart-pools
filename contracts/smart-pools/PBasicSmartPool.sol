pragma solidity ^0.6.4;

import "../interfaces/IBPool.sol";
import "../interfaces/IPSmartPool.sol";
import "../PCToken.sol";
import "../ReentryProtection.sol";

contract PBasicSmartPool is IPSmartPool, PCToken, ReentryProtection {
    
    // P Basic Smart Struct
    bytes32 constant public pbsSlot = keccak256("PBasicSmartPool.storage.location");
    struct pbs {
        IBPool bPool;
        address controller;
        address publicSwapSetter;
    }
    
    modifier ready() {
        require(address(lpbs().bPool) != address(0), "PBasicSmartPool.ready: not ready");
        _;
    }   

     event LOG_JOIN(
        address indexed caller,
        address indexed tokenIn,
        uint256 tokenAmountIn
    );

    event LOG_EXIT(
        address indexed caller,
        address indexed tokenOut,
        uint256 tokenAmountOut
    );

    modifier onlyController() {
        require(msg.sender == lpbs().controller, "PBasicSmartPool.onlyController: not owner");
        _;
    }

    modifier onlyPublicSwapSetter() {
        require(msg.sender == lpbs().controller, "PBasicSmartPool.publicSwapSetter: not owner");
        _;
    }

    // Seperated initializer for easier use with proxies
    function init(address _bPool, string calldata _name, string calldata _symbol, uint256 _initialSupply) external {
        pbs storage s = lpbs();
        require(address(s.bPool) == address(0), "PBasicSmartPool.init: already initialised");
        s.bPool = IBPool(_bPool);
        s.controller = msg.sender;
        s.publicSwapSetter = msg.sender;
        lpts().name = _name;
        lpts().symbol = _symbol;
        _mintPoolShare(_initialSupply);
        _pushPoolShare(msg.sender, _initialSupply);
    }

    function setController(address _controller) onlyController noReentry external {
        lpbs().controller = _controller;
    }

    function setPublicSwapSetter(address _newPublicSwapSetter) onlyController external {
        lpbs().publicSwapSetter = _newPublicSwapSetter;
    }

    function setPublicSwap(bool _public) onlyPublicSwapSetter external {
        lpbs().bPool.setPublicSwap(_public);
    }

    function setSwapFee(uint256 _swapFee) onlyController external {
        lpbs().bPool.setSwapFee(_swapFee);
    }

    function joinPool(uint256 _amount) external override virtual ready {
        _joinPool(_amount);
    }

    function _joinPool(uint256 _amount) internal virtual ready {
        IBPool bPool = lpbs().bPool;
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

    function exitPool(uint256 _amount) external override ready noReentry {
        IBPool bPool = lpbs().bPool;
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

    function getTokens() external view override returns(address[] memory) {
        return lpbs().bPool.getCurrentTokens();
    }

    function calcTokensForAmount(uint256 _amount) external view override returns(address[] memory tokens, uint256[] memory amounts) {
        tokens = lpbs().bPool.getCurrentTokens();
        amounts = new uint256[](tokens.length);
        uint256 ratio = bdiv(_amount, totalSupply());

        for(uint256 i = 0; i < tokens.length; i ++) {
            address t = tokens[i];
            uint256 bal = lpbs().bPool.getBalance(t);
            uint256 amount = bmul(ratio, bal);
            amounts[i] = amount;
        }
    }

    function getController() external view override returns(address) {
        return lpbs().controller;
    }

    function getPublicSwapSetter() external view returns(address) {
        return lpbs().publicSwapSetter;
    }

    function isPublicSwap() external view returns (bool) {
        return lpbs().bPool.isPublicSwap();
    }

    function getSwapFee() external view returns (uint256) {
        return lpbs().bPool.getSwapFee();
    }

    function getBPool() external view returns(address) {
        return address(lpbs().bPool);
    }

    // Pull tokens from address and rebind BPool
    function _pullUnderlying(address _token, address _from, uint _amount)
        internal
    {   
        IBPool bPool = lpbs().bPool;
        // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
        uint tokenBalance = bPool.getBalance(_token);
        uint tokenWeight = bPool.getDenormalizedWeight(_token);

        bool xfer = IERC20(_token).transferFrom(_from, address(this), _amount);
        IERC20(_token).approve(address(bPool), _amount);
        require(xfer, "ERR_ERC20_FALSE");
        bPool.rebind(_token, badd(tokenBalance, _amount), tokenWeight);
    }

    // Rebind BPool and push tokens to address
    function _pushUnderlying(address _token, address _to, uint _amount)
        internal
    {   
        IBPool bPool = lpbs().bPool;
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

    // Load p basic storage
    function lpbs() internal pure returns (pbs storage s) {
        bytes32 loc = pbsSlot;
        assembly {
            s_slot := loc
        }
    }

}