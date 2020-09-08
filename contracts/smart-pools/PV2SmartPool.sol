pragma experimental ABIEncoderV2;
pragma solidity 0.6.4;

import "../interfaces/IPV2SmartPool.sol";
import "../interfaces/IBPool.sol";
import "../PCToken.sol";
import "../ReentryProtection.sol";

import "../libraries/LibPoolToken.sol";
import "../libraries/LibAddRemoveToken.sol";
import "../libraries/LibPoolEntryExit.sol";
import "../libraries/LibPoolMath.sol";
import "../libraries/LibWeights.sol";
import "../libraries/LibSafeApprove.sol";

import {PBasicSmartPoolStorage as PBStorage} from "../storage/PBasicSmartPoolStorage.sol";
import {PCTokenStorage as PCStorage} from "../storage/PCTokenStorage.sol";
import {PCappedSmartPoolStorage as PCSStorage} from "../storage/PCappedSmartPoolStorage.sol";
import {PV2SmartPoolStorage as P2Storage} from "../storage/PV2SmartPoolStorage.sol";

contract PV2SmartPool is IPV2SmartPool, PCToken, ReentryProtection {
  using LibSafeApprove for IERC20;

  event TokensApproved();
  event ControllerChanged(address indexed previousController, address indexed newController);
  event PublicSwapSetterChanged(address indexed previousSetter, address indexed newSetter);
  event TokenBinderChanged(address indexed previousTokenBinder, address indexed newTokenBinder);
  event PublicSwapSet(address indexed setter, bool indexed value);
  event SwapFeeSet(address indexed setter, uint256 newFee);
  event CapChanged(address indexed setter, uint256 oldCap, uint256 newCap);
  event CircuitBreakerTripped();
  event JoinExitEnabledChanged(address indexed setter, bool oldValue, bool newValue);
  event CircuitBreakerChanged(
    address indexed _oldCircuitBreaker,
    address indexed _newCircuitBreaker
  );

  modifier ready() {
    require(address(PBStorage.load().bPool) != address(0), "PV2SmartPool.ready: not ready");
    _;
  }

  modifier onlyController() {
    require(
      msg.sender == PBStorage.load().controller,
      "PV2SmartPool.onlyController: not controller"
    );
    _;
  }

  modifier onlyPublicSwapSetter() {
    require(
      msg.sender == PBStorage.load().publicSwapSetter,
      "PV2SmartPool.onlyPublicSwapSetter: not public swap setter"
    );
    _;
  }

  modifier onlyTokenBinder() {
    require(
      msg.sender == PBStorage.load().tokenBinder,
      "PV2SmartPool.onlyTokenBinder: not token binder"
    );
    _;
  }

  modifier onlyPublicSwap() {
    require(
      PBStorage.load().bPool.isPublicSwap(),
      "PV2SmartPool.onlyPublicSwap: swapping not enabled"
    );
    _;
  }

  modifier onlyCircuitBreaker() {
    require(
      msg.sender == P2Storage.load().circuitBreaker,
      "PV2SmartPool.onlyCircuitBreaker: not circuit breaker"
    );
    _;
  }

  modifier onlyJoinExitEnabled() {
    require(
      P2Storage.load().joinExitEnabled,
      "PV2SmartPool.onlyJoinExitEnabled: join and exit not enabled"
    );
    _;
  }

  modifier withinCap() {
    _;
    require(totalSupply() < PCSStorage.load().cap, "PV2SmartPool.withinCap: Cap limit reached");
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
    PBStorage.StorageStruct storage s = PBStorage.load();
    require(address(s.bPool) == address(0), "PV2SmartPool.init: already initialised");
    require(_bPool != address(0), "PV2SmartPool.init: _bPool cannot be 0x00....000");
    require(_initialSupply != 0, "PV2SmartPool.init: _initialSupply can not zero");
    s.bPool = IBPool(_bPool);
    s.controller = msg.sender;
    s.publicSwapSetter = msg.sender;
    s.tokenBinder = msg.sender;
    PCStorage.load().name = _name;
    PCStorage.load().symbol = _symbol;

    LibPoolToken._mint(msg.sender, _initialSupply);
  }

  /**
    @notice Sets approval to all tokens to the underlying balancer pool
    @dev It uses this function to save on gas in joinPool
  */
  function approveTokens() public override noReentry {
    IBPool bPool = PBStorage.load().bPool;
    address[] memory tokens = bPool.getCurrentTokens();
    for (uint256 i = 0; i < tokens.length; i++) {
      IERC20(tokens[i]).safeApprove(address(bPool), uint256(-1));
    }
    emit TokensApproved();
  }

  // POOL EXIT ------------------------------------------------

  /**
        @notice Burns pool shares and sends back the underlying assets leaving some in the pool
        @param _amount Amount of pool tokens to burn
        @param _lossTokens Tokens skipped on redemption
    */
  function exitPoolTakingloss(uint256 _amount, address[] calldata _lossTokens)
    external
    override
    ready
    noReentry
    onlyJoinExitEnabled
  {
    LibPoolEntryExit.exitPoolTakingloss(_amount, _lossTokens);
  }

  /**
        @notice Burns pool shares and sends back the underlying assets
        @param _amount Amount of pool tokens to burn
    */
  function exitPool(uint256 _amount) external override ready noReentry onlyJoinExitEnabled {
    LibPoolEntryExit.exitPool(_amount);
  }

  /**
    @notice Burn pool tokens and redeem underlying assets. With front running protection
    @param _amount Amount of pool tokens to burn
    @param _minAmountsOut Minimum amounts of underlying assets
  */
  function exitPool(uint256 _amount, uint256[] calldata _minAmountsOut)
    external
    override
    ready
    noReentry
    onlyJoinExitEnabled
  {
    LibPoolEntryExit.exitPool(_amount, _minAmountsOut);
  }

  /**
        @notice Exitswap single asset pool exit given pool amount in
        @param _token Address of exit token
        @param _poolAmountIn Amount of pool tokens sending to the pool
        @return tokenAmountOut amount of exit tokens being withdrawn
    */
  function exitswapPoolAmountIn(
    address _token,
    uint256 _poolAmountIn,
    uint256 _minAmountOut
  )
    external
    override
    ready
    noReentry
    onlyPublicSwap
    onlyJoinExitEnabled
    returns (uint256 tokenAmountOut)
  {
    return LibPoolEntryExit.exitswapPoolAmountIn(_token, _poolAmountIn, _minAmountOut);
  }

  /**
        @notice Exitswap single asset pool entry given token amount out
        @param _token Address of exit token
        @param _tokenAmountOut Amount of exit tokens
        @return poolAmountIn amount of pool tokens being deposited
    */
  function exitswapExternAmountOut(
    address _token,
    uint256 _tokenAmountOut,
    uint256 _maxPoolAmountIn
  )
    external
    override
    ready
    noReentry
    onlyPublicSwap
    onlyJoinExitEnabled
    returns (uint256 poolAmountIn)
  {
    return LibPoolEntryExit.exitswapExternAmountOut(_token, _tokenAmountOut, _maxPoolAmountIn);
  }

  // POOL ENTRY -----------------------------------------------
  /**
        @notice Takes underlying assets and mints smart pool tokens. Enforces the cap
        @param _amount Amount of pool tokens to mint
    */
  function joinPool(uint256 _amount)
    external
    override
    withinCap
    ready
    noReentry
    onlyJoinExitEnabled
  {
    LibPoolEntryExit.joinPool(_amount);
  }

  /**
      @notice Takes underlying assets and mints smart pool tokens.
      Enforces the cap. Allows you to specify the maximum amounts of underlying assets
      @param _amount Amount of pool tokens to mint
  */
  function joinPool(uint256 _amount, uint256[] calldata _maxAmountsIn)
    external
    override
    withinCap
    ready
    noReentry
    onlyJoinExitEnabled
  {
    LibPoolEntryExit.joinPool(_amount, _maxAmountsIn);
  }

  /**
        @notice Joinswap single asset pool entry given token amount in
        @param _token Address of entry token
        @param _amountIn Amount of entry tokens
        @return poolAmountOut
    */
  function joinswapExternAmountIn(
    address _token,
    uint256 _amountIn,
    uint256 _minPoolAmountOut
  )
    external
    override
    ready
    withinCap
    onlyPublicSwap
    noReentry
    onlyJoinExitEnabled
    returns (uint256 poolAmountOut)
  {
    return LibPoolEntryExit.joinswapExternAmountIn(_token, _amountIn, _minPoolAmountOut);
  }

  /**
        @notice Joinswap single asset pool entry given pool amount out
        @param _token Address of entry token
        @param _amountOut Amount of entry tokens to deposit into the pool
        @return tokenAmountIn
    */
  function joinswapPoolAmountOut(
    address _token,
    uint256 _amountOut,
    uint256 _maxAmountIn
  )
    external
    override
    ready
    withinCap
    onlyPublicSwap
    noReentry
    onlyJoinExitEnabled
    returns (uint256 tokenAmountIn)
  {
    return LibPoolEntryExit.joinswapPoolAmountOut(_token, _amountOut, _maxAmountIn);
  }

  // ADMIN FUNCTIONS ------------------------------------------

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
  ) external override onlyTokenBinder noReentry {
    P2Storage.StorageStruct storage ws = P2Storage.load();
    IBPool bPool = PBStorage.load().bPool;
    IERC20 token = IERC20(_token);
    require(
      token.transferFrom(msg.sender, address(this), _balance),
      "PV2SmartPool.bind: transferFrom failed"
    );
    // Cancel potential weight adjustment process.
    ws.startBlock = 0;
    token.safeApprove(address(bPool), uint256(-1));
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
  ) external override onlyTokenBinder noReentry {
    P2Storage.StorageStruct storage ws = P2Storage.load();
    IBPool bPool = PBStorage.load().bPool;
    IERC20 token = IERC20(_token);

    // gulp old non acounted for token balance in the contract
    bPool.gulp(_token);

    uint256 oldBalance = token.balanceOf(address(bPool));
    // If tokens need to be pulled from msg.sender
    if (_balance > oldBalance) {
      require(
        token.transferFrom(msg.sender, address(this), _balance.bsub(oldBalance)),
        "PV2SmartPool.rebind: transferFrom failed"
      );
      token.safeApprove(address(bPool), uint256(-1));
    }

    bPool.rebind(_token, _balance, _denorm);
    // Cancel potential weight adjustment process.
    ws.startBlock = 0;
    // If any tokens are in this contract send them to msg.sender
    uint256 tokenBalance = token.balanceOf(address(this));
    if (tokenBalance > 0) {
      require(token.transfer(msg.sender, tokenBalance), "PV2SmartPool.rebind: transfer failed");
    }
  }

  /**
        @notice Unbind a token
        @param _token Token to unbind
    */
  function unbind(address _token) external override onlyTokenBinder noReentry {
    P2Storage.StorageStruct storage ws = P2Storage.load();
    IBPool bPool = PBStorage.load().bPool;
    IERC20 token = IERC20(_token);
    // unbind the token in the bPool
    bPool.unbind(_token);

    // Cancel potential weight adjustment process.
    ws.startBlock = 0;

    // If any tokens are in this contract send them to msg.sender
    uint256 tokenBalance = token.balanceOf(address(this));
    if (tokenBalance > 0) {
      require(token.transfer(msg.sender, tokenBalance), "PV2SmartPool.unbind: transfer failed");
    }
  }

  /**
        @notice Sets the controller address. Can only be set by the current controller
        @param _controller Address of the new controller
    */
  function setController(address _controller) external override onlyController noReentry {
    emit ControllerChanged(PBStorage.load().controller, _controller);
    PBStorage.load().controller = _controller;
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
    emit PublicSwapSetterChanged(PBStorage.load().publicSwapSetter, _newPublicSwapSetter);
    PBStorage.load().publicSwapSetter = _newPublicSwapSetter;
  }

  /**
        @notice Sets the token binder address. Can only be set by the controller
        @param _newTokenBinder Address of the new token binder
    */
  function setTokenBinder(address _newTokenBinder) external override onlyController noReentry {
    emit TokenBinderChanged(PBStorage.load().tokenBinder, _newTokenBinder);
    PBStorage.load().tokenBinder = _newTokenBinder;
  }

  /**
        @notice Enables or disables public swapping on the underlying balancer pool.
                Can only be set by the controller.
        @param _public Public or not
    */
  function setPublicSwap(bool _public) external override onlyPublicSwapSetter noReentry {
    emit PublicSwapSet(msg.sender, _public);
    PBStorage.load().bPool.setPublicSwap(_public);
  }

  /**
        @notice Set the swap fee on the underlying balancer pool.
                Can only be called by the controller.
        @param _swapFee The new swap fee
    */
  function setSwapFee(uint256 _swapFee) external override onlyController noReentry {
    emit SwapFeeSet(msg.sender, _swapFee);
    PBStorage.load().bPool.setSwapFee(_swapFee);
  }

  /**
        @notice Set the maximum cap of the contract
        @param _cap New cap in wei
    */
  function setCap(uint256 _cap) external override onlyController noReentry {
    emit CapChanged(msg.sender, PCSStorage.load().cap, _cap);
    PCSStorage.load().cap = _cap;
  }

  /**
    @notice Enable or disable joining and exiting
    @param _newValue enabled or not
  */
  function setJoinExitEnabled(bool _newValue) external override onlyController noReentry {
    emit JoinExitEnabledChanged(msg.sender, P2Storage.load().joinExitEnabled, _newValue);
    P2Storage.load().joinExitEnabled = _newValue;
  }

  /**
    @notice Set the circuit breaker address. Can only be called by the controller
    @param _newCircuitBreaker Address of the new circuit breaker
  */
  function setCircuitBreaker(
    address _newCircuitBreaker
  ) external override onlyController noReentry {
    emit CircuitBreakerChanged(P2Storage.load().circuitBreaker, _newCircuitBreaker);
    P2Storage.load().circuitBreaker = _newCircuitBreaker;
  }

  /**
    @notice Set the annual fee. Can only be called by the controller
    @param _newFee new fee 10**18 == 100% per 365 days. Max 10%
  */
  function setAnnualFee(uint256 _newFee) external override onlyController noReentry {
    LibFees.setAnnualFee(_newFee);
  }

  /**
    @notice Charge the outstanding annual fee
  */
  function chargeOutstandingAnnualFee() external override noReentry {
    LibFees.chargeOutstandingAnnualFee();
  }

  /**
    @notice Set the address that receives the annual fee. Can only be called by the controller
  */
  function setFeeRecipient(address _newRecipient) external override onlyController noReentry {
    LibFees.setFeeRecipient(_newRecipient);
  }

  /**
    @notice Trip the circuit breaker which disabled exit, join and swaps
  */
  function tripCircuitBreaker() external override onlyCircuitBreaker {
    P2Storage.load().joinExitEnabled = false;
    PBStorage.load().bPool.setPublicSwap(false);
    emit CircuitBreakerTripped();
  }

  // TOKEN AND WEIGHT FUNCTIONS -------------------------------

  /**
    @notice Update the weight of a token. Can only be called by the controller
    @param _token Token to adjust the weight of
    @param _newWeight New denormalized weight
  */
  function updateWeight(address _token, uint256 _newWeight)
    external
    override
    noReentry
    onlyController
  {
    LibWeights.updateWeight(_token, _newWeight);
  }

  /**
    @notice Gradually adjust the weights of a token. Can only be called by the controller
    @param _newWeights Target weights
    @param _startBlock Block to start weight adjustment
    @param _endBlock Block to finish weight adjustment
  */
  function updateWeightsGradually(
    uint256[] calldata _newWeights,
    uint256 _startBlock,
    uint256 _endBlock
  ) external override noReentry onlyController {
    LibWeights.updateWeightsGradually(_newWeights, _startBlock, _endBlock);
  }

  /**
    @notice Poke the weight adjustment
  */
  function pokeWeights() external override noReentry {
    LibWeights.pokeWeights();
  }

  /**
    @notice Apply the adding of a token. Can only be called by the controller
  */
  function applyAddToken() external override noReentry onlyController {
    LibAddRemoveToken.applyAddToken();
  }

  /**
    @notice Commit a token to be added. Can only be called by the controller
    @param _token Address of the token to add
    @param _balance Amount of token to add
    @param _denormalizedWeight Denormalized weight
  */
  function commitAddToken(
    address _token,
    uint256 _balance,
    uint256 _denormalizedWeight
  ) external override noReentry onlyController {
    LibAddRemoveToken.commitAddToken(_token, _balance, _denormalizedWeight);
  }

  /**
    @notice Remove a token from the smart pool. Can only be called by the controller
    @param _token Address of the token to remove
  */
  function removeToken(address _token) external override noReentry onlyController {
    LibAddRemoveToken.removeToken(_token);
  }

  // VIEW FUNCTIONS -------------------------------------------

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
    return LibPoolMath.calcTokensForAmount(_amount);
  }

  /**
    @notice Calculate the amount of pool tokens out for a given amount in
    @param _token Address of the input token
    @param _amount Amount of input token
    @return Amount of pool token
  */
  function calcPoolOutGivenSingleIn(address _token, uint256 _amount)
    external
    override
    view
    returns (uint256)
  {
    return LibPoolMath.calcPoolOutGivenSingleIn(_token, _amount);
  }

  /**
    @notice Calculate single in given pool out
    @param _token Address of the input token
    @param _amount Amount of pool out token
    @return Amount of token in
  */
  function calcSingleInGivenPoolOut(address _token, uint256 _amount)
    external
    override
    view
    returns (uint256)
  {
    return LibPoolMath.calcSingleInGivenPoolOut(_token, _amount);
  }

  /**
    @notice Calculate single out given pool in
    @param _token Address of output token
    @param _amount Amount of pool in
    @return Amount of token in
  */
  function calcSingleOutGivenPoolIn(address _token, uint256 _amount)
    external
    override
    view
    returns (uint256)
  {
    return LibPoolMath.calcSingleOutGivenPoolIn(_token, _amount);
  }

  /**
    @notice Calculate pool in given single token out
    @param _token Address of output token
    @param _amount Amount of output token
    @return Amount of pool in
  */
  function calcPoolInGivenSingleOut(address _token, uint256 _amount)
    external
    override
    view
    returns (uint256)
  {
    return LibPoolMath.calcPoolInGivenSingleOut(_token, _amount);
  }

  /**
    @notice Get the current tokens in the smart pool
    @return Addresses of the tokens in the smart pool
  */
  function getTokens() external override view returns (address[] memory) {
    return PBStorage.load().bPool.getCurrentTokens();
  }

  /**
    @notice Get the address of the controller
    @return The address of the pool
  */
  function getController() external override view returns (address) {
    return PBStorage.load().controller;
  }

  /**
    @notice Get the address of the public swap setter
    @return The public swap setter address
  */
  function getPublicSwapSetter() external override view returns (address) {
    return PBStorage.load().publicSwapSetter;
  }

  /**
    @notice Get the address of the token binder
    @return The token binder address
  */
  function getTokenBinder() external override view returns (address) {
    return PBStorage.load().tokenBinder;
  }

  /**
    @notice Get the address of the circuitBreaker
    @return The address of the circuitBreaker
  */
  function getCircuitBreaker() external override view returns (address) {
    return P2Storage.load().circuitBreaker;
  }

  /**
    @notice Get if public swapping is enabled
    @return If public swapping is enabled
  */
  function isPublicSwap() external override view returns (bool) {
    return PBStorage.load().bPool.isPublicSwap();
  }

  /**
    @notice Get the current cap
    @return The current cap in wei
  */
  function getCap() external override view returns (uint256) {
    return PCSStorage.load().cap;
  }

  function getAnnualFee() external override view returns (uint256) {
    return P2Storage.load().annualFee;
  }

  function getFeeRecipient() external override view returns (address) {
    return P2Storage.load().feeRecipient;
  }

  /**
    @notice Get the denormalized weight of a specific token in the underlying balancer pool
    @return the normalized weight of the token in uint
  */
  function getDenormalizedWeight(address _token) external override view returns (uint256) {
    return PBStorage.load().bPool.getDenormalizedWeight(_token);
  }

  /**
    @notice Get all denormalized weights
    @return weights Denormalized weights
  */
  function getDenormalizedWeights() external override view returns (uint256[] memory weights) {
    PBStorage.StorageStruct storage s = PBStorage.load();
    address[] memory tokens = s.bPool.getCurrentTokens();
    weights = new uint256[](tokens.length);
    for (uint256 i = 0; i < tokens.length; i++) {
      weights[i] = s.bPool.getDenormalizedWeight(tokens[i]);
    }
  }

  /**
    @notice Get the address of the underlying Balancer pool
    @return The address of the underlying balancer pool
  */
  function getBPool() external override view returns (address) {
    return address(PBStorage.load().bPool);
  }

  /**
    @notice Get the current swap fee
    @return The current swap fee
  */
  function getSwapFee() external override view returns (uint256) {
    return PBStorage.load().bPool.getSwapFee();
  }

  /**
    @notice Get the target weights
    @return weights Target weights
  */
  function getNewWeights() external override view returns (uint256[] memory weights) {
    return P2Storage.load().newWeights;
  }

  /**
    @notice Get weights at start of weight adjustment
    @return weights Start weights
  */
  function getStartWeights() external override view returns (uint256[] memory weights) {
    return P2Storage.load().startWeights;
  }

  /**
    @notice Get start block of weight adjustment
    @return Start block
  */
  function getStartBlock() external override view returns (uint256) {
    return P2Storage.load().startBlock;
  }

  /**
    @notice Get end block of weight adjustment
    @return End block
  */
  function getEndBlock() external override view returns (uint256) {
    return P2Storage.load().endBlock;
  }

  /**
    @notice Get new token being added
    @return New token
  */
  function getNewToken() external override view returns (P2Storage.NewToken memory) {
    return P2Storage.load().newToken;
  }

  /**
    @notice Get if joining and exiting is enabled
    @return Enabled or not
  */
  function getJoinExitEnabled() external override view returns (bool) {
    return P2Storage.load().joinExitEnabled;
  }

  // UNSUPORTED METHODS ---------------------------------------

  /**
    @notice Not Supported in PieDAO implementation of Balancer Smart Pools
  */
  function finalizeSmartPool() external override view {
    revert("PV2SmartPool.finalizeSmartPool: unsupported function");
  }

  /**
    @notice Not Supported in PieDAO implementation of Balancer Smart Pools
  */
  function createPool(uint256 initialSupply) external override view {
    revert("PV2SmartPool.createPool: unsupported function");
  }
}
