pragma solidity 0.6.4;

import "./PCappedSmartPool.sol";


// Based on Balancer configurable weights pool

contract PAdjustableSmartPool is PCappedSmartPool {
  uint256 public constant MIN_WEIGHT = 10**18;
  uint256 public constant MAX_WEIGHT = 10**18 * 50;
  uint256 public constant MAX_TOTAL_WEIGHT = 10**18 * 50;
  uint256 public constant MIN_BALANCE = (10**18) / (10**12);

  bytes32 public constant pasSlot = keccak256("PAdjustableSmartPool.storage.location");

  struct pas {
    uint256 startBlock;
    uint256 endBlock;
    uint256[] startWeights;
    uint256[] newWeights;
  }

  function updateWeight(address _token, uint256 _newWeight) external noReentry onlyController {
    pbs storage s = lpbs();

    require(_newWeight >= MIN_WEIGHT, "ERR_MIN_WEIGHT");
    require(_newWeight <= MAX_WEIGHT, "ERR_MAX_WEIGHT");

    uint256 currentWeight = s.bPool.getDenormalizedWeight(_token);
    uint256 currentBalance = s.bPool.getBalance(_token);
    uint256 poolShares;
    uint256 deltaBalance;
    uint256 deltaWeight;
    uint256 totalSupply = totalSupply();
    uint256 totalWeight = s.bPool.getTotalDenormalizedWeight();

    if (_newWeight < currentWeight) {
      // If weight goes down we need to pull tokens and burn pool shares
      require(
        totalWeight.badd(currentWeight.bsub(_newWeight)) <= MAX_TOTAL_WEIGHT,
        "ERR_MAX_TOTAL_WEIGHT"
      );

      deltaWeight = currentWeight.bsub(_newWeight);

      poolShares = totalSupply.bmul(deltaWeight.bdiv(totalWeight));

      deltaBalance = currentBalance.bmul(deltaWeight.bdiv(currentWeight));

      // New balance cannot be lower than MIN_BALANCE
      require(currentBalance.bsub(deltaBalance) >= MIN_BALANCE, "ERR_MIN_BALANCE");
      // First gets the tokens from this contract (Pool Controller) to msg.sender
      s.bPool.rebind(_token, currentBalance.bsub(deltaBalance), _newWeight);

      // Now with the tokens this contract can send them to msg.sender
      require(IERC20(_token).transfer(msg.sender, deltaBalance), "ERR_ERC20_FALSE");

      _pullPoolShare(msg.sender, poolShares);
      _burnPoolShare(poolShares);
    } else {
      // This means the controller will deposit tokens to keep the price.
      // They will be minted and given PCTokens
      require(
        totalWeight.badd(_newWeight.bsub(currentWeight)) <= MAX_TOTAL_WEIGHT,
        "ERR_MAX_TOTAL_WEIGHT"
      );

      deltaWeight = _newWeight.bsub(currentWeight);
      poolShares = totalSupply.bmul(deltaWeight.bdiv(totalWeight));
      deltaBalance = currentBalance.bmul(deltaWeight.bdiv(currentWeight));

      // First gets the tokens from msg.sender to this contract (Pool Controller)
      require(
        IERC20(_token).transferFrom(msg.sender, address(this), deltaBalance),
        "TRANSFER_FAILED"
      );
      // Now with the tokens this contract can bind them to the pool it controls
      s.bPool.rebind(_token, currentBalance.badd(deltaBalance), _newWeight);

      _mintPoolShare(poolShares);
      _pushPoolShare(msg.sender, poolShares);
    }
  }

  // Let external actors poke the contract with pokeWeights(),
  // to slowly get to newWeights at endBlock
  function updateWeightsGradually(
    uint256[] calldata _newWeights,
    uint256 _startBlock,
    uint256 _endBlock
  ) external noReentry onlyController {
    pbs storage s = lpbs();
    pas storage ws = lpas();

    uint256 weightsSum = 0;
    address[] memory tokens = s.bPool.getCurrentTokens();
    // Check that endWeights are valid now to avoid reverting in a future pokeWeights call
    for (uint256 i = 0; i < tokens.length; i++) {
      require(_newWeights[i] <= MAX_WEIGHT, "ERR_WEIGHT_ABOVE_MAX");
      require(_newWeights[i] >= MIN_WEIGHT, "ERR_WEIGHT_BELOW_MIN");
      weightsSum = weightsSum.badd(_newWeights[i]);
    }
    require(weightsSum <= MAX_TOTAL_WEIGHT, "ERR_MAX_TOTAL_WEIGHT");

    if (block.number > _startBlock) {
      // This means the weight update should start ASAP
      ws.startBlock = block.number;
    } else {
        ws.startBlock = _startBlock;
    }
    ws.endBlock = _endBlock;
    ws.newWeights = _newWeights;

    require(
      _endBlock > _startBlock,
      "PWeightControlledSmartPool.updateWeightsGradually: End block must be after start block"
    );

    delete ws.startWeights;

    for (uint256 i = 0; i < tokens.length; i++) {
      // startWeights are current weights
      ws.startWeights.push(s.bPool.getDenormalizedWeight(tokens[i]));
    }
  }

  function pokeWeights() external noReentry {
    pas storage ws = lpas();
    pbs storage s = lpbs();
    require(block.number >= ws.startBlock, "ERR_CANT_POKE_YET");

    // This allows for pokes after endBlock that get weights to endWeights
    uint256 minBetweenEndBlockAndThisBlock;
    if (block.number > ws.endBlock) {
      minBetweenEndBlockAndThisBlock = ws.endBlock;
    } else {
      minBetweenEndBlockAndThisBlock = block.number;
    }

    uint256 blockPeriod = ws.endBlock.bsub(ws.startBlock);
    uint256 weightDelta;
    uint256 newWeight;
    address[] memory tokens = s.bPool.getCurrentTokens();
    for (uint256 i = 0; i < tokens.length; i++) {
      if (ws.startWeights[i] >= ws.newWeights[i]) {
        weightDelta = ws.startWeights[i].bsub(ws.newWeights[i]);
        newWeight = ws.startWeights[i].bsub(
          (minBetweenEndBlockAndThisBlock.bsub(ws.startBlock)).bmul(weightDelta.bdiv(blockPeriod))
        );
      } else {
        weightDelta = ws.newWeights[i].bsub(ws.startWeights[i]);
        newWeight = ws.startWeights[i].badd(
          (minBetweenEndBlockAndThisBlock.bsub(ws.startBlock)).bmul(weightDelta.bdiv(blockPeriod))
        );
      }
      s.bPool.rebind(tokens[i], s.bPool.getBalance(tokens[i]), newWeight);
    }
  }

  function applyAddToken() external {

  }

  function commitAddToken(address token, uint balance, uint denormalizedWeight) external {
    
  }

  function removeToken(address token) external {

  }

  function getDenormalizedWeights() external view returns (uint256[] memory weights) {
    pbs storage s = lpbs();
    address[] memory tokens = s.bPool.getCurrentTokens();
    weights = new uint256[](tokens.length);
    for (uint256 i = 0; i < tokens.length; i++) {
      weights[i] = s.bPool.getDenormalizedWeight(tokens[i]);
    }
  }

  function getNewWeights() external view returns (uint256[] memory weights) {
    return lpas().newWeights;
  }

  function getStartWeights() external view returns (uint256[] memory weights) {
    return lpas().startWeights;
  }

  function getStartBlock() external view returns (uint256) {
    return lpas().startBlock;
  }

  function getEndBlock() external view returns (uint256) {
    return lpas().endBlock;
  }

  function lpas() internal pure returns (pas storage s) {
    bytes32 loc = pasSlot;
    assembly {
      s_slot := loc
    }
  }
}
