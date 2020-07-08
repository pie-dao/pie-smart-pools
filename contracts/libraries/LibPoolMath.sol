// modified version of
// https://github.com/balancer-labs/balancer-core/blob/master/contracts/BMath.sol

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.6.4;

import "./Math.sol";


library LibPoolMath {
  using Math for uint256;

  uint256 constant BONE = 1 * 10**18;
  uint256 constant EXIT_FEE = 0;

  /**********************************************************************************************
    // calcSpotPrice                                                                             //
    // sP = spotPrice                                                                            //
    // bI = tokenBalanceIn                ( bI / wI )         1                                  //
    // bO = tokenBalanceOut         sP =  -----------  *  ----------                             //
    // wI = tokenWeightIn                 ( bO / wO )     ( 1 - sF )                             //
    // wO = tokenWeightOut                                                                       //
    // sF = swapFee                                                                              //
    **********************************************************************************************/
  function calcSpotPrice(
    uint256 tokenBalanceIn,
    uint256 tokenWeightIn,
    uint256 tokenBalanceOut,
    uint256 tokenWeightOut,
    uint256 swapFee
  ) internal pure returns (uint256 spotPrice) {
    uint256 numer = tokenBalanceIn.bdiv(tokenWeightIn);
    uint256 denom = tokenBalanceOut.bdiv(tokenWeightOut);
    uint256 ratio = numer.bdiv(denom);
    uint256 scale = BONE.bdiv(BONE.bsub(swapFee));
    return (spotPrice = ratio.bmul(scale));
  }

  /**********************************************************************************************
    // calcOutGivenIn                                                                            //
    // aO = tokenAmountOut                                                                       //
    // bO = tokenBalanceOut                                                                      //
    // bI = tokenBalanceIn              /      /            bI             \    (wI / wO) \      //
    // aI = tokenAmountIn    aO = bO * |  1 - | --------------------------  | ^            |     //
    // wI = tokenWeightIn               \      \ ( bI + ( aI * ( 1 - sF )) /              /      //
    // wO = tokenWeightOut                                                                       //
    // sF = swapFee                                                                              //
    **********************************************************************************************/
  function calcOutGivenIn(
    uint256 tokenBalanceIn,
    uint256 tokenWeightIn,
    uint256 tokenBalanceOut,
    uint256 tokenWeightOut,
    uint256 tokenAmountIn,
    uint256 swapFee
  ) internal pure returns (uint256 tokenAmountOut) {
    uint256 weightRatio = tokenWeightIn.bdiv(tokenWeightOut);
    uint256 adjustedIn = BONE.bsub(swapFee);
    adjustedIn = tokenAmountIn.bmul(adjustedIn);
    uint256 y = tokenBalanceIn.bdiv(tokenBalanceIn.badd(adjustedIn));
    uint256 foo = y.bpow(weightRatio);
    uint256 bar = BONE.bsub(foo);
    tokenAmountOut = tokenBalanceOut.bmul(bar);
    return tokenAmountOut;
  }

  /**********************************************************************************************
    // calcInGivenOut                                                                            //
    // aI = tokenAmountIn                                                                        //
    // bO = tokenBalanceOut               /  /     bO      \    (wO / wI)      \                 //
    // bI = tokenBalanceIn          bI * |  | ------------  | ^            - 1  |                //
    // aO = tokenAmountOut    aI =        \  \ ( bO - aO ) /                   /                 //
    // wI = tokenWeightIn           --------------------------------------------                 //
    // wO = tokenWeightOut                          ( 1 - sF )                                   //
    // sF = swapFee                                                                              //
    **********************************************************************************************/
  function calcInGivenOut(
    uint256 tokenBalanceIn,
    uint256 tokenWeightIn,
    uint256 tokenBalanceOut,
    uint256 tokenWeightOut,
    uint256 tokenAmountOut,
    uint256 swapFee
  ) public pure returns (uint256 tokenAmountIn) {
    uint256 weightRatio = tokenWeightOut.bdiv(tokenWeightIn);
    uint256 diff = tokenBalanceOut.bsub(tokenAmountOut);
    uint256 y = tokenBalanceOut.bdiv(diff);
    uint256 foo = y.bpow(weightRatio);
    foo = foo.bsub(BONE);
    tokenAmountIn = BONE.bsub(swapFee);
    tokenAmountIn = tokenBalanceIn.bmul(foo).bdiv(tokenAmountIn);
    return tokenAmountIn;
  }

  /**********************************************************************************************
    // calcPoolOutGivenSingleIn                                                                  //
    // pAo = poolAmountOut         /                                              \              //
    // tAi = tokenAmountIn        ///      /     //    wI \      \\       \     wI \             //
    // wI = tokenWeightIn        //| tAi *| 1 - || 1 - --  | * sF || + tBi \    --  \            //
    // tW = totalWeight     pAo=||  \      \     \\    tW /      //         | ^ tW   | * pS - pS //
    // tBi = tokenBalanceIn      \\  ------------------------------------- /        /            //
    // pS = poolSupply            \\                    tBi               /        /             //
    // sF = swapFee                \                                              /              //
    **********************************************************************************************/
  function calcPoolOutGivenSingleIn(
    uint256 tokenBalanceIn,
    uint256 tokenWeightIn,
    uint256 poolSupply,
    uint256 totalWeight,
    uint256 tokenAmountIn,
    uint256 swapFee
  ) public pure returns (uint256 poolAmountOut) {
    // Charge the trading fee for the proportion of tokenAi
    ///  which is implicitly traded to the other pool tokens.
    // That proportion is (1- weightTokenIn)
    // tokenAiAfterFee = tAi * (1 - (1-weightTi) * poolFee);
    uint256 normalizedWeight = tokenWeightIn.bdiv(totalWeight);
    uint256 zaz = BONE.bsub(normalizedWeight).bmul(swapFee);
    uint256 tokenAmountInAfterFee = tokenAmountIn.bmul(BONE.bsub(zaz));

    uint256 newTokenBalanceIn = tokenBalanceIn.badd(tokenAmountInAfterFee);
    uint256 tokenInRatio = newTokenBalanceIn.bdiv(tokenBalanceIn);

    uint256 poolRatio = tokenInRatio.bpow(normalizedWeight);
    uint256 newPoolSupply = poolRatio.bmul(poolSupply);
    poolAmountOut = newPoolSupply.bsub(poolSupply);
    return poolAmountOut;
  }

  /**********************************************************************************************
    // calcSingleInGivenPoolOut                                                                  //
    // tAi = tokenAmountIn              //(pS + pAo)\     /    1    \\                           //
    // pS = poolSupply                 || ---------  | ^ | --------- || * bI - bI                //
    // pAo = poolAmountOut              \\    pS    /     \(wI / tW)//                           //
    // bI = balanceIn          tAi =  --------------------------------------------               //
    // wI = weightIn                              /      wI  \                                   //
    // tW = totalWeight                          |  1 - ----  |  * sF                            //
    // sF = swapFee                               \      tW  /                                   //
    **********************************************************************************************/
  function calcSingleInGivenPoolOut(
    uint256 tokenBalanceIn,
    uint256 tokenWeightIn,
    uint256 poolSupply,
    uint256 totalWeight,
    uint256 poolAmountOut,
    uint256 swapFee
  ) public pure returns (uint256 tokenAmountIn) {
    uint256 normalizedWeight = tokenWeightIn.bdiv(totalWeight);
    uint256 newPoolSupply = poolSupply.badd(poolAmountOut);
    uint256 poolRatio = newPoolSupply.bdiv(poolSupply);

    //uint256 newBalTi = poolRatio^(1/weightTi) * balTi;
    uint256 boo = BONE.bdiv(normalizedWeight);
    uint256 tokenInRatio = poolRatio.bpow(boo);
    uint256 newTokenBalanceIn = tokenInRatio.bmul(tokenBalanceIn);
    uint256 tokenAmountInAfterFee = newTokenBalanceIn.bsub(tokenBalanceIn);
    // Do reverse order of fees charged in joinswap_ExternAmountIn, this way
    //     ``` pAo == joinswap_ExternAmountIn(Ti, joinswap_PoolAmountOut(pAo, Ti)) ```
    //uint256 tAi = tAiAfterFee / (1 - (1-weightTi) * swapFee) ;
    uint256 zar = BONE.bsub(normalizedWeight).bmul(swapFee);
    tokenAmountIn = tokenAmountInAfterFee.bdiv(BONE.bsub(zar));
    return tokenAmountIn;
  }

  /**********************************************************************************************
    // calcSingleOutGivenPoolIn                                                                  //
    // tAo = tokenAmountOut            /      /                                             \\   //
    // bO = tokenBalanceOut           /      // pS - (pAi * (1 - eF)) \     /    1    \      \\  //
    // pAi = poolAmountIn            | bO - || ----------------------- | ^ | --------- | * b0 || //
    // ps = poolSupply                \      \\          pS           /     \(wO / tW)/      //  //
    // wI = tokenWeightIn      tAo =   \      \                                             //   //
    // tW = totalWeight                    /     /      wO \       \                             //
    // sF = swapFee                    *  | 1 - |  1 - ---- | * sF  |                            //
    // eF = exitFee                        \     \      tW /       /                             //
    **********************************************************************************************/
  function calcSingleOutGivenPoolIn(
    uint256 tokenBalanceOut,
    uint256 tokenWeightOut,
    uint256 poolSupply,
    uint256 totalWeight,
    uint256 poolAmountIn,
    uint256 swapFee
  ) public pure returns (uint256 tokenAmountOut) {
    uint256 normalizedWeight = tokenWeightOut.bdiv(totalWeight);
    // charge exit fee on the pool token side
    // pAiAfterExitFee = pAi*(1-exitFee)
    uint256 poolAmountInAfterExitFee = poolAmountIn.bmul(BONE.bsub(EXIT_FEE));
    uint256 newPoolSupply = poolSupply.bsub(poolAmountInAfterExitFee);
    uint256 poolRatio = newPoolSupply.bdiv(poolSupply);

    // newBalTo = poolRatio^(1/weightTo) * balTo;
    uint256 tokenOutRatio = poolRatio.bpow(BONE.bdiv(normalizedWeight));
    uint256 newTokenBalanceOut = tokenOutRatio.bmul(tokenBalanceOut);

    uint256 tokenAmountOutBeforeSwapFee = tokenBalanceOut.bsub(newTokenBalanceOut);

    // charge swap fee on the output token side
    //uint256 tAo = tAoBeforeSwapFee * (1 - (1-weightTo) * swapFee)
    uint256 zaz = BONE.bsub(normalizedWeight).bmul(swapFee);
    tokenAmountOut = tokenAmountOutBeforeSwapFee.bmul(BONE.bsub(zaz));
    return tokenAmountOut;
  }

  /**********************************************************************************************
    // calcPoolInGivenSingleOut                                                                  //
    // pAi = poolAmountIn               // /               tAo             \\     / wO \     \   //
    // bO = tokenBalanceOut            // | bO - -------------------------- |\   | ---- |     \  //
    // tAo = tokenAmountOut      pS - ||   \     1 - ((1 - (tO / tW)) * sF)/  | ^ \ tW /  * pS | //
    // ps = poolSupply                 \\ -----------------------------------/                /  //
    // wO = tokenWeightOut  pAi =       \\               bO                 /                /   //
    // tW = totalWeight           -------------------------------------------------------------  //
    // sF = swapFee                                        ( 1 - eF )                            //
    // eF = exitFee                                                                              //
    **********************************************************************************************/
  function calcPoolInGivenSingleOut(
    uint256 tokenBalanceOut,
    uint256 tokenWeightOut,
    uint256 poolSupply,
    uint256 totalWeight,
    uint256 tokenAmountOut,
    uint256 swapFee
  ) public pure returns (uint256 poolAmountIn) {
    // charge swap fee on the output token side
    uint256 normalizedWeight = tokenWeightOut.bdiv(totalWeight);
    //uint256 tAoBeforeSwapFee = tAo / (1 - (1-weightTo) * swapFee) ;
    uint256 zoo = BONE.bsub(normalizedWeight);
    uint256 zar = zoo.bmul(swapFee);
    uint256 tokenAmountOutBeforeSwapFee = tokenAmountOut.bdiv(BONE.bsub(zar));

    uint256 newTokenBalanceOut = tokenBalanceOut.bsub(tokenAmountOutBeforeSwapFee);
    uint256 tokenOutRatio = newTokenBalanceOut.bdiv(tokenBalanceOut);

    //uint256 newPoolSupply = (ratioTo ^ weightTo) * poolSupply;
    uint256 poolRatio = tokenOutRatio.bpow(normalizedWeight);
    uint256 newPoolSupply = poolRatio.bmul(poolSupply);
    uint256 poolAmountInAfterExitFee = poolSupply.bsub(newPoolSupply);

    // charge exit fee on the pool token side
    // pAi = pAiAfterExitFee/(1-exitFee)
    poolAmountIn = poolAmountInAfterExitFee.bdiv(BONE.bsub(EXIT_FEE));
    return poolAmountIn;
  }
}
