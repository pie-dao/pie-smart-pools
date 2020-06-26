pragma solidity 0.6.4;

import "./PCappedSmartPool.sol";
import { PAdjustableSmartPoolStorage as PAStorage } from "./storage/PAdjustableSmartPoolStorage.sol";
import { LibConst as constants } from "./libraries/LibConst.sol";
import "./libraries/LibRemoveToken.sol";
import "./libraries/LibAddToken.sol";
import "./libraries/LibWeights.sol";

// Based on Balancer configurable weights pool

contract PAdjustableSmartPool is PCappedSmartPool {

  function updateWeight(address _token, uint256 _newWeight) external noReentry onlyController {
    LibWeights.updateWeight(_token, _newWeight);
  }

  // Let external actors poke the contract with pokeWeights(),
  // to slowly get to newWeights at endBlock
  function updateWeightsGradually(
    uint256[] calldata _newWeights,
    uint256 _startBlock,
    uint256 _endBlock
  ) external noReentry onlyController {
    pbs storage s = lpbs();
    PAStorage.StorageStruct storage ws = PAStorage.load();

    uint256 weightsSum = 0;
    address[] memory tokens = s.bPool.getCurrentTokens();
    // Check that endWeights are valid now to avoid reverting in a future pokeWeights call
    for (uint256 i = 0; i < tokens.length; i++) {
      require(_newWeights[i] <= constants.MAX_WEIGHT, "ERR_WEIGHT_ABOVE_MAX");
      require(_newWeights[i] >= constants.MIN_WEIGHT, "ERR_WEIGHT_BELOW_MIN");
      weightsSum = weightsSum.badd(_newWeights[i]);
    }
    require(weightsSum <= constants.MAX_TOTAL_WEIGHT, "ERR_MAX_TOTAL_WEIGHT");

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
    PAStorage.StorageStruct storage ws = PAStorage.load();
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

  function applyAddToken() external noReentry onlyController {
    LibAddToken.applyAddToken();
  }

  function commitAddToken(address _token, uint256 _balance, uint256 _denormalizedWeight)
      external
      noReentry
      onlyController
  {
    LibAddToken.commitAddToken(_token, _balance, _denormalizedWeight);
  }

  function removeToken(address _token) external noReentry onlyController {
    LibRemoveToken.removeToken(_token);
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
    return PAStorage.load().newWeights;
  }

  function getStartWeights() external view returns (uint256[] memory weights) {
    return PAStorage.load().startWeights;
  }

  function getStartBlock() external view returns (uint256) {
    return PAStorage.load().startBlock;
  }

  function getEndBlock() external view returns (uint256) {
    return PAStorage.load().endBlock;
  }

}