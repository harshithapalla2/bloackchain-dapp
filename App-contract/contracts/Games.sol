// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "./Gamesrent.sol";

contract GameItems is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event TransferItem(address indexed from, address indexed to, uint256 indexed itemId);

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
        uint256 rentPrice;
        address owner;
        address renteraddr;
    }

    mapping(address => User) public users;
    mapping(uint256 => Item) public items;




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

    function getUser(address useraddr) public view returns  (string memory){
        require(users[useraddr].walletAddress != address(0), "User not registered.");
        string memory userA = users[useraddr].username;
        return userA;
    }

    function getItemsByUser() public view onlyRegistered returns (Item[] memory) {
        uint256[] memory itemslist = users[msg.sender].ownedItemIds;
        uint256 index=0;
        Item[] memory result = new Item[](itemslist.length+1);
        for (uint i=0; i<itemslist.length; i++) {
            result[index++] = items[itemslist[i]];
        }
        return result;
    }

    function getAllItems() public onlyRegistered returns (Item[] memory){
        uint256 index=0;
        uint itemC = _tokenIds.current();

        Item[] memory result = new Item[](itemC);
        for (uint i=1; i<=itemC; i++) {
            result[index++] = items[i];
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
        items[newItemId] = Item(newItemId,_name,_description,false,false,price,price*2/10,msg.sender,address(0));
        users[msg.sender].ownedItemIds.push(newItemId);
        return newItemId;
    }
    // Sale related functions

    function listItemForSale(uint256 _itemId) public onlyOwner(_itemId) returns (bool){
        // require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
        require(!isItemForSale(_itemId), "Item already listed for sale.");


        // uint256 _price = items[_itemId].price;
        // listings[_itemId] = SaleListing(_itemId, msg.sender, _price);
        items[_itemId].isAvailableForSale = true;
        // _approve(msg.sender, _itemId);

        return true;
    }

    function isItemForSale(uint256 _itemId) public view returns (bool) {
        return items[_itemId].isAvailableForSale;
    }

    function buyItem(uint256 _itemId) public payable {
        require(isItemForSale(_itemId), "Item not listed for sale.");
        require(msg.value >= items[_itemId].price, "Insufficient funds.");
        address seller = items[_itemId].owner;
        require(seller != msg.sender, "Cannot buy own item.");
        require(users[msg.sender].walletAddress != address(0),"User not registered.");

        _transfer(seller, msg.sender, _itemId);
        // emit TransferItem(seller, msg.sender, _itemId); 

        users[msg.sender].ownedItemIds.push(_itemId);

        for (uint i = 0; i < users[seller].ownedItemIds.length; i++) {
            if (users[seller].ownedItemIds[i] == _itemId) {
                users[seller].ownedItemIds[i] = users[seller].ownedItemIds[users[seller].ownedItemIds.length - 1];
                users[seller].ownedItemIds.pop();
                break;
            }
        }

        items[_itemId].owner = msg.sender;
        items[_itemId].isAvailableForSale = false;
        users[seller].balance += items[_itemId].price;
        users[msg.sender].balance -= items[_itemId].price;
        payable(seller).transfer(items[_itemId].price);
        // delete listings[_itemId];
    }
 
    // rent related functions

    function listItemForRent(uint256 _itemId) public {
        require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
        require(!isItemForRent(_itemId), "Item already listed for rent.");
        // uint256 _gameRentPrice = items[_itemId].price * 2 / 10;
        // rentListings[_itemId] = RentListing(_itemId, msg.sender, _gameRentPrice);
        items[_itemId].isAvailableForRent = true;
    }

    function isItemForRent(uint256 _itemId) public view returns (bool) {
        return items[_itemId].isAvailableForRent;
    }


    function rentItem(uint256 _itemId) public payable {
        require(isItemForRent(_itemId), "Item not listed for rent.");
        uint256 totalRentPrice = items[_itemId].rentPrice;
        require(msg.value >= totalRentPrice, "Insufficient funds.");
        address owner = items[_itemId].owner;
        require(owner != msg.sender, "Cannot rent own item.");
        require(users[msg.sender].walletAddress != address(0),"User not registered.");
        users[msg.sender].rentedItemIds.push(_itemId);
        users[owner].balance += totalRentPrice;
        users[msg.sender].balance -= totalRentPrice;
        payable(owner).transfer(totalRentPrice);
        items[_itemId].isAvailableForRent = false;
        items[_itemId].renteraddr = msg.sender;
    }

    function isUserRentingItem(address user, uint256 _itemId) internal view returns (bool) {
        for (uint i = 0; i < users[user].rentedItemIds.length; i++) {
            if (users[user].rentedItemIds[i] == _itemId) {
                return true;
            }
        }
        return false;
    }


    function playGame(uint256 _itemId, uint256 rating) public returns (uint256){
        require(isUserRentingItem(msg.sender,_itemId),"Not the renter of the item.");
        require(!isItemForRent(_itemId), "Item already listed for rent.");
        
        items[_itemId].isAvailableForRent = false;
        items[_itemId].renteraddr = address(0);

        if (rating ==1){
            items[_itemId].price = items[_itemId].price + (1 * items[_itemId].price / 10);
            items[_itemId].rentPrice = items[_itemId].price * 2 / 10;
        } else if (rating ==2) {
            items[_itemId].price = items[_itemId].price - (1 * items[_itemId].price / 10);
            items[_itemId].rentPrice = items[_itemId].price * 2 / 10;
        }
        returnRentedItem(_itemId);
        return 1;
    }

    function returnRentedItem(uint256 _itemId) public {
        require(isUserRentingItem(msg.sender,_itemId), "Not the renter of the item.");

        for (uint i = 0; i < users[msg.sender].rentedItemIds.length; i++) {
            if (users[msg.sender].rentedItemIds[i] == _itemId) {
                users[msg.sender].rentedItemIds[i] = users[msg.sender].rentedItemIds[users[msg.sender].rentedItemIds.length - 1];
                users[msg.sender].rentedItemIds.pop();
                break;
            }
        }
    }
}