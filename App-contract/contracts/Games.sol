// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";


contract GameItems is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address admin;

    struct User {
        address walletAddress;
        string username;
        uint256 balance;
        uint256[] ownedItemIds;
        uint256[] rentedItemIds;
    }

    struct Item {
        uint256 itemId;
        string name;
        string description;
        bool isAvailableForRent;
        bool isAvailableForSale;
        uint256 price;
        address owner;
    }

    struct SaleListing {
        uint256 itemId;
        address seller;
        uint256 price;
    }

    struct RentListing {
        uint256 itemId;
        address owner;
        uint256 gameRentPrice;
    }

    mapping(address => User) public users;
    mapping(uint256 => Item) public items;
    mapping(uint256 => SaleListing) public listings;
    mapping(uint256 => RentListing) public rentListings;



    constructor(string memory _username) ERC721("GameItems", "GI") payable {
        admin = msg.sender;
        users[msg.sender] = User(msg.sender, _username, msg.value, new uint256[](0), new uint256[](0));
    }

    modifier onlyRegistered() {
        require(users[msg.sender].walletAddress != address(0),"User not registered.");
        _;
    }

    modifier onlyOwner(uint256 _itemId) {
        require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
        _;
    }

    modifier onlyAdmin() {
        require(admin==msg.sender,"Only Admin operations");
        _;
    }

    function getUser(address useraddr) public returns  (string memory){
        require(users[useraddr].walletAddress != address(0), "User not registered.");
        string memory userA = users[useraddr].username;
        return userA;
    }

    // function getItemsAsArray() public returns (Item[] memory) {
    //     uint256 count = 0;
    //     for (uint i = 1; i <= _tokenIds.current(); i++) {
    //         if (items[i].itemId != 0) {
    //             count++;
    //         }
    //     }
    //     Item[] memory result = new Item[](count);
    //     uint256 index = 0;
    //     for (uint i = 1; i <= _tokenIds.current(); i++) {
    //         if (items[i].itemId != 0) {
    //             result[index] = items[i];
    //             index++;
    //         }
    //     }
    //     return result;
    // }

    function getItemsByUser() public returns (Item[] memory) {
        uint256[] memory itemslist = users[msg.sender].ownedItemIds;

        uint256 index=0;
        Item[] memory result = new Item[](itemslist.length+1);
        for (uint i=0; i<itemslist.length; i++) {

            result[index++] = items[itemslist[i]];
        }
        
        return result;

    }

    function registerUser(string memory _username) public payable {
        require(users[msg.sender].walletAddress == address(0), "User already registered.");
        users[msg.sender] = User(msg.sender, _username, msg.value, new uint256[](0), new uint256[](0));
    }

    function addItem(string memory _name,uint256 price, string memory _description) public onlyRegistered returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        items[newItemId] = Item(newItemId,_name,_description,false,false,price,msg.sender);
        users[msg.sender].ownedItemIds.push(newItemId);
        return newItemId;
    }


    // Sale related functions

    function listItemForSale(uint256 _itemId) public onlyOwner(_itemId) returns (bool){
        // require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
        require(!isItemForSale(_itemId), "Item already listed for sale.");
        uint256 _price = items[_itemId].price;
        listings[_itemId] = SaleListing(_itemId, msg.sender, _price);
        items[_itemId].isAvailableForSale = true;
        return true;
    }

    function isItemForSale(uint256 _itemId) public view returns (bool) {
        return listings[_itemId].itemId != 0 && listings[_itemId].seller != address(0);
    }

    function buyItem(uint256 _itemId) public payable {
        require(isItemForSale(_itemId), "Item not listed for sale.");
        require(msg.value >= listings[_itemId].price, "Insufficient funds.");
        address seller = listings[_itemId].seller;
        require(seller != msg.sender, "Cannot buy own item.");
        require(users[msg.sender].walletAddress != address(0),"User not registered.");

        _transfer(seller, msg.sender, _itemId);
        users[msg.sender].ownedItemIds.push(_itemId);

        for (uint i = 0; i < users[seller].ownedItemIds.length; i++) {
            if (users[seller].ownedItemIds[i] == _itemId) {
                users[seller].ownedItemIds[i] = users[seller].ownedItemIds[users[seller].ownedItemIds.length - 1];
                users[seller].ownedItemIds.pop();
                break;
            }
        }

        items[_itemId].owner = msg.sender;
        users[seller].balance += listings[_itemId].price;
        users[msg.sender].balance -= listings[_itemId].price;
        payable(seller).transfer(listings[_itemId].price);
        delete listings[_itemId];
    }

    function cancelListing(uint256 _itemId) public {
        require(isItemForSale(_itemId), "Item not listed for sale.");
        require(listings[_itemId].seller == msg.sender, "Not the owner of the item.");

        delete listings[_itemId];
    }

    // function changeSaleState(uint256 _itemId) public {
    //     require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
    //     require(isItemForSale(_itemId), "Item not listed for sale.");

    //     rentListings[_itemId] = RentListing(_itemId,msg.sender,items[_itemId].price*2/10);
        
    //     delete listings[_itemId];
    // } 






    // rent related functions

    function listItemForRent(uint256 _itemId) public {
        require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
        require(!isItemForRent(_itemId), "Item already listed for rent.");
        uint256 _gameRentPrice = items[_itemId].price * 2 / 10;
        rentListings[_itemId] = RentListing(_itemId, msg.sender, _gameRentPrice);
    }



    function isItemForRent(uint256 _itemId) public view returns (bool) {
        return rentListings[_itemId].itemId != 0 && rentListings[_itemId].owner != address(0);
    }

    

    function rentItem(uint256 _itemId) public payable {
        require(isItemForRent(_itemId), "Item not listed for rent.");
        uint256 totalRentPrice = rentListings[_itemId].gameRentPrice;
        require(msg.value >= totalRentPrice, "Insufficient funds.");

        address owner = rentListings[_itemId].owner;
        require(owner != msg.sender, "Cannot rent own item.");
        require(users[msg.sender].walletAddress != address(0),"User not registered.");

        // users[msg.sender].rentedItemIds.push(_itemId)

        // items[_itemId].renter = msg.sender;
        users[msg.sender].rentedItemIds.push(_itemId);
        users[owner].balance += totalRentPrice;
        users[msg.sender].balance -= totalRentPrice;
        payable(owner).transfer(totalRentPrice);
        delete rentListings[_itemId];
    }

    function isUserRentingItem(address user, uint256 _itemId) internal view returns (bool) {
        for (uint i = 0; i < users[user].rentedItemIds.length; i++) {
            if (users[user].rentedItemIds[i] == _itemId) {
                return true;
            }
        }
        return false;
    }


    function playGame(uint256 _itemId) public {
        require(isUserRentingItem(msg.sender,_itemId),"Not the renter of the item.");

        // require(items[_itemId].renter != msg.sender, "Not the renter of the item.");
        // require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
        require(!isItemForRent(_itemId), "Item already listed for rent.");

        uint256 _gameRentPrice = items[_itemId].price * 2 / 10;

        rentListings[_itemId] = RentListing(_itemId, msg.sender, _gameRentPrice);

        returnRentedItem(_itemId);
        // cancelRentListing(_itemId);
    }

    function returnRentedItem(uint256 _itemId) public {
        require(isUserRentingItem(msg.sender,_itemId), "Not the renter of the item.");

        // items[_itemId].renter = address(0);

        for (uint i = 0; i < users[msg.sender].rentedItemIds.length; i++) {
            if (users[msg.sender].rentedItemIds[i] == _itemId) {
                users[msg.sender].rentedItemIds[i] = users[msg.sender].rentedItemIds[users[msg.sender].rentedItemIds.length - 1];
                users[msg.sender].rentedItemIds.pop();
                break;
            }
        }
    }
    function cancelRentListing(uint256 _itemId) public {
        require(isItemForRent(_itemId), "Item not listed for rent.");
        require(rentListings[_itemId].owner == msg.sender, "Not the owner of the item.");
        delete rentListings[_itemId];
    }

    function changeRentState(uint256 _itemId) public {
        require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
        require(isItemForRent(_itemId), "Item not listed for sale.");

        listings[_itemId] = SaleListing(_itemId,msg.sender,items[_itemId].price);

        delete rentListings[_itemId];
    } 

    function close() public onlyAdmin {
        selfdestruct(payable(msg.sender));   
    }
}