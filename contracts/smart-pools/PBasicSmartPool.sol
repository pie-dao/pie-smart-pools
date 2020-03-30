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
        require(msg.sender == lpbs().controller, "PBasicSmartPool.onlyController: not controller");
        _;
    }

    modifier onlyPublicSwapSetter() {
        require(msg.sender == lpbs().controller, "PBasicSmartPool.publicSwapSetter: not owner");
        _;
    }

    /**
        @notice Initialises the contract
        @param _bPool Address of the underlying balancer pool
        @param _name Name for the smart pool token
        @param _symbol Symbol for the smart pool token
        @param _initialSupply Initial token supply to mint
    */
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
        
        // approve tokens now to save gas on joining the pool
        // approveTokens();
    }

    /**
        @notice Sets approval to all tokens to the underlying balancer pool
        @dev It uses this function to save on gas in joinPool
    */
    function approveTokens() public {
        IBPool bPool = lpbs().bPool;
        address[] memory tokens = bPool.getCurrentTokens();
        for(uint256 i = 0; i < tokens.length; i ++) {
            IERC20(tokens[i]).approve(address(bPool), uint256(-1));
        }
    }

    /**
        @notice Sets the controller address. Can only be called by the current controller
        @param _controller Address of the new controller
    */
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

    /**
        @notice Internal join pool function. See joinPool for more info
    */
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
            _pullUnderlying(t, msg.sender, tokenAmountIn, bal);
        }
        _mintPoolShare(_amount);
        _pushPoolShare(msg.sender, _amount);
    }

    /** 
        @notice Burns pool shares and sends back the underlying assets
        @param _amount Amount of pool tokens to burn
    */
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
            _pushUnderlying(t, msg.sender, tAo, bal);
        }
    }

    function getTokens() external view override returns(address[] memory) {
        return lpbs().bPool.getCurrentTokens();
    }

    /**
        @notice Gets the underlying assets and amounts to mint specific pool shares.
        @param _amount Amount of pool shares to calculate the values for
        @return tokens The addresses of the tokens
        @return amounts The amounts of tokens needed to mint that amount of pool shares
    */
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

    /** 
        @notice Get the address of the controller
        @return The address of the pool
    */
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

    /**
        @notice Get the address of the underlying Balancer pool
        @return The address of the underlying balancer pool
    */
    function getBPool() external view returns(address) {
        return address(lpbs().bPool);
    }

    /**
        @notice Pull the underlying token from an address and rebind it to the balancer pool
        @param _token Address of the token to pull
        @param _from Address to pull the token from
        @param _amount Amount of token to pull
        @param _tokenBalance Balance of the token already in the balancer pool
    */
    function _pullUnderlying(address _token, address _from, uint256 _amount, uint256 _tokenBalance)
        internal
    {   
        IBPool bPool = lpbs().bPool;
        // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
        uint tokenWeight = bPool.getDenormalizedWeight(_token);

        bool xfer = IERC20(_token).transferFrom(_from, address(this), _amount);
        require(xfer, "ERR_ERC20_FALSE");
        bPool.rebind(_token, badd(_tokenBalance, _amount), tokenWeight);
    }

    /** 
        @notice Push a underlying token and rebind the token to the balancer pool
        @param _token Address of the token to push
        @param _to Address to pull the token to
        @param _amount Amount of token to push
        @param _tokenBalance Balance of the token already in the balancer pool
    */
    function _pushUnderlying(address _token, address _to, uint256 _amount, uint256 _tokenBalance)
        internal
    {   
        IBPool bPool = lpbs().bPool;
        // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
        uint tokenWeight = bPool.getDenormalizedWeight(_token);
        bPool.rebind(_token, bsub(_tokenBalance, _amount), tokenWeight);

        bool xfer = IERC20(_token).transfer(_to, _amount);
        require(xfer, "ERR_ERC20_FALSE");
    }

    /**
        @notice Pull pool shares
        @param _from Address to pull pool shares from
        @param _amount Amount of pool shares to pull
    */
    function _pullPoolShare(address _from, uint256 _amount)
        internal
    {
        _pull(_from, _amount);
    }

    /**
        @notice Burn pool shares
        @param _amount Amount of pool shares to burn
    */
    function _burnPoolShare(uint256 _amount)
        internal
    {
        _burn(_amount);
    }

    /** 
        @notice Mint pool shares 
        @param _amount Amount of pool shares to mint
    */
    function _mintPoolShare(uint256 _amount)
        internal
    {
        _mint(_amount);
    }

    /**
        @notice Push pool shares to account
        @param _to Address to push the pool shares to
        @param _amount Amount of pool shares to push
    */
    function _pushPoolShare(address _to, uint256 _amount)
        internal
    {
        _push(_to, _amount);
    }

    /**
        @notice Load PBasicPool storage
        @return s Pointer to the storage struct
    */
    function lpbs() internal pure returns (pbs storage s) {
        bytes32 loc = pbsSlot;
        assembly {
            s_slot := loc
        }
    }

}