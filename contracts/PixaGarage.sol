// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./Pixag.sol";

contract PixaGarage is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  Counters.Counter private _colorsMinted;

  address payable owner;

  uint256 colorPrice = 5 ether;

  uint256 private _colorsSupply = 4096;

  uint256 private maxColorsPerAccount = 16;

  uint256 private _totalListings;

  event ProductListed(
      uint256 indexed itemId
  );

  event MarketItemDeleted(uint256 itemId);

  constructor() {
    owner = payable(msg.sender);
  }

  modifier onlyItemOwner(uint256 id) {
        require(
            idToMarketItem[id].owner == msg.sender,
            "Only product owner can do this operation"
        );
        _;
    }



  struct MarketItem {
    uint256 itemId;
    address nftContract;
    uint256 tokenId;
    address payable creator;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
    string dominantColor;
    bool assetColor;
    string name;
    uint256 timestamp;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  mapping(address => uint256) private addressToColorsNum;

  mapping(string => uint256) private colors;

  mapping(address => string) private ownerName;

  event MarketItemCreated (
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address creator,
    address seller,
    address owner,
    uint256 price,
    bool sold,
    string dominantColor,
    bool assetColor,
    string name,
    uint256 timestamp
  );

  event ProductSold(
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address creator,
    address seller,
    address owner,
    uint256 price
  );

  function getTotal() public view returns (uint256) {
    return _itemIds.current();
  }

  function getColorPrice() public view returns (uint256) {
    return colorPrice;
  }

  function getTotalListings() public view returns (uint256) {
    return _totalListings;
  }

  function getColorsSupply() public view returns (uint256) {
    return _colorsSupply;
  }

  function fetchSingleItem(uint256 id)
        public
        view
        returns (MarketItem memory)
  {
      return idToMarketItem[id];
  }

  function fetchMyColors(uint256 page, uint256 limit)
        public
        view
        returns (MarketItem[] memory)
  {
      uint256 totalItemsCount = _itemIds.current();
      uint256 itemCount = 0;
      uint256 currentIndex = 0;

      for (uint256 i = 0; i < totalItemsCount; i++) {
        if (idToMarketItem[i + 1].assetColor && idToMarketItem[i + 1].owner == msg.sender) {
          itemCount += 1;
          if (itemCount == limit) {
            break;
          }
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint256 i = page; i < totalItemsCount; i++) {
        if (idToMarketItem[i + 1].assetColor && idToMarketItem[i + 1].owner == msg.sender) {
          uint256 currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
          if (currentIndex == limit) {
            break;
          }
        }
      }
      return items;
  }
  
  function loadColors(uint256 page, uint256 limit)
        public
        view
        returns (MarketItem[] memory)
  {
      uint256 totalItemsCount = _itemIds.current();
      uint256 itemCount = 0;
      uint256 currentIndex = 0;

      for (uint256 i = page; i < totalItemsCount; i++) {
        if (idToMarketItem[i + 1].assetColor) {
          itemCount += 1;
          if (itemCount == limit) {
            break;
          }
        }
      }

      MarketItem[] memory items = new MarketItem[](itemCount);
      for (uint256 i = page; i < totalItemsCount; i++) {
        if (idToMarketItem[i + 1].assetColor) {
          uint256 currentId = i + 1;
          MarketItem storage currentItem = idToMarketItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
          if (currentIndex == limit) {
            break;
          }
        }
      }
      return items;
  }

  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price,
    string calldata dominantColor,
    string calldata name,
    bool assetColor,
    bool onlyCreate
  ) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    if (assetColor) require(msg.value == colorPrice, "Price must be equal to color price");
    if (assetColor) {
      if (addressToColorsNum[msg.sender] == maxColorsPerAccount) {
        deleteToken(nftContract, tokenId);
        revert("Maximum number of colors minted by this account");
      }
      if (colors[dominantColor] != 0) {
        deleteToken(nftContract, tokenId);
        revert("Color exists");
      }
      if (_colorsMinted.current() == getColorsSupply()) {
        revert("All Colors Minted!");
      }
      addressToColorsNum[msg.sender]++;
      _colorsMinted.increment();
      colors[dominantColor] = tokenId;
    }
    
    _itemIds.increment();
    // address whoOwnsIt = msg.sender;
    // if (!assetColor) whoOwnsIt = address(0);
    uint256 itemId = _itemIds.current();
    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(msg.sender),
      payable(!assetColor && !onlyCreate ? address(0) : msg.sender),
      price,
      assetColor || onlyCreate,
      dominantColor,
      assetColor,
      name,
      block.timestamp
    );
    if (!assetColor) IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    if (assetColor) {
      _totalListings += colorPrice;
      payable(owner).transfer(colorPrice);
    }
    MarketItem memory productOnMarket = idToMarketItem[itemId];
    emit MarketItemCreated(
      productOnMarket.itemId,
      productOnMarket.nftContract,
      productOnMarket.tokenId,
      msg.sender,
      msg.sender,
      !assetColor && !onlyCreate ? address(0) : msg.sender,
      productOnMarket.price,
      productOnMarket.sold,
      productOnMarket.dominantColor,
      productOnMarket.assetColor,
      productOnMarket.name,
      block.timestamp
    );
  }

  function setNameForAddress(
    string memory name    
  ) public payable nonReentrant {
    ownerName[msg.sender] = name;
  }

  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint256 price = idToMarketItem[itemId].price;
    uint256 tokenId = idToMarketItem[itemId].tokenId;
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");
    uint256 forDominant = calculatePercentage(price);
    uint256 forSeller = price - forDominant; 
    string memory dominantColor = idToMarketItem[itemId].dominantColor;
    uint256 winnerId = 0;
    uint itemCount = _itemIds.current();
    if (!idToMarketItem[itemId].assetColor) {
      for (uint256 i = 0; i < itemCount; i++) {
        if (idToMarketItem[i + 1].tokenId != tokenId && idToMarketItem[i + 1].assetColor && keccak256(bytes(idToMarketItem[i + 1].dominantColor)) == keccak256(bytes(dominantColor))) {
            winnerId = i + 1;
        }
      }
      if (winnerId == 0) {
        forSeller = price;
        idToMarketItem[itemId].seller.transfer(forSeller);
      }
      else {
        uint amountPerWinner = forDominant;
        idToMarketItem[winnerId].seller.transfer(amountPerWinner);
        idToMarketItem[itemId].seller.transfer(forSeller);
      }
    }
    else {
      idToMarketItem[itemId].seller.transfer(price);
    }
    
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    idToMarketItem[itemId].timestamp = block.timestamp;
    _itemsSold.increment();
    
    MarketItem memory productSold = idToMarketItem[itemId];
    emit ProductSold(
        productSold.itemId,
        productSold.nftContract,
        productSold.tokenId,
        productSold.creator,
        productSold.seller,
        payable(msg.sender),
        productSold.price
    );
  }

        
  function fetchSoldItemsByColor(uint page, uint limit, string memory color) public view returns (MarketItem[] memory) {
    uint256 totalItemsCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;
    if (page > totalItemsCount) page = totalItemsCount;
    MarketItem memory colorItem;

    for (uint256 i = 0;i<totalItemsCount;i++) {
      if (idToMarketItem[i].assetColor && keccak256(bytes(idToMarketItem[i].dominantColor)) == keccak256(bytes(color))) {
        colorItem = idToMarketItem[i];
        break;
      }
    }
    if (colorItem.itemId == 0) {
      MarketItem[] memory emptyItems = new MarketItem[](0);
      return emptyItems;
    }
    for (uint256 i = totalItemsCount - page; i > 0; i--) {
      if (!idToMarketItem[i].assetColor && idToMarketItem[i].timestamp > colorItem.timestamp && keccak256(bytes(idToMarketItem[i].dominantColor)) == keccak256(bytes(color))) {
        itemCount += 1;
        if (itemCount == limit) {
          break;
        }
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = totalItemsCount - page; i > 0; i--) {
      if (!idToMarketItem[i].assetColor && idToMarketItem[i].timestamp > colorItem.timestamp && keccak256(bytes(idToMarketItem[i].dominantColor)) == keccak256(bytes(color))) {
        uint256 currentId = i;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
        if (currentIndex == limit) {
          break;
        }
      }
    }
    return items;
  }

  function fetchMarketItems(uint page, uint limit) public view returns (MarketItem[] memory) {
    uint256 totalItemsCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;
    if (page > totalItemsCount) page = totalItemsCount;

    for (uint256 i = totalItemsCount - page; i > 0; i--) {
      if (idToMarketItem[i].sold == false) {
        itemCount += 1;
        if (itemCount == limit) {
          break;
        }
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = totalItemsCount - page; i > 0; i--) {
      if (idToMarketItem[i].sold == false) {
        uint256 currentId = i;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
        if (currentIndex == limit) {
          break;
        }
      }
    }
    return items;
  }

  function fetchMarketItemsByName(string memory name) public view returns (MarketItem[] memory) {
    uint256 totalItemsCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = totalItemsCount; i > 0; i--) {
      if (idToMarketItem[i].sold == false && contains(name, idToMarketItem[i].name)) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = totalItemsCount; i > 0; i--) {
      if (idToMarketItem[i].sold == false && contains(name, idToMarketItem[i].name)) {
        uint256 currentId = i;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
  
  function calculatePercentage(uint amount) public pure returns (uint) {
    return amount * 1000 / 10000;
  }
  function fetchMyNFTs(uint page, uint limit) public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;
    if (page > totalItemCount) page = totalItemCount;

    for (uint256 i = totalItemCount - page; i > 0; i--) {
      if (idToMarketItem[i].owner == msg.sender) {
        itemCount += 1;
        if (itemCount == limit) {
          break;
        }
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = totalItemCount - page; i > 0; i--) {
      if (idToMarketItem[i].owner == msg.sender) {
        uint256 currentId = i;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
        if (currentIndex == limit) {
          break;
        }
      }
    }
    return items;
  }

  function fetchWhatISold(uint page, uint limit) public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;
    if (page > totalItemCount) page = totalItemCount;

    for (uint256 i = totalItemCount - page; i > 0; i--) {
      if (idToMarketItem[i].owner != msg.sender && idToMarketItem[i].creator == msg.sender && idToMarketItem[i].sold && !idToMarketItem[i].assetColor) {
        itemCount += 1;
        if (itemCount == limit) {
          break;
        }
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = totalItemCount - page; i > 0; i--) {
      if (idToMarketItem[i].owner != msg.sender && idToMarketItem[i].creator == msg.sender && idToMarketItem[i].sold && !idToMarketItem[i].assetColor) {
        uint256 currentId = i;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
        if (currentIndex == limit) {
          break;
        }
      }
    }
    return items;
  }

  function fetchItemsForSell(uint page, uint limit) public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;
    if (page > totalItemCount) page = totalItemCount;

    for (uint256 i =totalItemCount - page; i > 0; i--) {
      if (idToMarketItem[i].seller == msg.sender && !idToMarketItem[i].sold && !idToMarketItem[i].assetColor) {
        itemCount += 1;
        if (itemCount == limit) {
          break;
        }
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = totalItemCount - page; i > 0; i--) {
      if (idToMarketItem[i].seller == msg.sender && !idToMarketItem[i].sold && !idToMarketItem[i].assetColor) {
        uint256 currentId = i;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
        if (currentIndex == limit) {
          break;
        }
      }
    }
    return items;
  }
  
  function putItemToResell(address nftContract, uint256 itemId, uint256 newPrice)
        public
        payable
        nonReentrant
        onlyItemOwner(itemId)
    {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(msg.sender == idToMarketItem[itemId].owner && msg.sender == idToMarketItem[itemId].creator, "Not allowed");
        require(newPrice > 0, "Price must be at least 1 wei");
        //instantiate a NFT contract object with the matching type
        Pixag tokenContract = Pixag(nftContract);
        //call the custom transfer token method   
        tokenContract.transferToken(msg.sender, address(this), tokenId);

        address payable oldOwner = idToMarketItem[itemId].owner;
        idToMarketItem[itemId].owner = payable(address(0));
        idToMarketItem[itemId].seller = oldOwner;
        idToMarketItem[itemId].price = newPrice;
        idToMarketItem[itemId].sold = false;
        // if (!idToMarketItem[itemId].assetColor) _itemsSold.decrement();

        emit ProductListed(itemId);
    }

  function deleteToken(address nftContract, uint256 tokenId)
        private
    {
        Pixag tokenContract = Pixag(nftContract);
        tokenContract.deleteToken(tokenId);
    }

  function contains(string memory what, string memory where) public pure returns (bool) {
    bytes memory whatBytes = bytes (what);
    bytes memory whereBytes = bytes (where);

    if (whereBytes.length < whatBytes.length) return false;

    bool found = false;
    for (uint i = 0; i <= whereBytes.length - whatBytes.length; i++) {
        bool flag = true;
        for (uint j = 0; j < whatBytes.length; j++)
            if (whereBytes [i + j] != whatBytes [j]) {
                flag = false;
                break;
            }
        if (flag) {
            found = true;
            break;
        }
    }
    return (found);
}

}