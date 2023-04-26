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
  items:null,
  
  
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

    $(document).on('click', '#viewsaleitems', function(){
      App.viewSaleItems();
    });

    $(document).on('click', '#rentList', function(){
      App.rentList(jQuery('#rentitem-id').val());
    });

    $(document).on('click', '#viewitems', App.viewOwnedItems);

    $(document).on('click', '#registeruser', function(){
      App.handleRegisterUser('Ganesh Reddy');
    });

    $(document).on('click', '#buyItem', function(){
      App.buyItem(jQuery('#buyitem-id').val());
    });

    // $(document).on('click', '#transfer', function(){
    //   App.handleTransfer(jQuery('#item-name').val(),jQuery('#item-description').val(),jQuery('#item-price').val());
    // });


  },


  buyItem: function(itemId){
    console.log('In Buy Item');
    App.web3.eth.getAccounts(function(error, accounts){
      var account = accounts[0];
      var option = {from:account,value:10};
      console.log(option);
      App.contracts.Games.methods.buyItem(itemId).send(option, function(error,result){
        if (error){
          console.log(error);
        } else {
          console.log(result);
        }
      });
    })
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


  //Items he can rent
  viewRentItems: function() {
    console.log('In view item');
    // var itemInstance;
    var usritems;
    var items;
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
          usritems = result;
          console.log(usritems);
        }
      });
    });

    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      var option={from:account};
      console.log(option);

      App.contracts.Games.methods.getAllItems().call(option, function(error,result){
        if (error){
          console.log(error);
        } else {
          items = result;
          console.log(items);
          var itemsForRent = items.filter(item => {
            // check if item is not owned by current user and is available for sale
            return item[6] !== account && item[3] === true && item[6] !== "0x0";
          });    
          console.log(itemsForRent);
        }
      });
    });
    
  },

  // List of items he can buy
  viewSaleItems: function() {
    console.log('In view item');
    // var itemInstance;
    var usritems;
    var items;
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
          usritems = result;
          console.log(usritems);
        }
      });
    });

    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      var option={from:account};
      console.log(option);

      App.contracts.Games.methods.getAllItems().call(option, function(error,result){
        if (error){
          console.log(error);
        } else {
          items = result;
          console.log(items);
          var itemsForSale = items.filter(item => {
            // check if item is not owned by current user and is available for sale
            return item[6] !== account && item[4] === true && item[6] !== "0x0";
          });    
          console.log(itemsForSale);
        }
      });
    });
    
  },



  viewOwnedItems: function(){
    // var myVariable = "Hello, world!";
    // document.getElementById("output1").innerHTML = myVariable;
    var grid = document.getElementById("grid-container");
    if (grid.style.display === "none") {
      grid.style.display = "none";
    } else {
      grid.style.display = "none";
    }

    console.log('In view owned items');
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
          console.log(result[0]);
          App.items=result;
          var rem = App.items.splice(-1);
          // console.log(rem);
          console.log(App.items);
          var myGrid = document.getElementById("grid-container");
          // for (var i = 0; i < App.items.length; i++) {
          //   var newItem = document.createElement("div");
          //   newItem.className = "grid-item";
          //   var newImage = document.createElement("img");
          //   newImage.src = '../images/1.jpeg';
          //   newImage.alt = 'image'+i;
          //   console.log(newImage.alt);
          //   newItem.appendChild(newImage);
          //   console.log(newItem);
          //   myGrid.appendChild(newItem);
          // }


          var container = document.getElementById("grid-container");
          container.innerHTML = "";
          for(var i=0; i<App.items.length;i++){
            var imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");

            var image = document.createElement("img");
            image.src = 'images/1.jpeg';
            image.alt = 'Image'+i;

            var captionContainer = document.createElement("div");
            captionContainer.classList.add("caption-container");
            var captionText = document.createElement("span");
            captionText.classList.add("caption-text");
            captionText.innerHTML = App.items[i].description;
            captionContainer.appendChild(captionText);

            var buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");
            var buyButton = document.createElement("button");
            buyButton.classList.add("buy-button");
            buyButton.innerHTML = "Buy";
            buttonContainer.appendChild(buyButton);

            imageContainer.appendChild(image);
            imageContainer.appendChild(captionContainer);
            imageContainer.appendChild(buttonContainer);

            container.appendChild(imageContainer);
          }

          
          
          // document.getElementById("output1").innerHTML = App.items;
        }
      });
      // console.log(App.items);
      
    

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