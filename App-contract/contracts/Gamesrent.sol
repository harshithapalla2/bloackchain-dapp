// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


// contract GameItemsRent is ERC721 {
//     using Counters for Counters.Counter;
//     Counters.Counter private _tokenIds;

//     address admin;

//     struct User {
//         address walletAddress;
//         string username;
//         uint256 balance;
//         uint256[] ownedItemIds;
//         uint256[] rentedItemIds;
//     }

//     struct Item {
//         uint256 itemId;
//         string name;
//         string description;
//         bool isAvailableForRent;
//         bool isAvailableForSale;
//         uint256 price;
//         address owner;
//     }

//     // struct SaleListing {
//     //     uint256 itemId;
//     //     address seller;
//     //     uint256 price;
//     // }

//     struct RentListing {
//         uint256 itemId;
//         address owner;
//         uint256 gameRentPrice;
//     }

//     mapping(address => User) public users;
//     mapping(uint256 => Item) public items;
//     // mapping(uint256 => SaleListing) public listings;
//     mapping(uint256 => RentListing) public rentListings;


//         function listItemForRent(uint256 _itemId) public {
//         require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
//         require(!isItemForRent(_itemId), "Item already listed for rent.");
//         uint256 _gameRentPrice = items[_itemId].price * 2 / 10;
//         rentListings[_itemId] = RentListing(_itemId, msg.sender, _gameRentPrice);
//         items[_itemId].isAvailableForRent = true;
//     }

//     function isItemForRent(uint256 _itemId) public view returns (bool) {
//         return rentListings[_itemId].itemId != 0 && rentListings[_itemId].owner != address(0);
//     }


//     function rentItem(uint256 _itemId) public payable {
//         require(isItemForRent(_itemId), "Item not listed for rent.");
//         uint256 totalRentPrice = rentListings[_itemId].gameRentPrice;
//         require(msg.value >= totalRentPrice, "Insufficient funds.");

//         address owner = rentListings[_itemId].owner;
//         require(owner != msg.sender, "Cannot rent own item.");
//         require(users[msg.sender].walletAddress != address(0),"User not registered.");
//         // users[msg.sender].rentedItemIds.push(_itemId)
//         // items[_itemId].renter = msg.sender;
//         users[msg.sender].rentedItemIds.push(_itemId);
//         users[owner].balance += totalRentPrice;
//         users[msg.sender].balance -= totalRentPrice;
//         payable(owner).transfer(totalRentPrice);
//         delete rentListings[_itemId];
//     }

//     function isUserRentingItem(address user, uint256 _itemId) internal view returns (bool) {
//         for (uint i = 0; i < users[user].rentedItemIds.length; i++) {
//             if (users[user].rentedItemIds[i] == _itemId) {
//                 return true;
//             }
//         }
//         return false;
//     }


//     function playGame(uint256 _itemId) public {
//         require(isUserRentingItem(msg.sender,_itemId),"Not the renter of the item.");
//         // require(items[_itemId].renter != msg.sender, "Not the renter of the item.");
//         // require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
//         require(!isItemForRent(_itemId), "Item already listed for rent.");

//         uint256 _gameRentPrice = items[_itemId].price * 2 / 10;

//         rentListings[_itemId] = RentListing(_itemId, msg.sender, _gameRentPrice);

//         returnRentedItem(_itemId);
//         // cancelRentListing(_itemId);
//     }

//     function returnRentedItem(uint256 _itemId) public {
//         require(isUserRentingItem(msg.sender,_itemId), "Not the renter of the item.");

//         // items[_itemId].renter = address(0);

//         for (uint i = 0; i < users[msg.sender].rentedItemIds.length; i++) {
//             if (users[msg.sender].rentedItemIds[i] == _itemId) {
//                 users[msg.sender].rentedItemIds[i] = users[msg.sender].rentedItemIds[users[msg.sender].rentedItemIds.length - 1];
//                 users[msg.sender].rentedItemIds.pop();
//                 break;
//             }
//         }
//     }
//     function cancelRentListing(uint256 _itemId) public {
//         require(isItemForRent(_itemId), "Item not listed for rent.");
//         require(rentListings[_itemId].owner == msg.sender, "Not the owner of the item.");
//         delete rentListings[_itemId];
//     }

//     function changeRentState(uint256 _itemId) public {
//         require(ownerOf(_itemId) == msg.sender, "Not the owner of the item.");
//         require(isItemForRent(_itemId), "Item not listed for sale.");

//         listings[_itemId] = SaleListing(_itemId,msg.sender,items[_itemId].price);

//         delete rentListings[_itemId];
//     } 

//     function close() public onlyAdmin {
//         selfdestruct(payable(msg.sender));   
//     }



// }
