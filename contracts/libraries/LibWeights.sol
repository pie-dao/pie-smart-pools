pragma solidity ^0.6.4;

import { PBasicSmartPoolStorage as PBStorage } from "../storage/PBasicSmartPoolStorage.sol";
import { PAdjustableSmartPoolStorage as PAStorage } from "../storage/PAdjustableSmartPoolStorage.sol";
import { PCTokenStorage as PCStorage } from "../storage/PCTokenStorage.sol";
import { LibConst as constants } from "./LibConst.sol";
import "./LibPoolToken.sol";
import "./Math.sol";

library LibWeights {
    using Math for uint256;
    function updateWeight(address _token, uint256 _newWeight) external {
        PBStorage.StorageStruct storage s = PBStorage.load();

        require(_newWeight >= constants.MIN_WEIGHT, "ERR_MIN_WEIGHT");
        require(_newWeight <= constants.MAX_WEIGHT, "ERR_MAX_WEIGHT");

        uint256 currentWeight = s.bPool.getDenormalizedWeight(_token);
        uint256 currentBalance = s.bPool.getBalance(_token);
        uint256 poolShares;
        uint256 deltaBalance;
        uint256 deltaWeight;
        uint256 totalSupply = PCStorage.load().totalSupply;
        uint256 totalWeight = s.bPool.getTotalDenormalizedWeight();

        if (_newWeight < currentWeight) {
            // If weight goes down we need to pull tokens and burn pool shares
            require(
                totalWeight.badd(currentWeight.bsub(_newWeight)) <= constants.MAX_TOTAL_WEIGHT,
                "ERR_MAX_TOTAL_WEIGHT"
            );

            deltaWeight = currentWeight.bsub(_newWeight);

            poolShares = totalSupply.bmul(deltaWeight.bdiv(totalWeight));

            deltaBalance = currentBalance.bmul(deltaWeight.bdiv(currentWeight));

            // New balance cannot be lower than MIN_BALANCE
            require(currentBalance.bsub(deltaBalance) >= constants.MIN_BALANCE, "ERR_MIN_BALANCE");
            // First gets the tokens from this contract (Pool Controller) to msg.sender
            s.bPool.rebind(_token, currentBalance.bsub(deltaBalance), _newWeight);

            // Now with the tokens this contract can send them to msg.sender
            require(IERC20(_token).transfer(msg.sender, deltaBalance), "ERR_ERC20_FALSE");


            LibPoolToken._burn(msg.sender, poolShares);
        } else {
            // This means the controller will deposit tokens to keep the price.
            // They will be minted and given PCTokens
            require(
                totalWeight.badd(_newWeight.bsub(currentWeight)) <= constants.MAX_TOTAL_WEIGHT,
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

            LibPoolToken._mint(msg.sender, poolShares);
        }
  }

  function updateWeightsGradually(
    uint256[] calldata _newWeights,
    uint256 _startBlock,
    uint256 _endBlock
  ) external {
    PBStorage.StorageStruct storage s = PBStorage.load();
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

  function pokeWeights() external {
    PBStorage.StorageStruct storage s = PBStorage.load();
    PAStorage.StorageStruct storage ws = PAStorage.load();

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

}