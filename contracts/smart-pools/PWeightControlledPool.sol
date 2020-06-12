pragma solidity 0.6.4;

import "./PCappedSmartPool.sol";
import "./PWeightControlledPool.sol";

// Based on Balancer configurable weights pool

contract PWeightControlledPool is PCappedSmartPool {

    uint256 public constant MIN_WEIGHT        = 10 ** 18;
    uint256 public constant MAX_WEIGHT = 10 ** 18 * 50;
    uint256 public constant MAX_TOTAL_WEIGHT  = 10 ** 18 * 50;
    uint256 public constant MIN_BALANCE  = (10 ** 18) / (10 ** 12);

    // Notice Balance is not an input (like with rebind on BPool) since we will require prices not to change.
    // This is achieved by forcing balances to change proportionally to weights, so that prices don't change.
    // If prices could be changed, this would allow the controller to drain the pool by arbing price changes.
    function updateWeight(address _token, uint256 _newWeight)
        external
        noReentry
        onlyController
    {
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

        if(_newWeight < currentWeight){ // This means the controller will withdraw tokens to keep price. This means they need to redeem PCTokens
            require(totalWeight.badd(currentWeight.bsub(_newWeight)) <= MAX_TOTAL_WEIGHT, "ERR_MAX_TOTAL_WEIGHT");

            deltaWeight = currentWeight.bsub(_newWeight);

            poolShares = totalSupply.bmul(
                                deltaWeight.bdiv(
                                    totalWeight
                                )
                        );

            deltaBalance = currentBalance.bmul(
                                deltaWeight.bdiv(
                                currentWeight
                                )
                        );

            // New balance cannot be lower than MIN_BALANCE
            require(currentBalance.bsub(deltaBalance) >= MIN_BALANCE, "ERR_MIN_BALANCE");
            // First gets the tokens from this contract (Pool Controller) to msg.sender
            s.bPool.rebind(_token, currentBalance.bsub(deltaBalance), _newWeight);

            // Now with the tokens this contract can send them to msg.sender
            require(IERC20(_token).transfer(msg.sender, deltaBalance), "ERR_ERC20_FALSE");

            _pullPoolShare(msg.sender, poolShares);
            _burnPoolShare(poolShares);
        }
        else{ // This means the controller will deposit tokens to keep the price. This means they will be minted and given PCTokens
            require(totalWeight.badd(_newWeight.bsub(currentWeight)) <= MAX_TOTAL_WEIGHT, "ERR_MAX_TOTAL_WEIGHT");

            deltaWeight = _newWeight.bsub(currentWeight);
            poolShares = totalSupply.bmul(
                            deltaWeight.bdiv(
                                totalWeight
                            )
                        );
            deltaBalance = currentBalance.bmul(
                            deltaWeight.bdiv(
                                currentWeight
                            )
                        );

            // First gets the tokens from msg.sender to this contract (Pool Controller)
            require(xfer, IERC20(_token).transferFrom(msg.sender, address(this), deltaBalance););
            // Now with the tokens this contract can bind them to the pool it controls
            s.bPool.rebind(_token, currentBalance.badd(deltaBalance), _newWeight);

            _mintPoolShare(poolShares);
            _pushPoolShare(msg.sender, poolShares);
        }
    }

}