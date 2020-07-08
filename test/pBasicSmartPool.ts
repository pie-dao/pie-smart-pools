// TODO use calcPoolOutGivenSingleIn calcSingleInGivenPoolOut, calcSingleOutGivenPoolIn, calcPoolInGivenSingleOut for single asset entry and exit

// This way of importing is a bit funky. We should fix this in the Mock Contracts package
import {MockTokenFactory} from "@pie-dao/mock-contracts/dist/typechain/MockTokenFactory";
import {MockToken} from "@pie-dao/mock-contracts/typechain/MockToken";
import {ethers, run} from "@nomiclabs/buidler";
import {Signer, Wallet, utils, constants} from "ethers";
import {BigNumber} from "ethers/utils";
import chai from "chai";
import {deployContract, solidity} from "ethereum-waffle";

import {deployBalancerPool, linkArtifact} from "../utils";
import {IBPool} from "../typechain/IBPool";
import {IBPoolFactory} from "../typechain/IBPoolFactory";
import {PBasicSmartPoolFactory} from "../typechain/PBasicSmartPoolFactory";
import {PBasicSmartPool} from "../typechain/PBasicSmartPool";
import PBasicSmartPoolArtifact from "../artifacts/PBasicSmartPool.json";

chai.use(solidity);
const {expect} = chai;

const PLACE_HOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";
const NAME = "TEST POOL";
const SYMBOL = "TPL";
const INITIAL_SUPPLY = constants.WeiPerEther;
let tokenFactory: MockTokenFactory;

describe("PBasicSmartPool", function () {
  this.timeout(30000);
  let signers: Signer[];
  let account: string;
  let tokens: MockToken[];
  let pool: IBPool;
  let smartpool: PBasicSmartPool;

  beforeEach(async () => {
    signers = await ethers.signers();
    account = await signers[0].getAddress();
    pool = IBPoolFactory.connect(await deployBalancerPool(signers[0]), signers[0]);
    tokenFactory = new MockTokenFactory(signers[0]);
    tokens = [];
    for (let i = 0; i < 7; i++) {
      const token: MockToken = await tokenFactory.deploy(`Mock ${i}`, `M${i}`, 18);
      await token.mint(account, constants.WeiPerEther.mul(constants.WeiPerEther.mul(1000000)));
      await token.mint(await signers[1].getAddress(), constants.WeiPerEther.mul(1000000));
      await token.approve(pool.address, constants.MaxUint256);
      pool.bind(token.address, constants.WeiPerEther.div(2), constants.WeiPerEther);
      tokens.push(token);
    }

    const libraries = await run("deploy-libraries");
    const linkedArtifact = linkArtifact(PBasicSmartPoolArtifact, libraries);

    smartpool = (await deployContract(signers[0] as Wallet, linkedArtifact, [], {
      gasLimit: 100000000,
    })) as PBasicSmartPool;
    await smartpool.init(pool.address, NAME, SYMBOL, INITIAL_SUPPLY);
    await smartpool.approveTokens();

    await pool.setController(smartpool.address);

    for (const token of tokens) {
      await token.approve(smartpool.address, constants.MaxUint256);
      // Attach alt signer to token and approve pool
      await MockTokenFactory.connect(token.address, signers[1]).approve(
        smartpool.address,
        constants.MaxUint256
      );
    }
  });

  describe("init", async () => {
    it("Initialising with invalid bPool address should fail", async () => {
      smartpool = (await deployContract(signers[0] as Wallet, PBasicSmartPoolArtifact, [], {
        gasLimit: 100000000,
      })) as PBasicSmartPool;
      await expect(
        smartpool.init(ethers.constants.AddressZero, "TEST", "TEST", ethers.constants.WeiPerEther)
      ).to.be.revertedWith("PBasicSmartPool.init: _bPool cannot be 0x00....000");
    });
    it("Initialising with zero supply should fail", async () => {
      smartpool = (await deployContract(signers[0] as Wallet, PBasicSmartPoolArtifact, [], {
        gasLimit: 100000000,
      })) as PBasicSmartPool;
      await expect(
        smartpool.init(PLACE_HOLDER_ADDRESS, "TEST", "TEST", ethers.constants.Zero)
      ).to.be.revertedWith("PBasicSmartPool.init: _initialSupply can not zero");
    });
    it("Token symbol should be correct", async () => {
      const name = await smartpool.name();
      expect(name).to.eq(NAME);
    });
    it("Token name should be correct", async () => {
      const symbol = await smartpool.symbol();
      expect(symbol).to.eq(SYMBOL);
    });
    it("Initial supply should be correct", async () => {
      const initialSupply = await smartpool.totalSupply();
      expect(initialSupply).to.eq(INITIAL_SUPPLY);
    });
    it("Controller should be correctly set", async () => {
      const controller = await smartpool.getController();
      expect(controller).to.eq(account);
    });
    it("Public swap setter should be correctly set", async () => {
      const publicSwapSetter = await smartpool.getPublicSwapSetter();
      expect(publicSwapSetter).to.eq(account);
    });
    it("Token binder should be correctly set", async () => {
      const tokenBinder = await smartpool.getTokenBinder();
      expect(tokenBinder).to.eq(account);
    });
    it("bPool should be correctly set", async () => {
      const bPool = await smartpool.getBPool();
      expect(bPool).to.eq(pool.address);
    });
    it("Tokens should be correctly set", async () => {
      const actualTokens = await smartpool.getTokens();
      const tokenAddresses = tokens.map((token) => token.address);
      expect(actualTokens).eql(tokenAddresses);
    });
    it("calcTokensForAmount should work", async () => {
      const amountAndTokens = await smartpool.calcTokensForAmount(constants.WeiPerEther);
      const tokenAddresses = tokens.map((token) => token.address);
      const expectedAmounts = tokens.map(() => constants.WeiPerEther.div(2));
      expect(amountAndTokens.tokens).to.eql(tokenAddresses);
      expect(amountAndTokens.amounts).to.eql(expectedAmounts);
    });
    it("Calling init when already initialized should fail", async () => {
      await expect(
        smartpool.init(PLACE_HOLDER_ADDRESS, NAME, SYMBOL, constants.WeiPerEther)
      ).to.be.revertedWith("PBasicSmartPool.init: already initialised");
    });
    it("Smart pool should not hold any non balancer pool tokens after init", async () => {
      const smartPoolBalances = await getTokenBalances(smartpool.address);
      expectZero(smartPoolBalances);
    });
  });

  describe("Controller functions", async () => {
    it("Setting a new controller should work", async () => {
      await smartpool.setController(PLACE_HOLDER_ADDRESS);
      const controller = await smartpool.getController();
      expect(controller).to.eq(PLACE_HOLDER_ADDRESS);
    });
    it("Setting a new controller from a non controller address should fail", async () => {
      smartpool = smartpool.connect(signers[1]);

      await expect(smartpool.setController(PLACE_HOLDER_ADDRESS)).to.be.revertedWith(
        "PBasicSmartPool.onlyController: not controller"
      );
    });
    it("Setting public swap setter should work", async () => {
      await smartpool.setPublicSwapSetter(PLACE_HOLDER_ADDRESS);
      const publicSwapSetter = await smartpool.getPublicSwapSetter();
      expect(publicSwapSetter).to.eq(PLACE_HOLDER_ADDRESS);
    });
    it("Setting public swap setter from a non controller address should fail", async () => {
      smartpool = smartpool.connect(signers[1]);

      await expect(smartpool.setPublicSwapSetter(PLACE_HOLDER_ADDRESS)).to.be.revertedWith(
        "PBasicSmartPool.onlyController: not controller"
      );
    });
    it("Setting the token binder should work", async () => {
      await smartpool.setTokenBinder(PLACE_HOLDER_ADDRESS);
      const tokenBinder = await smartpool.getTokenBinder();
      expect(tokenBinder).to.eq(PLACE_HOLDER_ADDRESS);
    });
    it("Setting the token binder from a non controller address should fail", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(smartpool.setTokenBinder(PLACE_HOLDER_ADDRESS)).to.be.revertedWith(
        "PBasicSmartPool.onlyController: not controller"
      );
    });
    it("Setting public swap should work", async () => {
      await smartpool.setPublicSwap(true);
      const publicSwap = await smartpool.isPublicSwap();
      // tslint:disable-next-line:no-unused-expression
      expect(publicSwap).to.be.true;
    });
    it("Setting public swap from a non publicSwapSetter address should fail", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(smartpool.setPublicSwap(true)).to.be.revertedWith(
        "PBasicSmartPool.onlyPublicSwapSetter: not public swap setter"
      );
    });
    it("Setting the swap fee should work", async () => {
      const feeValue = constants.WeiPerEther.div(20);
      await smartpool.setSwapFee(feeValue);
      const swapFee = await smartpool.getSwapFee();
      expect(swapFee).to.eq(feeValue);
    });
    it("Setting the swap fee from a non controller address should fail", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(smartpool.setSwapFee(constants.WeiPerEther.div(20))).to.be.revertedWith(
        "PBasicSmartPool.onlyController: not controller"
      );
    });
    it("Should revert with unsupported function error when calling finalizePool()", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(smartpool.finalizeSmartPool()).to.be.revertedWith(
        "PBasicSmartPool.finalizeSmartPool: unsupported function"
      );
    });
    it("Should revert with unsupported function error when calling createPool(uint256 initialSupply)", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(smartpool.createPool(0)).to.be.revertedWith(
        "PBasicSmartPool.createPool: unsupported function"
      );
    });
  });

  describe("Joining and Exiting", async () => {
    it("Adding liquidity should work", async () => {
      const mintAmount = constants.WeiPerEther;
      await smartpool.joinPool(mintAmount);

      const balance = await smartpool.balanceOf(account);
      expect(balance).to.eq(mintAmount.add(INITIAL_SUPPLY));

      // TODO Check if token balances are correct
    });
    it("Adding liquidity when a transfer fails should fail", async () => {
      const mintAmount = constants.WeiPerEther;
      await tokens[1].approve(smartpool.address, constants.Zero);
      await expect(smartpool.joinPool(mintAmount)).to.be.revertedWith(
        "ERC20: transfer amount exceeds allowance"
      );
    });
    it("Adding liquidity when a token transfer returns fails should fail", async () => {
      const mintAmount = constants.WeiPerEther.div(4);
      await tokens[1].setTransferFromReturnFalse(true);
      await expect(smartpool.joinPool(mintAmount)).to.be.revertedWith(
        "PBasicSmartPool._pullUnderlying: transferFrom failed"
      );
    });
    it("Removing liquidity should work", async () => {
      const removeAmount = constants.WeiPerEther.div(2);

      await smartpool.exitPool(removeAmount);
      const balance = await smartpool.balanceOf(account);
      expect(balance).to.eq(INITIAL_SUPPLY.sub(removeAmount));

      // TODO check all balances
    });
    it("Removing all liquidity should fail", async () => {
      const removeAmount = constants.WeiPerEther;
      await expect(smartpool.exitPool(removeAmount)).to.be.revertedWith("ERR_MIN_BALANCE");
    });
    it("Removing liquidity should fail when removing more than balance", async () => {
      // First mint some more in another account to not withdraw all total liquidity in the actual test
      const altSignerSmartPool = PBasicSmartPoolFactory.connect(smartpool.address, signers[1]);
      await altSignerSmartPool.joinPool(constants.WeiPerEther);
      await expect(smartpool.exitPool(INITIAL_SUPPLY.add(1))).to.be.revertedWith(
        "ERR_INSUFFICIENT_BAL"
      );
    });

    it("Removing liquidity when a token transfer fails should fail", async () => {
      await tokens[0].setTransferFailed(true);
      await expect(smartpool.exitPool(constants.WeiPerEther.div(2))).to.be.revertedWith(
        "MockToken.transfer: transferFrom set to fail"
      );
    });

    it("Removing liquidity when a token transfer returns false should fail", async () => {
      await tokens[0].setTransferReturnFalse(true);
      await expect(smartpool.exitPool(constants.WeiPerEther.div(2))).to.be.revertedWith(
        "ERR_ERC20_FALSE"
      );
    });

    it("Removing liquidity leaving a single token should work", async () => {
      const removeAmount = constants.WeiPerEther.div(2);

      await smartpool.exitPoolTakingloss(removeAmount, [tokens[0].address]);
      const balance = await smartpool.balanceOf(account);
      expect(balance).to.eq(INITIAL_SUPPLY.sub(removeAmount));

      // TODO check all balances
    });
    it("Removing all liquidity leaving a single token should fail", async () => {
      const removeAmount = constants.WeiPerEther;
      await expect(smartpool.exitPool(removeAmount)).to.be.revertedWith("ERR_MIN_BALANCE");
    });
    it("Removing liquidity leaving a single token should fail when removing more than balance", async () => {
      // First mint some more in another account to not withdraw all total liquidity in the actual test
      const altSignerSmartPool = PBasicSmartPoolFactory.connect(smartpool.address, signers[1]);
      await altSignerSmartPool.joinPool(constants.WeiPerEther);
      await expect(smartpool.exitPool(INITIAL_SUPPLY.add(1))).to.be.revertedWith(
        "ERR_INSUFFICIENT_BAL"
      );
    });
    // it.only("Exiting the entire pool should fail", async() => {
    //     smartpool.joinPool(constants.WeiPerEther.mul(constants.WeiPerEther).mul(10));
    //     await smartpool.exitPool(1);
    // });
    it("Should fail to join with a single token if token is unbound", async () => {
      await smartpool.unbind(tokens[0].address);
      const mintAmount = constants.WeiPerEther;

      await expect(
        smartpool.joinswapExternAmountIn(tokens[0].address, mintAmount)
      ).to.be.revertedWith("PBasicSmartPool.joinswapExternAmountIn: Token Not Bound");
      await expect(
        smartpool.joinswapPoolAmountOut(tokens[0].address, mintAmount)
      ).to.be.revertedWith("PBasicSmartPool.joinswapPoolAmountOut: Token Not Bound");
    });
    it("poolAmountOut = joinswapExternAmountIn(joinswapPoolAmountOut(poolAmountOut))", async () => {
      const userPreBalance = await tokens[1].balanceOf(account);
      const userPrePoolBalance = await smartpool.balanceOf(account);

      const poolAmountOut = constants.One;
      const tokenAmountIn = await smartpool.joinswapPoolAmountOut(tokens[1].address, poolAmountOut);
      const tAIResponse = await tokenAmountIn.wait(1);
      const tAI = new BigNumber(tAIResponse.events[0].data);

      const calculatedPoolAmountOut = await smartpool.joinswapExternAmountIn(
        tokens[1].address,
        tAI
      );
      const cPAOResponse = await calculatedPoolAmountOut.wait(1);
      const cPAO = new BigNumber(cPAOResponse.events[3].data);

      const userCurrentBalance = await tokens[1].balanceOf(account);
      const userCurrentPoolBalance = await smartpool.balanceOf(account);

      expect(userCurrentPoolBalance).to.equal(userPrePoolBalance.add(poolAmountOut.mul(2)));
      expect(userCurrentBalance).to.equal(userPreBalance.sub(tAI.mul(2)));
      expect(cPAO).to.equal(poolAmountOut);
    });

    it("Should fail to exit with a single token if token is unbound", async () => {
      await smartpool.unbind(tokens[1].address);
      const exitAmount = constants.WeiPerEther;

      await expect(
        smartpool.exitswapExternAmountOut(tokens[1].address, exitAmount)
      ).to.be.revertedWith("PBasicSmartPool.exitswapExternAmountOut: Token Not Bound");
      await expect(
        smartpool.exitswapPoolAmountIn(tokens[1].address, exitAmount)
      ).to.be.revertedWith("PBasicSmartPool.exitswapPoolAmountIn: Token Not Bound");
    });
    it("tokenAmountOut = exitswapPoolAmountIn(exitswapExternAmountOut(tokenAmountOut))", async () => {
      const tokenAmountOut = constants.One;
      const poolAmountIn = await smartpool.joinswapPoolAmountOut(tokens[1].address, tokenAmountOut);

      const pAIResponse = await poolAmountIn.wait(1);
      const pAI = new BigNumber(pAIResponse.events[0].data);

      const calculatedTokenAmountOut = await smartpool.joinswapExternAmountIn(
        tokens[1].address,
        pAI
      );
      const cTAOResponse = await calculatedTokenAmountOut.wait(1);
      const cTAO = new BigNumber(cTAOResponse.events[3].data);

      expect(cTAO).to.equal(tokenAmountOut);
    });
  });

  describe("Token binding", async () => {
    it("Binding a new token should work", async () => {
      const mintAmount = constants.WeiPerEther.mul(1000000);
      const token: MockToken = await tokenFactory.deploy("Mock", "M", 18);
      await token.mint(account, mintAmount);
      await token.approve(smartpool.address, constants.MaxUint256);

      await smartpool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther);

      const tokenBalance = await token.balanceOf(account);
      expect(tokenBalance).to.eq(mintAmount.sub(constants.WeiPerEther));
      // TODO checks for balances
    });
    it("Binding a token when transferFrom returns false should fail", async () => {
      const mintAmount = constants.WeiPerEther.mul(1000000);
      const token: MockToken = await tokenFactory.deploy("Mock", "M", 18);
      await token.mint(account, mintAmount);
      await token.approve(smartpool.address, constants.MaxUint256);
      await token.setTransferFromReturnFalse(true);
      await expect(
        smartpool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther)
      ).to.be.revertedWith("PBasicSmartPool.bind: transferFrom failed");
    });
    it("Binding from a non token binder address should fail", async () => {
      smartpool = smartpool.connect(signers[1]);
      const mintAmount = constants.WeiPerEther.mul(1000000);
      const token: MockToken = await tokenFactory.deploy("Mock", "M", 18);
      await token.mint(account, mintAmount);
      await token.approve(smartpool.address, constants.MaxUint256);
      await expect(
        smartpool.bind(token.address, constants.WeiPerEther, constants.WeiPerEther)
      ).to.be.revertedWith("PBasicSmartPool.onlyTokenBinder: not token binder");
    });
    it("Rebinding a token should work", async () => {
      // Doubles the weight in the pool
      await smartpool.rebind(
        tokens[0].address,
        constants.WeiPerEther.mul(2),
        constants.WeiPerEther.mul(2)
      );
    });
    it("Rebinding a token reducing the balance should work", async () => {
      await smartpool.rebind(
        tokens[0].address,
        constants.WeiPerEther.div(4),
        constants.WeiPerEther.mul(2)
      );
    });
    it("Rebinding a token reducing the balance when the the token token transfer returns false should fail", async () => {
      await tokens[0].setTransferReturnFalse(true);
      await expect(
        smartpool.rebind(
          tokens[0].address,
          constants.WeiPerEther.div(4),
          constants.WeiPerEther.mul(2)
        )
      ).to.be.revertedWith("ERR_ERC20_FALSE");
    });
    it("Rebinding a token from a non token binder address should fail", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(
        smartpool.rebind(
          tokens[0].address,
          constants.WeiPerEther.mul(2),
          constants.WeiPerEther.mul(2)
        )
      ).to.be.revertedWith("PBasicSmartPool.onlyTokenBinder: not token binder");
    });
    it("Unbinding a token should work", async () => {
      smartpool.unbind(tokens[0].address);
      // TODO balance checks
    });
    it("Unbinding a token from a non token binder address should fail", async () => {
      smartpool = smartpool.connect(signers[1]);
      await expect(smartpool.unbind(tokens[0].address)).to.be.revertedWith(
        "revert PBasicSmartPool.onlyTokenBinder: not token binder"
      );
    });
  });

  describe("ready modifier", async () => {
    it("should revert when not ready", async () => {
      smartpool = (await deployContract(signers[0] as Wallet, PBasicSmartPoolArtifact, [], {
        gasLimit: 100000000,
      })) as PBasicSmartPool;
      await expect(smartpool.joinPool(constants.WeiPerEther)).to.be.revertedWith(
        "PBasicSmartPool.ready: not ready"
      );
    });
  });

  describe("Utility Functions", async () => {
    describe("getDenormalizedWeight(address _token)", async () => {
      it("Should return denormalized weight of underlying token in bPool", async () => {
        smartpool = smartpool.connect(signers[1]);

        const tokenWeight = await smartpool.getDenormalizedWeight(tokens[0].address);

        expect(tokenWeight).to.equal(constants.WeiPerEther);
      });
    });
  });

  async function getTokenBalances(address: string) {
    const balances: BigNumber[] = [];

    for (const token of tokens) {
      balances.push(await token.balanceOf(address));
    }

    return balances;
  }

  function expectZero(amounts: BigNumber[]) {
    for (const amount of amounts) {
      expect(amount).to.eq(0);
    }
  }
});
