App = {
  //top level variables
  web3: null,
  contracts: {},
  //development
  url:'http://127.0.0.1:7545',
  network_id:5777,
  sender:null,
  receiver:null,
  value:1000000000000000000,
  index:0,
  margin:10,
  left:15,
  
  
  // App init
  init: function() {
    console.log('In APP.init function');
    return App.initWeb3();
  },

  //web3 init
  initWeb3: function() {   
    //initializing web3
    console.log('In init Web3 function');      
    if (typeof web3 !== 'undefined') {
      App.web3 = new Web3(Web3.givenProvider);
    } else {
      App.web3 = new Web3(App.url);
    }
    console.log(App.web3);
    ethereum.enable();      
    return App.initContract();  
  },

  //init contract
  initContract: function() {
    console.log('In init Contract');   
    $.getJSON('GameItems.json', function(data) {
      // App.contracts.game =        
      App.contracts.Games = new App.web3.eth.Contract(data.abi, data.networks[App.network_id].address, {});

      console.log(App.contracts.Games);
      // console.log(App.contracts.Games.methods.admin().call());
      //populating contract's balance
      App.web3.eth.getBalance(App.contracts.Games._address).then((res)=>{ jQuery('#channel_balance').text(App.web3.utils.fromWei(res),"ether");})   
    })
         
         
    return App.bindEvents();
  },

  bindEvents: function() {  
    App.web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var userAddress = accounts[0];
      console.log(accounts);
      // update user's address in the HTML
      document.getElementById('profile').innerHTML = userAddress;
      jQuery('#profile').text(userAddress)
    });

    
    $(document).on('click', '#additem', function(){
       App.handleAddItem(jQuery('#item-name').val(),jQuery('#item-description').val(),jQuery('#item-price').val());
    });

    $(document).on('click', '#viewuser', App.viewUser);

    $(document).on('click', '#sellList', function(){
      App.sellList(jQuery('#item-id').val());
    });
    $(document).on('click', '#rentList', function(){
      App.rentList(jQuery('#rentitem-id').val());
    });

    $(document).on('click', '#viewitems', App.viewItem);

    $(document).on('click', '#registeruser', function(){
      App.handleRegisterUser('Ganesh Reddy');
    });

    $(document).on('click', '#transfer', function(){
      App.handleTransfer(jQuery('#item-name').val(),jQuery('#item-description').val(),jQuery('#item-price').val());
    });


  },

  rentList: function(itemId){
    console.log('In rent list');
    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      var option={from:account};
      console.log(option);
      console.log(itemId)
      App.contracts.Games.methods.listItemForRent(itemId).send(option,function(error, result) {
        if (error) {
          console.log(error);
        } else {
          console.log(result);
        }
      });
      
    });
    
  },




  viewItem: function(){
    console.log('In view item');
    var itemInstance;
    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      // console.log(App.contracts.Games.methods.getUser(account));
      var option={from:account};
      console.log(option);
      App.contracts.Games.methods.getItemsByUser().call(option,function(error, result) {
        if (error) {
          console.log(error);
        } else {
          console.log(result);
        }
      });
      
    

    });
  },

  viewUser: function(){
    console.log('In view item');
    var itemInstance;
    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      console.log(App.contracts.Games.methods.getUser(account));
      var option={from:account};
      console.log(option);
      // App.contracts.Games.methods.getUser(account) 

      App.contracts.Games.methods.users(account)
      .call(option, function(error, result) {
        if (error) {
            console.error(error);
        } else {
            console.log(result.username);
            document.getElementById('name').innerHTML = result.username;
        }
      });
    

    });
  },

  sellList: function(itemId){
    console.log('In sell list');
    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      var option={from:account};
      console.log(option);
     
      App.contracts.Games.methods.listItemForSale(itemId).send(option,function(error, result) {
        if (error) {
          console.log(error);
        } else {
          console.log(result);
        }
      });
      
    });
    
  },

  handleRegisterUser: function(username) {
    var itemInstance;
    console.log('In add user function');
    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      var option={from:account,value: 10};
      console.log(option);
      // console.log(typeof parseInt(price));
      App.contracts.Games.methods.registerUser(username)
      .send(option, function(error,result){
        if (error){
          console.log(error);
        } else {
          console.log('Here');
          console.log(result);
        }
      });


    })
  },

  handleAddItem: function(name,description,price) {
    var itemInstance;
    console.log('In add item function');
    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      var option={from:account};
      console.log(option);
      console.log(typeof parseInt(price));
      App.contracts.Games.methods.addItem('name',0,'Hi')
      .send(option, function(error,result){
        if (error){
          console.log(error);
        } else {
          console.log('Here');
          console.log(result);
        }
      });


    })
  }
}

$(function() {
  $(window).load(function() {
    App.init();
    toastr.options = {
      "positionClass": "right newtoast",
      "preventDuplicates": true,
      "closeButton": true
    };
  });
});