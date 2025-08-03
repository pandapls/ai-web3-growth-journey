// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title WasteWise
 * @dev 简化版垃圾分类奖励NFT合约
 * 功能: 1. 合约owner铸造NFT 2. 用户转移NFT
 */
contract WasteWise is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // NFT计数器
    Counters.Counter private _tokenIdCounter;
    
    // 事件定义
    event NFTMinted(uint256 indexed tokenId, address indexed recipient, string tokenURI);
    event NFTTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    
    constructor() ERC721("WasteWise NFT", "WWN") {}
    
    /**
     * @dev 铸造NFT (仅限合约owner)
     * @param to 接收者地址
     * @param tokenURI NFT元数据URI
     */
    function mintNFT(address to, string memory tokenURI) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(tokenURI).length > 0, "Token URI required");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit NFTMinted(tokenId, to, tokenURI);
    }
    
    /**
     * @dev 转移NFT给指定地址
     * @param to 接收者地址
     * @param tokenId NFT ID
     */
    function transferNFT(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(to != address(0), "Invalid recipient address");
        require(to != msg.sender, "Cannot transfer to yourself");
        
        address from = msg.sender;
        _transfer(from, to, tokenId);
        
        emit NFTTransferred(tokenId, from, to);
    }
    
    /**
     * @dev 获取用户拥有的所有NFT ID
     * @param user 用户地址
     */
    function getUserNFTs(address user) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (_exists(i) && ownerOf(i) == user) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev 获取NFT总数
     */
    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev 检查NFT是否存在
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }
    
    // 重写必需的函数
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}