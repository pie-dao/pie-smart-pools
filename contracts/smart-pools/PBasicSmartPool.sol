pragma solidity 0.6.4;

import "../interfaces/IBPool.sol";
import "../interfaces/IPSmartPool.sol";
import "../PCToken.sol";
import {PCTokenStorage as PCStorage} from "./storage/PCTokenStorage.sol";
import "../ReentryProtection.sol";

contract PBasicSmartPool is IPSmartPool, PCToken, ReentryProtection {
  // P Basic Smart Struct
  bytes32 public constant pbsSlot = keccak256("PBasicSmartPool.storage.location");
  struct pbs {
    IBPool bPool;
    address controller;
    address publicSwapSetter;
    address tokenBinder;
  }

  modifier ready() {
    require(address(lpbs().bPool) != address(0), "PBasicSmartPool.ready: not ready");
    _;
  }

  event LOG_JOIN(address indexed caller, address indexed tokenIn, uint256 tokenAmountIn);

  event LOG_EXIT(address indexed caller, address indexed tokenOut, uint256 tokenAmountOut);

  event TokensApproved();
  event ControllerChanged(address indexed previousController, address indexed newController);
  event PublicSwapSetterChanged(address indexed previousSetter, address indexed newSetter);
  event TokenBinderChanged(address indexed previousTokenBinder, address indexed newTokenBinder);
  event PublicSwapSet(address indexed setter, bool indexed value);
  event SwapFeeSet(address indexed setter, uint256 newFee);
  event PoolJoined(address indexed from, uint256 amount);
  event PoolExited(address indexed from, uint256 amount);
  event PoolExitedWithLoss(address indexed from, uint256 amount, address[] lossTokens);

  modifier onlyController() {
    require(msg.sender == lpbs().controller, "PBasicSmartPool.onlyController: not controller");
    _;
  }

  modifier onlyPublicSwapSetter() {
    require(
      msg.sender == lpbs().publicSwapSetter,
      "PBasicSmartPool.onlyPublicSwapSetter: not public swap setter"
    );
    _;
  }

  modifier onlyTokenBinder() {
    require(msg.sender == lpbs().tokenBinder, "PBasicSmartPool.onlyTokenBinder: not token binder");
    _;
  }

  /**
        @notice Initialises the contract
        @param _bPool Address of the underlying balancer pool
        @param _name Name for the smart pool token
        @param _symbol Symbol for the smart pool token
        @param _initialSupply Initial token supply to mint
    */
  function init(
    address _bPool,
    string calldata _name,
    string calldata _symbol,
    uint256 _initialSupply
  ) external override {
    pbs storage s = lpbs();
    require(address(s.bPool) == address(0), "PBasicSmartPool.init: already initialised");
    require(_bPool != address(0), "PBasicSmartPool.init: _bPool cannot be 0x00....000");
    require(_initialSupply != 0, "PBasicSmartPool.init: _initialSupply can not zero");
    s.bPool = IBPool(_bPool);
    s.controller = msg.sender;
    s.publicSwapSetter = msg.sender;
    s.tokenBinder = msg.sender;
    PCStorage.load().name = _name;
    PCStorage.load().symbol = _symbol;
    _mintPoolShare(_initialSupply);
    _pushPoolShare(msg.sender, _initialSupply);
  }

  /**
        @notice Sets approval to all tokens to the underlying balancer pool
        @dev It uses this function to save on gas in joinPool
    */
  function approveTokens() public override noReentry {
    IBPool bPool = lpbs().bPool;
    address[] memory tokens = bPool.getCurrentTokens();
    for (uint256 i = 0; i < tokens.length; i++) {
      IERC20(tokens[i]).approve(address(bPool), uint256(-1));
    }
    emit TokensApproved();
  }

  /**
        @notice Sets the controller address. Can only be set by the current controller
        @param _controller Address of the new controller
    */
  function setController(address _controller) external override onlyController noReentry {
    emit ControllerChanged(lpbs().controller, _controller);
    lpbs().controller = _controller;
  }

  /**
        @notice Sets public swap setter address. Can only be set by the controller
        @param _newPublicSwapSetter Address of the new public swap setter
    */
  function setPublicSwapSetter(address _newPublicSwapSetter)
    external
    override
    onlyController
    noReentry
  {
    emit PublicSwapSetterChanged(lpbs().publicSwapSetter, _newPublicSwapSetter);
    lpbs().publicSwapSetter = _newPublicSwapSetter;
  }

  /**
        @notice Sets the token binder address. Can only be set by the controller
        @param _newTokenBinder Address of the new token binder
    */
  function setTokenBinder(address _newTokenBinder) external override onlyController noReentry {
    emit TokenBinderChanged(lpbs().tokenBinder, _newTokenBinder);
    lpbs().tokenBinder = _newTokenBinder;
  }

  /**
        @notice Enables or disables public swapping on the underlying balancer pool.
                Can only be set by the controller.
        @param _public Public or not
    */
  function setPublicSwap(bool _public) external onlyPublicSwapSetter noReentry {
    emit PublicSwapSet(msg.sender, _public);
    lpbs().bPool.setPublicSwap(_public);
  }

  /**
        @notice Set the swap fee on the underlying balancer pool.
                Can only be called by the controller.
        @param _swapFee The new swap fee
    */
  function setSwapFee(uint256 _swapFee) external onlyController noReentry {
    emit SwapFeeSet(msg.sender, _swapFee);
    lpbs().bPool.setSwapFee(_swapFee);
  }

  /**
        @notice Mints pool shares in exchange for underlying assets.
        @param _amount Amount of pool shares to mint
    */

  function joinPool(uint256 _amount) external virtual override ready noReentry {
    _joinPool(_amount);
  }

  /**
        @notice Internal join pool function. See joinPool for more info
        @param _amount Amount of pool shares to mint
    */
  function _joinPool(uint256 _amount) internal virtual ready {
    IBPool bPool = lpbs().bPool;
    uint256 poolTotal = totalSupply();
    uint256 ratio = _amount.bdiv(poolTotal);
    require(ratio != 0);

    address[] memory tokens = bPool.getCurrentTokens();

    for (uint256 i = 0; i < tokens.length; i++) {
      address t = tokens[i];
      uint256 bal = bPool.getBalance(t);
      uint256 tokenAmountIn = ratio.bmul(bal);
      emit LOG_JOIN(msg.sender, t, tokenAmountIn);
      _pullUnderlying(t, msg.sender, tokenAmountIn, bal);
    }
    _mintPoolShare(_amount);
    _pushPoolShare(msg.sender, _amount);
    emit PoolJoined(msg.sender, _amount);
  }

  /**
        @notice Burns pool shares and sends back the underlying assets
        @param _amount Amount of pool tokens to burn
    */
  function exitPool(uint256 _amount) external override ready noReentry {
    IBPool bPool = lpbs().bPool;
    uint256 poolTotal = totalSupply();
    uint256 ratio = _amount.bdiv(poolTotal);
    require(ratio != 0);

    _pullPoolShare(msg.sender, _amount);
    _burnPoolShare(_amount);

    address[] memory tokens = bPool.getCurrentTokens();

    for (uint256 i = 0; i < tokens.length; i++) {
      address t = tokens[i];
      uint256 bal = bPool.getBalance(t);
      uint256 tAo = ratio.bmul(bal);
      emit LOG_EXIT(msg.sender, t, tAo);
      _pushUnderlying(t, msg.sender, tAo, bal);
    }
    emit PoolExited(msg.sender, _amount);
  }

  /**
        @notice Joinswap single asset pool entry given token amount in
        @param _token Address of entry token
        @param _amountIn Amount of entry tokens
        @return poolAmountOut
    */
  function joinswapExternAmountIn(address _token, uint256 _amountIn)
    external
    ready
    noReentry
    returns (uint256 poolAmountOut)
  {
    IBPool bPool = lpbs().bPool;

    require(bPool.isBound(_token), "PBasicSmartPool.joinswapExternAmountIn: Token Not Bound");

    poolAmountOut = bPool.calcPoolOutGivenSingleIn(
      bPool.getBalance(_token),
      bPool.getDenormalizedWeight(_token),
      totalSupply(),
      bPool.getTotalDenormalizedWeight(),
      _amountIn,
      bPool.getSwapFee()
    );

    emit LOG_JOIN(msg.sender, _token, _amountIn);

    _mintPoolShare(poolAmountOut);
    _pushPoolShare(msg.sender, poolAmountOut);

    emit PoolJoined(msg.sender, poolAmountOut);

    uint256 bal = bPool.getBalance(_token);
    _pullUnderlying(_token, msg.sender, _amountIn, bal);

    return poolAmountOut;
  }

  /**
        @notice Joinswap single asset pool entry given pool amount out
        @param _token Address of entry token
        @param _amountOut Amount of entry tokens to deposit into the pool
        @return tokenAmountIn
    */
  function joinswapPoolAmountOut(address _token, uint256 _amountOut)
    external
    ready
    noReentry
    returns (uint256 tokenAmountIn)
  {
    IBPool bPool = lpbs().bPool;

    require(bPool.isBound(_token), "PBasicSmartPool.joinswapPoolAmountOut: Token Not Bound");

    tokenAmountIn = bPool.calcSingleInGivenPoolOut(
      bPool.getBalance(_token),
      bPool.getDenormalizedWeight(_token),
      totalSupply(),
      bPool.getTotalDenormalizedWeight(),
      _amountOut,
      bPool.getSwapFee()
    );

    emit LOG_JOIN(msg.sender, _token, tokenAmountIn);

    _mintPoolShare(_amountOut);
    _pushPoolShare(msg.sender, _amountOut);

    emit PoolJoined(msg.sender, _amountOut);

    uint256 bal = bPool.getBalance(_token);
    _pullUnderlying(_token, msg.sender, tokenAmountIn, bal);

    return tokenAmountIn;
  }

  /**
        @notice Exitswap single asset pool exit given pool amount in
        @param _token Address of exit token
        @param _poolAmountIn Amount of pool tokens sending to the pool
        @return tokenAmountOut amount of exit tokens being withdrawn
    */
  function exitswapPoolAmountIn(address _token, uint256 _poolAmountIn)
    external
    ready
    noReentry
    returns (uint256 tokenAmountOut)
  {
    IBPool bPool = lpbs().bPool;

    require(bPool.isBound(_token), "PBasicSmartPool.exitswapPoolAmountIn: Token Not Bound");

    tokenAmountOut = bPool.calcSingleOutGivenPoolIn(
      bPool.getBalance(_token),
      bPool.getDenormalizedWeight(_token),
      totalSupply(),
      bPool.getTotalDenormalizedWeight(),
      _poolAmountIn,
      bPool.getSwapFee()
    );

    emit LOG_EXIT(msg.sender, _token, tokenAmountOut);

    _pullPoolShare(msg.sender, _poolAmountIn);
    _burnPoolShare(_poolAmountIn);

    emit PoolExited(msg.sender, tokenAmountOut);

    uint256 bal = bPool.getBalance(_token);
    _pushUnderlying(_token, msg.sender, tokenAmountOut, bal);

    return tokenAmountOut;
  }

  /**
        @notice Exitswap single asset pool entry given token amount out
        @param _token Address of exit token
        @param _tokenAmountOut Amount of exit tokens
        @return poolAmountIn amount of pool tokens being deposited
    */
  function exitswapExternAmountOut(address _token, uint256 _tokenAmountOut)
    external
    ready
    noReentry
    returns (uint256 poolAmountIn)
  {
    IBPool bPool = lpbs().bPool;

    require(bPool.isBound(_token), "PBasicSmartPool.exitswapExternAmountOut: Token Not Bound");

    poolAmountIn = bPool.calcPoolInGivenSingleOut(
      bPool.getBalance(_token),
      bPool.getDenormalizedWeight(_token),
      totalSupply(),
      bPool.getTotalDenormalizedWeight(),
      _tokenAmountOut,
      bPool.getSwapFee()
    );

    emit LOG_EXIT(msg.sender, _token, _tokenAmountOut);

    _pullPoolShare(msg.sender, poolAmountIn);
    _burnPoolShare(poolAmountIn);

    emit PoolExited(msg.sender, _tokenAmountOut);

    uint256 bal = bPool.getBalance(_token);
    _pushUnderlying(_token, msg.sender, _tokenAmountOut, bal);

    return poolAmountIn;
  }

  /**
        @notice Burns pool shares and sends back the underlying assets leaving some in the pool
        @param _amount Amount of pool tokens to burn
        @param _lossTokens Tokens skipped on redemption
    */
  function exitPoolTakingloss(uint256 _amount, address[] calldata _lossTokens)
    external
    ready
    noReentry
  {
    IBPool bPool = lpbs().bPool;
    uint256 poolTotal = totalSupply();
    uint256 ratio = _amount.bdiv(poolTotal);
    require(ratio != 0);

    _pullPoolShare(msg.sender, _amount);
    _burnPoolShare(_amount);

    address[] memory tokens = bPool.getCurrentTokens();

    for (uint256 i = 0; i < tokens.length; i++) {
      // If taking loss on token skip one iteration of the loop
      if (_contains(tokens[i], _lossTokens)) {
        continue;
      }
      address t = tokens[i];
      uint256 bal = bPool.getBalance(t);
      uint256 tAo = ratio.bmul(bal);
      emit LOG_EXIT(msg.sender, t, tAo);
      _pushUnderlying(t, msg.sender, tAo, bal);
    }
    emit PoolExitedWithLoss(msg.sender, _amount, _lossTokens);
  }

  /**
        @notice Bind a token to the underlying balancer pool. Can only be called by the token binder
        @param _token Token to bind
        @param _balance Amount to bind
        @param _denorm Denormalised weight
    */
  function bind(
    address _token,
    uint256 _balance,
    uint256 _denorm
  ) external onlyTokenBinder noReentry {
    IBPool bPool = lpbs().bPool;
    IERC20 token = IERC20(_token);
    require(
      token.transferFrom(msg.sender, address(this), _balance),
      "PBasicSmartPool.bind: transferFrom failed"
    );
    token.approve(address(bPool), uint256(-1));
    bPool.bind(_token, _balance, _denorm);
  }

  /**
        @notice Rebind a token to the pool
        @param _token Token to bind
        @param _balance Amount to bind
        @param _denorm Denormalised weight
    */
  function rebind(
    address _token,
    uint256 _balance,
    uint256 _denorm
  ) external onlyTokenBinder noReentry {
    IBPool bPool = lpbs().bPool;
    IERC20 token = IERC20(_token);

    // gulp old non acounted for token balance in the contract
    bPool.gulp(_token);

    uint256 oldBalance = token.balanceOf(address(bPool));
    // If tokens need to be pulled from msg.sender
    if (_balance > oldBalance) {
      require(
        token.transferFrom(msg.sender, address(this), _balance.bsub(oldBalance)),
        "PBasicSmartPool.rebind: transferFrom failed"
      );
      token.approve(address(bPool), uint256(-1));
    }

    bPool.rebind(_token, _balance, _denorm);

    // If any tokens are in this contract send them to msg.sender
    uint256 tokenBalance = token.balanceOf(address(this));
    if (tokenBalance > 0) {
      require(token.transfer(msg.sender, tokenBalance), "PBasicSmartPool.rebind: transfer failed");
    }
  }

  /**
        @notice Unbind a token
        @param _token Token to unbind
    */
  function unbind(address _token) external onlyTokenBinder noReentry {
    IBPool bPool = lpbs().bPool;
    IERC20 token = IERC20(_token);
    // unbind the token in the bPool
    bPool.unbind(_token);

    // If any tokens are in this contract send them to msg.sender
    uint256 tokenBalance = token.balanceOf(address(this));
    if (tokenBalance > 0) {
      require(token.transfer(msg.sender, tokenBalance), "PBasicSmartPool.unbind: transfer failed");
    }
  }

  function getTokens() external override view returns (address[] memory) {
    return lpbs().bPool.getCurrentTokens();
  }

  /**
        @notice Gets the underlying assets and amounts to mint specific pool shares.
        @param _amount Amount of pool shares to calculate the values for
        @return tokens The addresses of the tokens
        @return amounts The amounts of tokens needed to mint that amount of pool shares
    */
  function calcTokensForAmount(uint256 _amount)
    external
    override
    view
    returns (address[] memory tokens, uint256[] memory amounts)
  {
    tokens = lpbs().bPool.getCurrentTokens();
    amounts = new uint256[](tokens.length);
    uint256 ratio = _amount.bdiv(totalSupply());

    for (uint256 i = 0; i < tokens.length; i++) {
      address t = tokens[i];
      uint256 bal = lpbs().bPool.getBalance(t);
      uint256 amount = ratio.bmul(bal);
      amounts[i] = amount;
    }
  }

  /**
        @notice Get the address of the controller
        @return The address of the pool
    */
  function getController() external override view returns (address) {
    return lpbs().controller;
  }

  /**
        @notice Get the address of the public swap setter
        @return The public swap setter address
    */
  function getPublicSwapSetter() external view returns (address) {
    return lpbs().publicSwapSetter;
  }

  /**
        @notice Get the address of the token binder
        @return The token binder address
    */
  function getTokenBinder() external view returns (address) {
    return lpbs().tokenBinder;
  }

  /**
        @notice Get if public swapping is enabled
        @return If public swapping is enabled
    */
  function isPublicSwap() external view returns (bool) {
    return lpbs().bPool.isPublicSwap();
  }

  /**
        @notice Not Supported in PieDAO implementation of Balancer Smart Pools
    */
  function finalizeSmartPool() external view {
    revert("PBasicSmartPool.finalizeSmartPool: unsupported function");
  }

  /**
        @notice Not Supported in PieDAO implementation of Balancer Smart Pools
    */
  function createPool(uint256 initialSupply) external view {
    revert("PBasicSmartPool.createPool: unsupported function");
  }

  /**
        @notice Get the current swap fee
        @return The current swap fee
    */
  function getSwapFee() external view returns (uint256) {
    return lpbs().bPool.getSwapFee();
  }

  /**
        @notice Get the address of the underlying Balancer pool
        @return The address of the underlying balancer pool
    */
  function getBPool() external view returns (address) {
    return address(lpbs().bPool);
  }

  /**
        @notice Get the denormalized weight of a specific token in the underlying balancer pool
        @return the normalized weight of the token in uint
  */
  function getDenormalizedWeight(address _token) external view returns (uint256) {
    return lpbs().bPool.getDenormalizedWeight(_token);
  }

  /**
        @notice Pull the underlying token from an address and rebind it to the balancer pool
        @param _token Address of the token to pull
        @param _from Address to pull the token from
        @param _amount Amount of token to pull
        @param _tokenBalance Balance of the token already in the balancer pool
    */
  function _pullUnderlying(
    address _token,
    address _from,
    uint256 _amount,
    uint256 _tokenBalance
  ) internal {
    IBPool bPool = lpbs().bPool;
    // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
    uint256 tokenWeight = bPool.getDenormalizedWeight(_token);

    require(
      IERC20(_token).transferFrom(_from, address(this), _amount),
      "PBasicSmartPool._pullUnderlying: transferFrom failed"
    );
    bPool.rebind(_token, _tokenBalance.badd(_amount), tokenWeight);
  }

  /**
        @notice Push a underlying token and rebind the token to the balancer pool
        @param _token Address of the token to push
        @param _to Address to pull the token to
        @param _amount Amount of token to push
        @param _tokenBalance Balance of the token already in the balancer pool
    */
  function _pushUnderlying(
    address _token,
    address _to,
    uint256 _amount,
    uint256 _tokenBalance
  ) internal {
    IBPool bPool = lpbs().bPool;
    // Gets current Balance of token i, Bi, and weight of token i, Wi, from BPool.
    uint256 tokenWeight = bPool.getDenormalizedWeight(_token);
    bPool.rebind(_token, _tokenBalance.bsub(_amount), tokenWeight);

    require(
      IERC20(_token).transfer(_to, _amount),
      "PBasicSmartPool._pushUnderlying: transfer failed"
    );
  }

  /**
        @notice Pull pool shares
        @param _from Address to pull pool shares from
        @param _amount Amount of pool shares to pull
    */
  function _pullPoolShare(address _from, uint256 _amount) internal {
    _pull(_from, _amount);
  }

  /**
        @notice Burn pool shares
        @param _amount Amount of pool shares to burn
    */
  function _burnPoolShare(uint256 _amount) internal {
    _burn(_amount);
  }

  /**
        @notice Mint pool shares
        @param _amount Amount of pool shares to mint
    */
  function _mintPoolShare(uint256 _amount) internal {
    _mint(_amount);
  }

  /**
        @notice Push pool shares to account
        @param _to Address to push the pool shares to
        @param _amount Amount of pool shares to push
    */
  function _pushPoolShare(address _to, uint256 _amount) internal {
    _push(_to, _amount);
  }

  /**
        @notice Searches for an address in an array of addresses and returns if found
        @param _needle Address to look for
        @param _haystack Array to search
        @return If value is found
    */
  function _contains(address _needle, address[] memory _haystack) internal pure returns (bool) {
    for (uint256 i = 0; i < _haystack.length; i++) {
      if (_haystack[i] == _needle) {
        return true;
      }
    }
    return false;
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
