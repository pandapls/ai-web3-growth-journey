// test/WasteWise.test.js (简化版)
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WasteWise", function () {
    let wasteWise;
    let owner;
    let user1;
    let user2;

    const testTokenURI = "https://api.wastewise.com/metadata/1";

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const WasteWise = await ethers.getContractFactory("WasteWise");
        wasteWise = await WasteWise.deploy();
        await wasteWise.waitForDeployment();
    });

    describe("基本功能", function () {
        it("应该正确设置合约信息", async function () {
            expect(await wasteWise.name()).to.equal("WasteWise NFT");
            expect(await wasteWise.symbol()).to.equal("WWN");
            expect(await wasteWise.owner()).to.equal(owner.address);
            expect(await wasteWise.getTotalSupply()).to.equal(0);
        });
    });

    describe("NFT铸造", function () {
        it("owner可以铸造NFT", async function () {
            await wasteWise.mintNFT(user1.address, testTokenURI);

            expect(await wasteWise.ownerOf(0)).to.equal(user1.address);
            expect(await wasteWise.tokenURI(0)).to.equal(testTokenURI);
            expect(await wasteWise.balanceOf(user1.address)).to.equal(1);
            expect(await wasteWise.getTotalSupply()).to.equal(1);
        });

        it("非owner不能铸造NFT", async function () {
            await expect(
                wasteWise.connect(user1).mintNFT(user2.address, testTokenURI)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("不能铸造给零地址", async function () {
            await expect(
                wasteWise.mintNFT(ethers.ZeroAddress, testTokenURI)
            ).to.be.revertedWith("Cannot mint to zero address");
        });

        it("不能使用空URI", async function () {
            await expect(
                wasteWise.mintNFT(user1.address, "")
            ).to.be.revertedWith("Token URI required");
        });
    });

    describe("NFT转移", function () {
        beforeEach(async function () {
            await wasteWise.mintNFT(user1.address, testTokenURI);
        });

        it("NFT持有者可以转移NFT", async function () {
            await wasteWise.connect(user1).transferNFT(user2.address, 0);

            expect(await wasteWise.ownerOf(0)).to.equal(user2.address);
            expect(await wasteWise.balanceOf(user1.address)).to.equal(0);
            expect(await wasteWise.balanceOf(user2.address)).to.equal(1);
        });

        it("非持有者不能转移NFT", async function () {
            await expect(
                wasteWise.connect(user2).transferNFT(user1.address, 0)
            ).to.be.revertedWith("Not the owner of this NFT");
        });

        it("不能转移给零地址", async function () {
            await expect(
                wasteWise.connect(user1).transferNFT(ethers.ZeroAddress, 0)
            ).to.be.revertedWith("Invalid recipient address");
        });

        it("不能转移给自己", async function () {
            await expect(
                wasteWise.connect(user1).transferNFT(user1.address, 0)
            ).to.be.revertedWith("Cannot transfer to yourself");
        });
    });

    describe("NFT查询", function () {
        beforeEach(async function () {
            await wasteWise.mintNFT(user1.address, testTokenURI + "1");
            await wasteWise.mintNFT(user1.address, testTokenURI + "2");
            await wasteWise.mintNFT(user2.address, testTokenURI + "3");
        });

        it("应该正确返回用户的NFT", async function () {
            const user1NFTs = await wasteWise.getUserNFTs(user1.address);
            const user2NFTs = await wasteWise.getUserNFTs(user2.address);

            expect(user1NFTs.length).to.equal(2);
            expect(user1NFTs).to.deep.equal([0n, 1n]);

            expect(user2NFTs.length).to.equal(1);
            expect(user2NFTs).to.deep.equal([2n]);
        });

        it("应该正确检查NFT存在性", async function () {
            expect(await wasteWise.exists(0)).to.equal(true);
            expect(await wasteWise.exists(999)).to.equal(false);
        });
    });
});