import ethers from "ethers";
import balancerFactoryBytecode from "./balancerFactoryBytecode";
import balancerPoolBytecode from "./balancerPoolBytecode";
import TimeTraveler from "./TimeTraveler";
import {DeployOptions, DeployResult} from "@nomiclabs/buidler/types";

export const deployBalancerFactory = async (signer: ethers.Signer) => {
  const tx = (await signer.sendTransaction({data: balancerFactoryBytecode})) as any;
  return tx.creates;
};

export const deployBalancerPool = async (signer: ethers.Signer) => {
  const tx = (await signer.sendTransaction({data: balancerPoolBytecode, gasLimit: 8000000})) as any;
  return tx.creates;
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

    const libContract = libraries.find((lib) => lib.name === libName);

    if (libContract === undefined) {
      throw new Error(`${libName} not deployed`);
    }

    const libAddress = libContract.address.replace("0x", "");

    for (const position of libPositions) {
      artifact.bytecode =
        artifact.bytecode.substr(0, 2 + position.start * 2) +
        libAddress +
        artifact.bytecode.substr(2 + (position.start + position.length) * 2);
    }
  }

  return artifact;
};

export {TimeTraveler};
