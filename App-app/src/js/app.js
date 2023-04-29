// const fs = require('fs');
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
      // document.getElementById('profile').innerHTML = userAddress;
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

    $(document).on('click', '#viewrentitems', function(){
      App.viewRentItems();
    });

    $(document).on('click', '#viewrenteditems', function(){
      App.viewrenteditems();
    });

    

    $(document).on('click', '#rentList', function(){
      App.rentList(jQuery('#rentitem-id').val());
    });

    $(document).on('click', '#viewitems', App.viewOwnedItems);

    $(document).on('click', '#registeruser', function(){
      App.handleRegisterUser(jQuery('#name').val(),jQuery('#value').val());
    });



  },

  viewrenteditems: function() {
    console.log('In view rented item');
    // var itemInstance;
    var usritems;
    var items;


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
          var renteditems = items.filter(item => {
            // check if item is not owned by current user and is available for sale
            return item[8] === account;
          });    
          console.log(renteditems);
          var container = document.getElementById("grid-container");
          for (var i = 0; i < renteditems.length; i++) {
            var imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");
            var image = document.createElement("img");
            imageContainer.style.textAlign = "center";
            image.src = '../images/'+renteditems[i][1].replace(/\s+/g, '_')+'.jpeg';
            // image.src = `images/${renteditems[i][1].replace(/\s+/g, '_')}.jpeg`;
            image.alt = 'Image' + i;
            console.log(image.src);
            image.style.maxWidth = "100%";
            image.style.maxHeight = "100%";
            
            var captionContainer = document.createElement("div");
            captionContainer.classList.add("caption-container");
            var captionText = document.createElement("span");
            captionText.classList.add("caption-text");
            captionContainer.style.textAlign = "center";
            captionText.innerHTML = renteditems[i][1] + ' Price :'+renteditems[i][6];
            captionContainer.appendChild(captionText);
            // captionContainer.appendChild(document.createElement("br"));
            captionContainer.appendChild(document.createElement("br"));


            var buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");
            var buyButton = document.createElement("button");
            buyButton.classList.add("buy-button");
            buyButton.innerHTML = "PlayGame";
            buyButton.id = "button-id-"+ renteditems[i][0];
            buttonContainer.appendChild(buyButton);

            var ratingContainer = document.createElement("div");
            ratingContainer.classList.add("rating-container");

            var ratingLabel = document.createElement("label");
            ratingLabel.innerHTML = "Rating: ";

            var ratingInput = document.createElement("input");
            ratingInput.style.textAlign = "center";
            ratingInput.type = "number";
            ratingInput.name = "rating";
            ratingInput.min = "1";
            ratingInput.max = "5";
            ratingInput.value = "1";
            ratingInput.id = "rating-input-"+renteditems[i][0];

            ratingContainer.appendChild(ratingLabel);
            ratingContainer.appendChild(ratingInput);




            imageContainer.appendChild(image);
            imageContainer.appendChild(captionContainer);
            // imageContainer.appendChild(xc);
            imageContainer.appendChild(ratingContainer);
            imageContainer.appendChild(buttonContainer);
            



            imageContainer.appendChild(document.createElement("br"));

            container.appendChild(imageContainer);
          }


          var buyButtons = document.querySelectorAll(".buy-button");
          for (var i = 0; i < buyButtons.length; i++) {
            console.log(buyButtons);
            buyButtons[i].addEventListener("click", function() {
              // handle button click event here
              console.log('In Play Game');
              var itemId = this.id.split("-")[2];
              console.log(itemId);
              App.web3.eth.getAccounts(function(error, accounts){
                var account = accounts[0];
                var option = {from:account};
                var rating = jQuery('#rating-input-'+itemId).val();
                console.log(rating);
                // var rating = 5;
                // if (rating>0 || rating <=5){
                //   toastr["error"]("Error: please give rating between 0 & 5");
                //   return false;
                // } 
                if (rating<3){
                  rating = 2;
                }
                else if (rating>3){
                  rating = 1;
                }
                console.log(rating);
                console.log(option);
                App.contracts.Games.methods.playGame(itemId,rating).send(option, function(error,result){
                  if (error){
                    console.log(error);
                  } else {
                    console.log(result);
                  }
                });
              });
            });
          }

        }
      });
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

  rentItem: function(itemId){
    console.log('In Rent Item');
    App.web3.eth.getAccounts(function(error, accounts){
      var account = accounts[0];
      var option = {from:account,value:1000};
      console.log(option);
      App.contracts.Games.methods.rentItem(itemId).send(option, function(error,result){
        if (error){
          console.log(error);
        } else {
          console.log(result);
        }
      });
    })
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
            if(error.message.indexOf('User not registered')!=-1){
              toastr["error"]("Error: Only Registered Users can view items Please register");
              return false;
            }
          } else {
            items = result;
            console.log(items);
            var itemsForRent = items.filter(item => {
              // check if item is not owned by current user and is available for sale
              return item[7] !== account && item[3] === true && item[7] !== "0x0";
            });    
            console.log(itemsForRent);
            var container = document.getElementById("grid-container");
            for (var i = 0; i < itemsForRent.length; i++) {
              var imageContainer = document.createElement("div");
              imageContainer.classList.add("image-container");

              var image = document.createElement("img");
              imageContainer.style.textAlign = "center";
              image.src = `../images/${itemsForRent[i].name.replace(/\s+/g, '_')}.jpeg`;
              // image.src = 'images/1.jpeg';
              image.alt = 'Image' + i;

              var captionContainer = document.createElement("div");
              captionContainer.classList.add("caption-container");
              var captionText = document.createElement("span");
              captionText.classList.add("caption-text");
              captionContainer.style.textAlign = "center";
              captionText.innerHTML = itemsForRent[i][1];
              captionContainer.appendChild(captionText);
              captionContainer.appendChild(document.createElement("br"));
              captionContainer.appendChild(document.createElement("br"));

              var buttonContainer = document.createElement("div");
              buttonContainer.classList.add("button-container");
              var rentButton = document.createElement("button");
              rentButton.classList.add("rent-button");
              rentButton.innerHTML = "Rent";
              rentButton.id = "button-id-"+ itemsForRent[i][0]+'-'+itemsForRent[i][6];
              buttonContainer.appendChild(rentButton);


              imageContainer.appendChild(image);
              imageContainer.appendChild(captionContainer);
              imageContainer.appendChild(buttonContainer);

              imageContainer.appendChild(document.createElement("br"));

              container.appendChild(imageContainer);
            }
            var rentButtons = document.querySelectorAll(".rent-button");
            for (var i = 0; i < rentButtons.length; i++) {
              console.log(rentButtons);
              rentButtons[i].addEventListener("click", function() {
                // handle button click event here
                console.log('In Rent Item');
                var itemId = this.id.split("-")[2];
                var price = this.id.split("-")[3];
                App.web3.eth.getAccounts(function(error, accounts){
                  var account = accounts[0];
                  var option = {from:account,value:price};
                  console.log(option);
                  App.contracts.Games.methods.rentItem(itemId).send(option, function(error,result){
                    if (error){
                      console.log(error);
                    } else {
                      console.log(result);
                    }
                  });
                });
              });
            }
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
          var container = document.getElementById("grid-container");
          container.innerHTML = "";
          
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
          if(error.message.indexOf('User not registered')!=-1){
            toastr["error"]("Error: Only Registered Users can view items Please register");
            return false;
          }
        } else {
          items = result;
          console.log(items);
          var itemsForSale = items.filter(item => {
            // check if item is not owned by current user and is available for sale
            return item[6] !== account && item[4] === true && item[6] !== "0x0";
          });    
          console.log(itemsForSale);
          var container = document.getElementById("grid-container");
          for (var i = 0; i < itemsForSale.length; i++) {
            var imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");

            var image = document.createElement("img");
            imageContainer.style.textAlign = "center";
            // image.src = 'images/1.jpeg';
            image.src = `../images/${itemsForSale[i].name.replace(/\s+/g, '_')}.jpeg`;
            image.alt = 'Image' + i;

            var captionContainer = document.createElement("div");
            captionContainer.classList.add("caption-container");
            var captionText = document.createElement("span");
            captionText.classList.add("caption-text");
            captionContainer.style.textAlign = "center";
            captionText.innerHTML = itemsForSale[i][1]+' Price: '+itemsForSale[i][5];
            captionContainer.appendChild(captionText);
            captionContainer.appendChild(document.createElement("br"));
            captionContainer.appendChild(document.createElement("br"));

            var buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");
            var buyButton = document.createElement("button");
            buyButton.classList.add("buy-button");
            buyButton.innerHTML = "Buy";
            buyButton.id = "button-id-"+ itemsForSale[i][0]+"-"+itemsForSale[i][5];
            buttonContainer.appendChild(buyButton);


            imageContainer.appendChild(image);
            imageContainer.appendChild(captionContainer);
            imageContainer.appendChild(buttonContainer);

            imageContainer.appendChild(document.createElement("br"));

            container.appendChild(imageContainer);
          }
          var buyButtons = document.querySelectorAll(".buy-button");
          for (var i = 0; i < buyButtons.length; i++) {
            console.log(buyButtons);
            buyButtons[i].addEventListener("click", function() {
              // handle button click event here
              console.log('In Buy Item');
              var itemId = this.id.split("-")[2];
              var price = this.id.split("-")[3];
              App.web3.eth.getAccounts(function(error, accounts){
                var account = accounts[0];
                var option = {from:account,value:price};
                console.log(option);
                App.contracts.Games.methods.buyItem(itemId).send(option, function(error,result){
                  if (error){
                    console.log(error);
                    if(error.message.indexOf('Insufficient funds')!=-1){
                      toastr["error"]("Error: Insufficient funds");
                      return false;
                    } //else if(){

                    // }
                  } else {
                    console.log(result);
                    toastr.success("Item successfully bought");
                  }
                });
              });
            });
          }

        }
      });
    });
    
  },



  viewOwnedItems: function(){
    var grid = document.getElementById("grid-container");

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
          if(error.message.indexOf('User not registered')!=-1){
            toastr["error"]("Error: Only Registered Users Please register");
            return false;
          }
        } else {
          console.log(result[0]);
          App.items=result;
          var rem = App.items.splice(-1);
          // console.log(rem);
          console.log(App.items);
          var myGrid = document.getElementById("grid-container");

          var container = document.getElementById("grid-container");
          container.innerHTML = "";
          for(var i=0; i<App.items.length;i++){
            var imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");
            // imageContainer.style.display = "flex";
            // imageContainer.style.justifyContent = "center";
            // imageContainer.style.alignItems = "center";

            var image = document.createElement("img");
            imageContainer.style.textAlign = "center";
            // console.log(App.items[i]);
            image.src = `../images/${App.items[i].name.replace(/\s+/g, '_')}.jpeg`;
            console.log(image.src);

            // image.src = 'images/1.jpeg';
            // console.log(image.src);


            image.alt = 'Image'+i;
            image.style.maxWidth = "100%";
            image.style.maxHeight = "100%";

            var captionContainer = document.createElement("div");
            captionContainer.classList.add("caption-container");
            var captionText = document.createElement("span");
            captionText.classList.add("caption-text");
            captionContainer.style.textAlign = "center";
            captionText.innerHTML = App.items[i].description + 'Price:' + App.items[i].price;
            captionContainer.appendChild(captionText);
            captionContainer.appendChild(document.createElement("br"));
            captionContainer.appendChild(document.createElement("br"));

            var buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");
            var rentButton = document.createElement("button");
            rentButton.classList.add("rent-button");
            rentButton.innerHTML = "List for Rent";
            rentButton.id = "rentbutton-id-"+ App.items[i][0]+'-'+App.items[i][6];
            buttonContainer.appendChild(rentButton);

            // var buttonContainer1 = document.createElement("div");
            buttonContainer.classList.add("button-container");
            var sellButton = document.createElement("button");
            sellButton.classList.add("sell-button");
            sellButton.innerHTML = "List for Sell";
            sellButton.id = "sellbutton-id-"+ App.items[i][0]+'-'+App.items[i][5];
            buttonContainer.appendChild(sellButton);

            imageContainer.appendChild(image);
            imageContainer.appendChild(captionContainer);
            imageContainer.appendChild(buttonContainer);
            // imageContainer.appendChild(buttonContainer1);

            imageContainer.appendChild(document.createElement("br"));

            container.appendChild(imageContainer);
          }


          var sellButtons = document.querySelectorAll(".sell-button");
          for (var i = 0; i < sellButtons.length; i++) {
            console.log(sellButtons[i]);
            sellButtons[i].addEventListener("click", function() {
              // handle button click event here
              console.log('In List for sell');
              var itemId = this.id.split("-")[2];
              console.log(itemId);
              App.web3.eth.getAccounts(function(error, accounts){
                var account = accounts[0];
                var option = {from:account};
                console.log(option);
                App.contracts.Games.methods.listItemForSale(itemId).send(option, function(error,result){
                  if (error){
                    console.log(error);
                  } else {
                    console.log(result);
                  }
                });
              });
            });
          }

          var rentButtons = document.querySelectorAll(".rent-button");
          for (var i = 0; i < rentButtons.length; i++) {
            console.log(rentButtons[i]);
            rentButtons[i].addEventListener("click", function() {
              // handle button click event here
              console.log('In List for rent');
              var itemId = this.id.split("-")[2];
              console.log(itemId);
              App.web3.eth.getAccounts(function(error, accounts){
                var account = accounts[0];
                var option = {from:account};
                console.log(option);
                App.contracts.Games.methods.listItemForRent(itemId).send(option, function(error,result){
                  if (error){
                    console.log(error);
                  } else {
                    console.log(result);
                  }
                });
              });
            });
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

  handleRegisterUser: function(username, balance) {
    var itemInstance;
    console.log('In Register user function');
    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      var option={from:account,value: balance};
      console.log(option);
      // console.log(typeof parseInt(price));
      App.contracts.Games.methods.registerUser(username)
      .send(option, function(error,result){
        if (error){
          console.log(error);
          if(error.message.indexOf('User already registered')!=-1){
            toastr["error"]("Error: User already registered");
            return false;
          }
        } else {
          console.log('Here');
          console.log(result);
          toastr.success("User Successfully Registered");
        }
      });


    })
  },

  handleAddItem: function(name,description,price) {
    if (name === '' || description === '' || price === '') {
      alert('Please enter a valid name, description and price.');
      return;
    }
    var itemInstance;
    console.log('In add item function');
    App.web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log(account);
      var option={from:account};
      console.log(option);
      console.log(typeof parseInt(price));

      App.contracts.Games.methods.addItem(name,price,description)
      .send(option, async function(error,result){
        if (error){
          if(error.message.indexOf('User not registered')!=-1){
            toastr["error"]("Error: Only Registered Users can add items");
            return false;
          }
          console.log("in error");
        } else {
          console.log('Here');
          toastr.success("Item Successfully added");
          console.log(result);
          
          $.getJSON("../items.json", function (data) {
            console.log(data);
          });

          const newItem = { name: 'New Item', description: 'This is a new item', price: 9.99 };
          console.log(JSON.stringify(newItem))

          $.getJSON("../items.json", function (data) {
            console.log(data);
          });

          const file = document.querySelector('input[type="file"]').files[0];
          const formData = new FormData();
          formData.append('myFile', file);
          formData.append('account', account);
          formData.append('name', name);
          formData.append('description', description);
          formData.append('price', price);


          const response = await fetch('/upload', {
            method: 'POST',
            body: formData
          });
          const data = await response.text();
          console.log(data);
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