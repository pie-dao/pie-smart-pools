import ethers, { constants } from "ethers";
import { MockToken } from "@pie-dao/mock-contracts/typechain/MockToken";
import { BigNumberish } from "ethers/utils";
import balancerFactoryBytecode from "./balancerFactoryBytecode";
import balancerPoolBytecode from "./balancerPoolBytecode";
import uniswapFactoryBytecode from "./uniswapFactoryBytecode";
import uniswapExchangeBytecode from "./uniswapExchangeBytecode";
import { IUniswapFactoryFactory } from '../typechain/IUniswapFactoryFactory';
import { IUniswapFactory } from "../typechain/IUniswapFactory";
import { IUniswapExchangeFactory } from "../typechain/IUniswapExchangeFactory";
import { IUniswapExchange } from "../typechain/IUniswapExchange";

export const deployBalancerFactory = async(signer: ethers.Signer) => {
    const tx = (await signer.sendTransaction({data: balancerFactoryBytecode})) as any;
    return tx.creates;
}

export const deployBalancerPool = async(signer: ethers.Signer) => {
    const tx = (await signer.sendTransaction({data: balancerPoolBytecode, gasLimit: 8000000})) as any;
    return tx.creates;
}

export const deployAndAddLiquidityUniswapExchange = async(factory: IUniswapFactory, token: MockToken, ethAmount: BigNumberish, tokenAmount: BigNumberish) => {
    await factory.createExchange(token.address);

    const exchangeAddress = await factory.getExchange(token.address);
    const exchange = IUniswapExchangeFactory.connect(exchangeAddress, factory.signer);

    await token.approve(exchange.address, constants.MaxUint256);
    await exchange.addLiquidity(constants.WeiPerEther.mul(10), tokenAmount, constants.MaxUint256, { value: ethAmount });

    return exchange;
}

export const deployUniswapFactory = async(signer: ethers.Signer) => {
    const factoryTx = (await signer.sendTransaction({data: uniswapFactoryBytecode})) as any;
    const factory = IUniswapFactoryFactory.connect(factoryTx.creates, signer);

    const templateTx = (await signer.sendTransaction({data: uniswapExchangeBytecode})) as any;
    const templateAddress = templateTx.creates;

    await factory.initializeFactory(templateAddress);

    return factory;
}