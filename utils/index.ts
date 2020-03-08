import ethers from "ethers";
import balancerFactoryBytecode from "./balancerFactoryBytecode";
import balancerPoolBytecode from "./balancerPoolBytecode";

export const deployBalancerFactory = async(signer: ethers.Signer) => {
    const tx = (await signer.sendTransaction({data: balancerFactoryBytecode})) as any;
    return tx.creates;
}

export const deployBalancerPool = async(signer: ethers.Signer) => {
    // console.log(balancerPoolBytecode);
    const tx = (await signer.sendTransaction({data: balancerPoolBytecode, gasLimit: 8000000})) as any;
    return tx.creates;
}