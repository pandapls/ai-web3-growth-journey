const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署 WasteWise NFT 合约...");

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

    // 获取合约工厂
    const WasteWise = await ethers.getContractFactory("WasteWise");

    // 部署合约 (新语法)
    console.log("正在部署合约...");
    const wasteWise = await WasteWise.deploy();

    // 等待部署完成 (新语法)
    await wasteWise.waitForDeployment();

    // 获取合约地址
    const contractAddress = await wasteWise.getAddress();

    console.log("WasteWise NFT 合约部署成功!");
    console.log("合约地址:", contractAddress);
    console.log("部署者地址:", await wasteWise.owner());
    console.log("交易哈希:", wasteWise.deploymentTransaction().hash);

    // 验证合约 (可选)
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("等待区块确认...");
        await wasteWise.deploymentTransaction().wait(6);

        console.log("验证合约...");
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });
            console.log("合约验证成功!");
        } catch (error) {
            console.log("合约验证失败:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    });