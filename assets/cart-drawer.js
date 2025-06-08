// Change in Cart
function updateQuantity(line,quantity) {
  $.ajax({
      type: 'POST',
      url: '/cart/change',
      data: 'quantity=' + quantity + '&line=' + line,
      dataType: 'json',
      success: function(cart) {
      },
    });
}
// ===============================================================================
// Fetch product to cart Drawer
$(document).ready(function() {
  $(document).on('click', 'button[data-add-to-cart], #colorbox .quickbuy__submit', function(e){
    e.preventDefault();
    var data = $(this).parents('form').serialize();
    var qty = $(this).parents('form').find('.qty-actual__input').value;

    var $thisButton = $(this).find('[data-add-to-cart-text]');  
    var main_qty = parseInt($('#Quantity.qty-actual__input').val());
    var available_qty_of_variant = parseInt($('.qty-wrapper').attr('data-qty'));
    if(main_qty == 0){
      // $thisButton.html('Add to cart');
      $('.qty-wrapper').find('.error_msg').html('Please add atleat 1 quantity!').show();
    }else if(available_qty_of_variant >= main_qty){
      var originalText = $thisButton.html('<span class="loader_custom">Adding <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="24" height="24" style="shape-rendering: auto; display: block; background: transparent;" xmlns:xlink="http://www.w3.org/1999/xlink"><g><circle cx="50" cy="50" r="32" stroke-width="8" stroke="#ffffff" stroke-dasharray="50.26548245743669 50.26548245743669" fill="none" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="0 50 50;360 50 50"></animateTransform></circle><g></g></g></span>');  
      $.ajax({
        type: 'POST',
        url: '/cart/add',
        data: data,
        dataType: 'html',
        success: function(response){
          $thisButton.html('Add to cart');
          $('.qty-wrapper').find('.error_msg').hide();
          if(document.body.classList.contains("template-product") &&  document.querySelector("#calculate") != null && window.onProductAdded) {
              window.onProductAdded(data);
          }
          $('.cart__drawer').addClass('show-cart__drawer');
          $('body').addClass('cv--show-cart__drawer');
          $('.cart__drawer-item').html($(response).find('.cart__drawer-item').html());
          $('.cart__drawer').html($(response).filter('.cart__drawer').html()).addClass('show-cart__drawer');
          $('.header-cart__count').html($(response).find('.header-cart__count').html());
          
          // $('body, html').css('overflow', 'hidden');
          $('.cross').click(function(){
            $('.cart__drawer').removeClass('show-cart__drawer');
          });
          setTimeout(function(){
            $.ajax({
              type: 'GET',
              url: '/',
              dataType: 'html',
              success: function(response){
                $('.cart__drawer-item').html($(response).find('.cart__drawer-item').html());
                $('.cart__drawer').html($(response).filter('.cart__drawer').html()).addClass('show-cart__drawer');
                $('.header-cart__count').html($(response).find('.header-cart__count').html());
              }
            });
          }, 1500);

          const cartJson = '/cart.js';
          async function getCartJson() {
            fetch(cartJson).then((res) => {
              return res.json();
            }).then((data) => {
              //console.log(data);

              var customEvent = new CustomEvent('cart-updated', {
                detail: { 
                  data: data
                }
              });
              window.dispatchEvent(customEvent);
            });
          }
          getCartJson();
          

        }
      });
    }else{
      // $thisButton.html('Add to cart');
      $('.qty-wrapper').find('.error_msg').html(`We apologise, but this item is currently limited on stock. Please <a href='tel:01409231763' style="color:#2A4125;">call us</a> or join our live chat to get updates on availability.`).show();
    }

  });

  // Cart Drawer Open On Click Cart Icon
  if(!$('body').hasClass('template-cart')){
    $(document).on("click",".header-cart", function(e) {
      e.preventDefault();
      $('.cart__drawer').addClass('show-cart__drawer');
      $('body').addClass('cv--show-cart__drawer');
      // $('body, html').css('overflow', 'hidden');
    });
  }
  // Cart Drawer Close On Click cross Icon
  $(document).on("click",".cross",function() {
    $('.cart__drawer').removeClass('show-cart__drawer');
    $('body').removeClass('cv--show-cart__drawer');
    // $('body, html').css('overflow', 'auto');
  });
//   Close Cart Drawer click anywhere
  $(document).mouseup(function(e){
    var container = $(".cart__drawer");
    if (!container.is(e.target) && container.has(e.target).length === 0){
      container.show();
      $('.cart__drawer').removeClass('show-cart__drawer');
      $('body').removeClass('cv--show-cart__drawer');
      // $('body, html').css('overflow', 'auto');
    }
  });
  
  // Remove Item from Cart
  $(document).on("click",".cart__remove",function(e) {
    e.preventDefault();
    var href = this.getAttribute("href");
    var target = this;
    var vid = parseInt(this.getAttribute("data-id"));
    getStatus("/cart.js", function (response) {
      var boardCount = response.items.find((item) => item.variant_id == 39606868934719)?.quantity || 0;
      var planterCount = response.items.find((item) => item.variant_id == 39648912277567)?.quantity || 0;
      var gatesCount = response.items.find((item) => item.variant_id == 39651602989119)?.quantity || 0;
      var pairGatesCount = response.items.find((item) => item.variant_id == 39651603054655)?.quantity || 0;
      var picketCount = response.items.find((item) => item.variant_id == 39651603087423)?.quantity || 0;
      var panelCount = response.items.find((item) => item.variant_id == 39651603152959)?.quantity || 0;
      var formData = {
        updates: {},
      };
      for (let i = 0; i < response.items.length; i++) {
        const item = response.items[i];
        const itemProperties = item.properties;
        
        if (item.id != 39606868934719 && itemProperties != null) {
          if (itemProperties.hasOwnProperty("bespoke-extra")) {
            var hasBoard = false;
            var hasPlanter = false;
            var hasGates = false;
            var hasPairGates = false;
            var hasPicket = false;
            var hasPanel = false;
            switch (itemProperties["bespoke-extra"]) {
              case "board":
                hasBoard = true;
                break;
              case "planter":
                hasPlanter = true;
                break;
              case "gates":
                hasGates = true;
                break;
              case "pair-gates":
                hasPairGates = true;
                break;
              case "picket":
                hasPicket = true;
                break;
              case "panel":
                hasPanel = true;
                break;
            }
            if(vid == item.id){
              if (hasBoard) {
                formData["updates"][39606868934719] = boardCount - item.quantity > 0 ? boardCount - item.quantity : 0;
              }
              if (hasPlanter) {
                formData["updates"][39648912277567] = planterCount - item.quantity > 0 ? planterCount - item.quantity : 0;
              }
              if (hasGates) {
                formData["updates"][39651602989119] = gatesCount - item.quantity > 0 ? gatesCount - item.quantity : 0;
              }
              if (hasPairGates) {
                formData["updates"][39651603054655] = pairGatesCount - item.quantity > 0 ? pairGatesCount - item.quantity : 0;
              }
              if (hasPicket) {
                formData["updates"][39651603087423] = picketCount - item.quantity > 0 ? picketCount - item.quantity : 0;
              }
              if (hasPanel) {
                formData["updates"][39651603152959] = panelCount - item.quantity > 0 ? panelCount - item.quantity : 0;
              }
            }
          }
        }
      }
      formData["updates"][vid] = 0;
      fetch("".concat("/cart/update", ".js"), {
        body: JSON.stringify(formData),
        credentials: "same-origin",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      }).then(function (cart) {
        $.ajax({
          type: 'GET',
          url: '/',
          dataType: 'html',
          success: function(response){
            $('.cart__drawer-item').html($(response).find('.cart__drawer-item').html());
            $('.cart__drawer').html($(response).filter('.cart__drawer').html()).addClass('show-cart__drawer');
            $('.header-cart__count').html($(response).find('.header-cart__count').html());
          }
        });
      });
    });
  });

  $(document).ajaxStart(function() {
        // Show the progress bar and set its width to 10% when AJAX starts
        $('#progressBar').css('width', '10%').show();
  }).ajaxSend(function(event, jqXHR, ajaxOptions) {
      // Increase width gradually, indicating progress
      $('#progressBar').css('width', '50%'); // Mid-request width
  }).ajaxSuccess(function() {
      // Once the AJAX call successfully completes, expand to full width
      $('#progressBar').css('width', '100%');
  }).ajaxComplete(function() {
      // When AJAX completes, fade out and reset the progress bar
      $('#progressBar').fadeOut(400, function() {
          $(this).css('width', '0%');
      });
  });
});



// Change In Quantity Selector
document.addEventListener('DOMContentLoaded', function() {
  function showProgressBar() {
      $('#progressBar').css('width', '10%').show();
  }
  
  function updateProgressBar(percentage) {
      $('#progressBar').css('width', percentage + '%');
  }
  
  function hideProgressBar() {
      $('#progressBar').css('width', '100%'); // Completes the bar
      setTimeout(() => {
          $('#progressBar').fadeOut(400, function() {
              $(this).css('width', '0%'); // Reset after fade out
          });
      }, 500); // Delay to show completion before hiding
  }

  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('plus') || event.target.classList.contains('minus')) {
      const button = event.target;
      event.preventDefault();

      var target = ''
      if (button.classList.contains('minus')) {
        var target = button.nextElementSibling;
        target.value = Math.max(0, parseInt(target.value, 10) - 1);
      } else if (button.classList.contains('plus')) {
        var target = button.previousElementSibling;
        target.value = parseInt(target.value, 10) + 1;
      }

      let parsedQuantity = parseInt(target.value, 10);

      function getStatus(url, callback) {
          let xhr = new XMLHttpRequest();
          xhr.open("GET", url);
          xhr.send();
          xhr.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                  let response = JSON.parse(xhr.responseText);
                  if (callback) callback(response);
              }
          };
      }

      getStatus("/cart.js", function (response) {
        var boardCount = 0;
        var planterCount = 0;
        var gatesCount = 0;
        var pairGatesCount = 0;
        var picketCount = 0;
        var panelCount = 0;
        for (let i = 0; i < response.items.length; i++) {
          const item = response.items[i];
          const itemProperties = item.properties;
          if (item.id != 39606868934719 && itemProperties != null) {
            if (itemProperties.hasOwnProperty("bespoke-extra")) {
              var hasBoard = false;
              var hasPlanter = false;
              var hasGates = false;
              var hasPairGates = false;
              var hasPicket = false;
              var hasPanel = false;
              switch (itemProperties["bespoke-extra"]) {
                case "board":
                  hasBoard = true;
                  break;
                case "planter":
                  hasPlanter = true;
                  break;
                case "gates":
                  hasGates = true;
                  break;
                case "pair-gates":
                  hasPairGates = true;
                  break;
                case "picket":
                  hasPicket = true;
                  break;
                case "panel":
                  hasPanel = true;
                  break;
              }
              if (hasBoard) {
                if (target.getAttribute("data-line") == i + 1) {
                  boardCount = boardCount + parsedQuantity;
                } else {
                  boardCount = boardCount + item.quantity;
                }
              }
              if (hasPlanter) {
                if (target.getAttribute("data-line") == i + 1) {
                  planterCount = planterCount + parsedQuantity;
                } else {
                  planterCount = planterCount + item.quantity;
                }
              }
              if (hasGates) {
                if (target.getAttribute("data-line") == i + 1) {
                  gatesCount = gatesCount + parsedQuantity;
                } else {
                  gatesCount = gatesCount + item.quantity;
                }
              }
              if (hasPairGates) {
                if (target.getAttribute("data-line") == i + 1) {
                  pairGatesCount = pairGatesCount + parsedQuantity;
                } else {
                  pairGatesCount = pairGatesCount + item.quantity;
                }
              }
              if (hasPicket) {
                if (target.getAttribute("data-line") == i + 1) {
                  picketCount = picketCount + parsedQuantity;
                } else {
                  picketCount = picketCount + item.quantity;
                }
              }
              if (hasPanel) {
                if (target.getAttribute("data-line") == i + 1) {
                  panelCount = panelCount + parsedQuantity;
                } else {
                  panelCount = panelCount + item.quantity;
                }
              }
            }
          }
        }
    
        let formData = {
          updates: {},
        };
    
        formData["updates"][parseInt(target.getAttribute("data-id"))] = parsedQuantity;
        formData["updates"][39606868934719] = boardCount;
        formData["updates"][39648912277567] = planterCount;
        formData["updates"][39651602989119] = gatesCount;
        formData["updates"][39651603054655] = pairGatesCount;
        formData["updates"][39651603087423] = picketCount;
        formData["updates"][39651603152959] = panelCount;
        showProgressBar();
        fetch("".concat("/cart/update", ".js"), {
          body: JSON.stringify(formData),
          credentials: "same-origin",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }).then(function (cart) {
          updateProgressBar(50);
          cart.json().then(function (content) {
            updateProgressBar(80);
            // _this.itemCount = content["item_count"];
            const cartSectionId = document
              .querySelector(".cart")
              ?.getAttribute("data-section-id");
            $.ajax({
              type: "GET",
              url: theme.routes.cart_url + `?sections=header,${cartSectionId}`,
              success: function (data) {
                const toReplace = {};
                toReplace["header"] = [
                  ".page-header .header-cart",
                  ".docked-navigation-container .header-cart",
                ];
                toReplace[cartSectionId] = [
                  '[data-section-type="cart"] .cart-items',
                  '[data-section-type="cart"] .subtotal-row',
                ];
                Object.keys(toReplace).forEach((section) => {
                  let $newDom = $(data[section]);
                  $newDom.find(".fade-in").removeClass("fade-in");
    
                  for (let i = 0; i < toReplace[section].length; i++) {
                    $(toReplace[section][i]).html(
                      $newDom.find(toReplace[section][i]).html()
                    );
                  }
                });
              },
              error: function (data) {
                if (data.statusText != "abort") {
                  console.log("Error refreshing page");
                }
              },
              complete: () => {
                this.cartRefreshXhr = null;
              },
            });
            $.ajax({
              type: 'GET',
              url: '/',
              dataType: 'html',
              success: function(response){
                $('.cart__drawer-item').html($(response).find('.cart__drawer-item').html());
                $('.cart__drawer').html($(response).filter('.cart__drawer').html()).addClass('show-cart__drawer');
                $('.header-cart__count').html($(response).find('.header-cart__count').html());
              }
            });
          }).finally(() => {
            hideProgressBar();
        });
        });
      });
    }
  });
});
  
