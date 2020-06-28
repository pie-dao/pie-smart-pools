pragma solidity 0.6.4;

import "./PCappedSmartPool.sol";
import { PAdjustableSmartPoolStorage as PAStorage } from "../storage/PAdjustableSmartPoolStorage.sol";
import { LibConst as constants } from "../libraries/LibConst.sol";
import "../libraries/LibRemoveToken.sol";
import "../libraries/LibAddToken.sol";
import "../libraries/LibWeights.sol";

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
    LibWeights.updateWeightsGradually(_newWeights, _startBlock, _endBlock);
  }

  function pokeWeights() external noReentry {
    LibWeights.pokeWeights();
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