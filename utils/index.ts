import ethers, {constants, utils} from "ethers";
import {MockToken} from "@pie-dao/mock-contracts/typechain/MockToken";
import {BigNumberish} from "ethers/utils";
import balancerFactoryBytecode from "./balancerFactoryBytecode";
import balancerPoolBytecode from "./balancerPoolBytecode";
import uniswapFactoryBytecode from "./uniswapFactoryBytecode";
import uniswapExchangeBytecode from "./uniswapExchangeBytecode";
import {IUniswapFactoryFactory} from "../typechain/IUniswapFactoryFactory";
import {IUniswapFactory} from "../typechain/IUniswapFactory";
import {IUniswapExchangeFactory} from "../typechain/IUniswapExchangeFactory";
import {IUniswapExchange} from "../typechain/IUniswapExchange";
import {copyFile} from "fs";

export const deployBalancerFactory = async (signer: ethers.Signer) => {
  const tx = (await signer.sendTransaction({data: balancerFactoryBytecode})) as any;
  return tx.creates;
};

export const deployBalancerPool = async (signer: ethers.Signer) => {
  const tx = (await signer.sendTransaction({data: balancerPoolBytecode, gasLimit: 8000000})) as any;
  return tx.creates;
};

export const deployAndAddLiquidityUniswapExchange = async (
  factory: IUniswapFactory,
  token: MockToken,
  ethAmount: BigNumberish,
  tokenAmount: BigNumberish
) => {
  await (await factory.createExchange(token.address)).wait(1);

  const exchangeAddress = await factory.getExchange(token.address);
  const exchange = IUniswapExchangeFactory.connect(exchangeAddress, factory.signer);

  await (await token.approve(exchange.address, constants.MaxUint256)).wait(1);
  await (
    await exchange.addLiquidity(constants.WeiPerEther.mul(10), tokenAmount, constants.MaxUint256, {
      value: ethAmount,
    })
  ).wait(1);

  return exchange;
};

export const deployUniswapFactory = async (signer: ethers.Signer) => {
  const factoryTx = (await signer.sendTransaction({data: uniswapFactoryBytecode})) as any;
  await factoryTx.wait(1);
  const factory = IUniswapFactoryFactory.connect(factoryTx.creates, signer);

  const templateTx = (await signer.sendTransaction({data: uniswapExchangeBytecode})) as any;
  await templateTx.wait(1);
  const templateAddress = templateTx.creates;

  (await factory.initializeFactory(templateAddress)).wait(1);

  return factory;
};

export const simpleDeploy = async (artifact: any, signer: ethers.Signer) => {
  const tx = (await signer.sendTransaction({data: artifact.bytecode})) as any;
  await tx.wait(1);

  const contractAddress = tx.creates;

  return contractAddress;
};

export const deployAndGetLibObject = async (artifact: any, signer: ethers.Signer) => {
  const contractAddress = await simpleDeploy(artifact, signer);
  return {name: artifact.contractName, address: contractAddress};
};

export const linkArtifact = (artifact: any, libraries: any[]) => {
  for (const library of Object.keys(artifact.linkReferences)) {
    // Messy
    let libPositions = artifact.linkReferences[library];
    const libName = Object.keys(libPositions)[0];
    libPositions = libPositions[libName];

    const libAddress = libraries.find((lib) => lib.name === libName).address.replace("0x", "");

    for (const position of libPositions) {
      artifact.bytecode =
        artifact.bytecode.substr(0, 2 + position.start * 2) +
        libAddress +
        artifact.bytecode.substr(2 + (position.start + position.length) * 2);
    }
  }

  return artifact;
};
