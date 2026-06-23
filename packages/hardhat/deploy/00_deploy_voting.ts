import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Деплой контракта Voting.
 * В Scaffold-ETH запускается командой `yarn deploy`.
 */
const deployVoting: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Voting", {
    from: deployer,
    args: [], // конструктор без аргументов
    log: true,
    autoMine: true,
  });

  const voting = await hre.ethers.getContract<any>("Voting", deployer);
  console.log("👋 Voting deployed. Owner:", await voting.owner());
};

export default deployVoting;

deployVoting.tags = ["Voting"];
