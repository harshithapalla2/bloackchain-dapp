var Games = artifacts.require("GameItems");

module.exports = function(deployer,networks,accounts) {
  // var receiver=accounts[1];
  var _username='Ganesh'; 
  var balance=5000000000000;  
  deployer.deploy(Games,_username,{value:balance});
};
