// Check if product options contain any numbers. If they do, they will be terated as integers, if they don't they will be treated as strings
var is_bespoke_array = [];
var is_bespoke = "";

// variable declaration
var bespoke_extra = document
  .querySelector("#calculate")
  ?.getAttribute("data-bespoke-extra");
var calc_inputs = document.querySelectorAll(".calculate-area_number");

function containsNumber(str) {
  return /[0-9]/.test(str);
}

// add to cart item
function addItem(product_id, quant) {
  let formData = {
    items: [
      {
        id: product_id,
        quantity: quant,
      },
    ],
  };
  fetch("/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      //console.log("Response " + response);
    })
    .catch((error) => {
      //console.error('Error:', error);
    });
}

// update cart item
function changeItem(product_id, quant) {
  const formData = {
    updates: {
      [product_id]: quant,
    },
  };

  fetch("/cart/update.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      //console.log(response.body.getReader())
    })
    .catch((error) => {
      //console.error('Error:', error);
    });
}

// validate function
if (
  document.body.classList.contains("template-product") &&
  document.querySelector("#calculate") != null
) {
  var validate = function (e) {
    var t = e.value;
    e.value =
      t.indexOf(".") >= 0
        ? t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)
        : t;
  };

  const tabs = document.querySelectorAll(".nav-tabs span");
  var bespoke_extra = document
    .querySelector("#calculate")
    .getAttribute("data-bespoke-extra");
  var calc_inputs = document.querySelectorAll(".calculate-area_number");

  /** Add selected value to hidden input */
  const product_option_values = document.querySelectorAll(
    ".product_option-value"
  );
  const product_select = document.querySelectorAll(".select_product-bespoke");
  const product_inputs = document.querySelectorAll(".input_product-bespoke");

  if (product_select.length > 0) {
    for (const product of product_select) {
      product.addEventListener("change", function () {
        var option = this.options[this.selectedIndex];
        /*for (const product_option_value of product_option_values){
                    product_option_value.value = option.getAttribute('data-value');
                }*/
        product.parentNode.querySelector("input").value =
          option.getAttribute("data-value");
        for (const calcInput of calc_inputs) {
          const event = new Event("change");
          calcInput.dispatchEvent(event);
        }
      });
    }
  }
  // bespoke ordering tab
  for (const tab of tabs) {
    tab.addEventListener("click", function () {
      var thisTarget = tab.getAttribute("data-attr");
      if (thisTarget == "#calculate") {
        document.querySelector(".product-form__payment-container").style.cssText = "opacity: 0.5; pointer-events: none";
        //document.querySelector(".qty-wrapper").style.display = 'none';
        //document.querySelector(".product-price").style.display = 'none';
        document.getElementById("qtyContainer").style.display = 'none';
      } else {
        for (const calcInput of calc_inputs) {
          if (!calcInput.classList.contains("product_option-value")) {
            calcInput.value = "";
          }
        }
        document.querySelector(
          ".product-form__payment-container"
        ).style.cssText = "opacity: 1; pointer-events: initial";
        // document.querySelector(".qty-wrapper").style.display = 'block';
        // document.querySelector(".product-price").style.display = 'block';
        document.getElementById("qtyContainer").style.display = 'block';
      }
      for (const pane of document.querySelectorAll(".tab-pane")) {
        pane.classList.remove("active");
      }
      for (const sub_tab of tabs) {
        sub_tab.parentElement.classList.remove("active");
      }
      tab.parentElement.classList.add("active");
      document.querySelector(thisTarget).classList.add("active");
    });
  }

  // Money Format Builder
  Shopify.moneyFormat = "£{{amount}}";
  Shopify.formatMoney = function (cents, format) {
    if (typeof cents == "string") {
      cents = cents.replace(".", "");
    }
    var value = "";
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || this.money_format;

    function defaultOption(opt, def) {
      return typeof opt == "undefined" ? def : opt;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ",");
      decimal = defaultOption(decimal, ".");

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split("."),
        dollars = parts[0].replace(
          /(\d)(?=(\d\d\d)+(?!\d))/g,
          "$1" + thousands
        ),
        cents = parts[1] ? decimal + parts[1] : "";

      return dollars + cents;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case "amount":
        value = formatWithDelimiters(cents, 2);
        break;
      case "amount_no_decimals":
        value = formatWithDelimiters(cents, 0);
        break;
      case "amount_with_comma_separator":
        value = formatWithDelimiters(cents, 2, ".", ",");
        break;
      case "amount_no_decimals_with_comma_separator":
        value = formatWithDelimiters(cents, 0, ".", ",");
        break;
    }

    return formatString.replace(placeholderRegex, value);
  };

  // onchange for set data-measurement of bespoke inputs
  product_inputs.forEach((item) => {
    if (item) {
      item.addEventListener("change", function () {
        let input_value = item.value;
        let measurement =
          this.nextElementSibling.getAttribute("data-measurement");
        let input_value_measure = input_value + measurement;
        this.nextElementSibling.value = input_value_measure;
      });
    }
  });

  // onchange for to set variant / error of bespoke inputs
  for (const calcInput of calc_inputs) {
    calcInput.addEventListener("change", function () {
      var validate = enforceMinMax();
      if (validate) {
        var selected_options = getSelected();
        is_bespoke = is_bespoke_array.indexOf(true) >= 0;
        let variant_data = JSON.parse(
          document.querySelector("[data-product-json-new]").innerHTML
        ).product.variants;
        let is_set = false;
        let is_filled = calcsFilled();
        for (let i = 0; i < variant_data.length; i++) {
          const variant = variant_data[i];
          let variant_options = removeStrings(variant.options);

          var variant_options_ints = variant_options.map(function (e) {
            if (containsNumber(e)) {
              return parseFloat(e);
            } else {
              return e;
            }
          });

          if (arraysEqual(variant_options_ints, selected_options)) {
            const groups = document.querySelectorAll(".option-selector__btns");
            for (let i = 0; i < groups.length; i++) {
              const group = groups[i],
                options = group.getElementsByClassName("opt-btn"),
                thisOption = selected_options[i];
              for (const option of options) {
                var valueString = option.value;
                var valueFromDropdown = option.dataset.dropdown_option;
                var valueFromOption = option.dataset.option;
                if (containsNumber(option.value)) {
                  var valueInt = parseFloat(removeStrings(option.value));
                } else {
                  var valueInt = option.value;
                }

                if (valueInt == thisOption) {
                  if (product_select.length > 0) {
                    if (valueFromDropdown == "true") {
                      for (const product_value of product_select) {
                        if (valueFromOption == product_value.dataset.option) {
                          if (valueString == product_value.value) {
                            option.click();
                          }
                        }
                      }
                    } else {
                      option.click();
                    }
                  } else {
                    option.click();
                  }
                }
              }
            }

            is_set = true;
            for (const subCalcInput of calc_inputs) {
              subCalcInput.classList.remove("is-error");
              document.querySelector(".calculate-error").innerHTML = "";
            }
          }
          if (i == variant_data.length - 1) {
            if (is_set == false) {
              document.querySelector(
                ".product-form__payment-container"
              ).style.cssText = "opacity: 0.5; pointer-events: none";
              for (const subCalcInput of calc_inputs) {
                subCalcInput.classList.add("is-error");
                if (is_filled) {
                  document.querySelector(".calculate-error").innerHTML =
                    "We do not stock your measurement";
                } else {
                  document.querySelector(".calculate-error").innerHTML =
                    "Please enter all values";
                }
              }
            } else {
              document.querySelector(
                ".product-form__payment-container"
              ).style.cssText = "opacity: 1; pointer-events: auto";
              const inputElements = document.querySelectorAll('.input_product-bespoke');
              const inputData = {};
              inputElements.forEach(input => {
                  const dataAttr = input.getAttribute('data-attr');
                  let value = input.value;
                  const nextSibling = input.nextElementSibling;
                  if (nextSibling && nextSibling.classList.contains('product_option-text')) {
                      const dataMeasurement = nextSibling.getAttribute('data-measurement');
                      if (dataMeasurement) {
                          value += dataMeasurement;
                      }
                  }
                  inputData[dataAttr] = value;
              });
              if (is_bespoke) {
              const preCheckoutBtn = document.querySelector(".precheckout_button");
              preCheckoutBtn.classList.add("hidden");
              //document.querySelector('.product-form__payment-container').style.display = 'flex';
              const productForm = document.querySelector(
                ".product-form.product-form-new"
              );
              if (bespoke_extra == "board") {
                let boardInput = document.createElement("input");
                boardInput.setAttribute("type", "text");
                boardInput.setAttribute("name", "properties[bespoke-extra]");
                boardInput.setAttribute("hidden", "hidden");
                boardInput.value = "board";
                productForm.appendChild(boardInput);
                for (const key in inputData) {
                  if (inputData.hasOwnProperty(key)) {
                    const value = inputData[key];
                    const prefixedKey = "bespoke-" + key;
                    let propertyInput = document.createElement("input");
                    propertyInput.setAttribute("type", "text");
                    propertyInput.setAttribute(
                      "name",
                      "properties[" + prefixedKey + "]"
                    );
                    propertyInput.setAttribute("hidden", "hidden");
                    propertyInput.value = value;
                    productForm.appendChild(propertyInput);
                  }
                }
              }
              if (bespoke_extra == "planter") {
                let planter = document.createElement("input");
                planter.setAttribute("type", "text");
                planter.setAttribute("name", "properties[bespoke-extra]");
                planter.setAttribute("hidden", "hidden");
                planter.value = "planter";
                productForm.appendChild(planter);
        
                for (const key in inputData) {
                  if (inputData.hasOwnProperty(key)) {
                    const value = inputData[key];
                    const prefixedKey = "bespoke-" + key;
                    let propertyInput = document.createElement("input");
                    propertyInput.setAttribute("type", "text");
                    propertyInput.setAttribute(
                      "name",
                      "properties[" + prefixedKey + "]"
                    );
                    propertyInput.setAttribute("hidden", "hidden");
                    propertyInput.value = value;
                    productForm.appendChild(propertyInput);
                  }
                }
              }
              if (bespoke_extra == "gates") {
                let gatesInput = document.createElement("input");
                gatesInput.setAttribute("type", "text");
                gatesInput.setAttribute("name", "properties[bespoke-extra]");
                gatesInput.setAttribute("hidden", "hidden");
                gatesInput.value = "gates";
                productForm.appendChild(gatesInput);
                for (const key in inputData) {
                  if (inputData.hasOwnProperty(key)) {
                    const value = inputData[key];
                    const prefixedKey = "bespoke-" + key;
                    let propertyInput = document.createElement("input");
                    propertyInput.setAttribute("type", "text");
                    propertyInput.setAttribute(
                      "name",
                      "properties[" + prefixedKey + "]"
                    );
                    propertyInput.setAttribute("hidden", "hidden");
                    propertyInput.value = value;
                    productForm.appendChild(propertyInput);
                  }
                }
              }
              if (bespoke_extra == "pair-gates") {
                let pairGatesInput = document.createElement("input");
                pairGatesInput.setAttribute("type", "text");
                pairGatesInput.setAttribute("name", "properties[bespoke-extra]");
                pairGatesInput.setAttribute("hidden", "hidden");
                pairGatesInput.value = "pair-gates";
                productForm.appendChild(pairGatesInput);
                for (const key in inputData) {
                  if (inputData.hasOwnProperty(key)) {
                    const value = inputData[key];
                    const prefixedKey = "bespoke-" + key;
                    let propertyInput = document.createElement("input");
                    propertyInput.setAttribute("type", "text");
                    propertyInput.setAttribute(
                      "name",
                      "properties[" + prefixedKey + "]"
                    );
                    propertyInput.setAttribute("hidden", "hidden");
                    propertyInput.value = value;
                    productForm.appendChild(propertyInput);
                  }
                }
              }
              if (bespoke_extra == "picket") {
                let picketInput = document.createElement("input");
                picketInput.setAttribute("type", "text");
                picketInput.setAttribute("name", "properties[bespoke-extra]");
                picketInput.setAttribute("hidden", "hidden");
                picketInput.value = "picket";
                productForm.appendChild(picketInput);
                for (const key in inputData) {
                  if (inputData.hasOwnProperty(key)) {
                    const value = inputData[key];
                    const prefixedKey = "bespoke-" + key;
                    let propertyInput = document.createElement("input");
                    propertyInput.setAttribute("type", "text");
                    propertyInput.setAttribute(
                      "name",
                      "properties[" + prefixedKey + "]"
                    );
                    propertyInput.setAttribute("hidden", "hidden");
                    propertyInput.value = value;
                    productForm.appendChild(propertyInput);
                  }
                }
              }
              if (bespoke_extra == "panel") {
                let panelInput = document.createElement("input");
                panelInput.setAttribute("type", "text");
                panelInput.setAttribute("name", "properties[bespoke-extra]");
                panelInput.setAttribute("hidden", "hidden");
                panelInput.value = "panel";
                productForm.appendChild(panelInput);
                for (const key in inputData) {
                  if (inputData.hasOwnProperty(key)) {
                    const value = inputData[key];
                    const prefixedKey = "bespoke-" + key;
                    let propertyInput = document.createElement("input");
                    propertyInput.setAttribute("type", "text");
                    propertyInput.setAttribute(
                      "name",
                      "properties[" + prefixedKey + "]"
                    );
                    propertyInput.setAttribute("hidden", "hidden");
                    propertyInput.value = value;
                    productForm.appendChild(propertyInput);
                  }
                }
              }
            }
            }
          }
        }
      }
    });
  }

  function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function arrayOfValues(elements) {
    var arrayItems = [];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      arrayItems.push(element.value);
      if (i == elements.length - 1) {
        return arrayItems;
      }
    }
  }

  function calcsFilled() {
    var is_filled = true;
    for (const calcInput of calc_inputs) {
      if (calcInput.value == 0) {
        is_filled = false;
      }
    }

    return is_filled;
  }

  // set minimum value for bespoke
  function enforceMinMax() {
    var calc_inputs = document.querySelectorAll(".calculate-area_number"),
      flag = true;
    for (const calcInput of calc_inputs) {
      let el = calcInput;
      if (el.value != "") {
        if (parseFloat(el.value) < parseFloat(el.min)) {
          document.querySelector(".calculate-error").innerHTML =
            "Bespoke value of " +
            el.getAttribute("data-option") +
            " should be more than " +
            el.min;
          flag = false;
          break;
        }
      }
    }
    return flag;
  }

  function getSelected() {
    var option_data = JSON.parse(
      document.querySelector("[data-product-json-new]").innerHTML
    ).options_with_values;
    var selected_options = [];
    for (let i = 0; i < calc_inputs.length; i++) {
      const option_values = removeStrings(option_data[i].values);
      const calcInput = calc_inputs[i];
      let value = calcInput.value;

      if (value != 0) {
        if (containsNumber(value)) {
          var valueInt = parseFloat(value);
        } else {
          var valueInt = value;
        }

        if (calcInput.classList.contains("product_option-value")) {
          selected_options.push(valueInt);
        } else {
          /**
           * Exclude Sample Variant from Options List
           * */
          var option_values_int = option_values
            .filter((i) => !i.includes("Sample"))
            .map(function (e) {
              return parseFloat(e);
            });

          selected_options.push(getNextHighestIndex(option_values_int, value));

          if (option_values_int.indexOf(valueInt) >= 0) {
            is_bespoke_array[i] = false;
          } else {
            is_bespoke_array[i] = true;
          }
        }
      }
      if (i == calc_inputs.length - 1) {
        return selected_options;
      }
    }
  }

  function removeStrings(value) {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        let adjustedValue;
        if (item.includes("(")) {
          adjustedValue = item.split("(").pop();
          adjustedValue = adjustedValue.split(")")[0];
          value[i] = adjustedValue;
        }
      }
    } else {
      adjustedValue = value.split("(").pop();
      value = adjustedValue.split(")")[0];
    }
    return value;
  }

  function getNextHighestIndex(arr, value) {
    let valueFloat = parseFloat(value);
    if (isNaN(valueFloat)) {
      valueFloat = value;
    }

    if (arr.includes(valueFloat)) {
      return valueFloat;
    } else {
      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (element > valueFloat) {
          return element;
        }
      }
    }
  }
}

// function to initialize variant upsell slider
function slider_upsell(initial_id){
  var found = false;
  $('.complementary_slider_upsell .slider_main_upsell').each(function(){
    var single_slider_id = $(this).attr('data-variant-id');
    if(initial_id == single_slider_id){
      found = true;
      $('.complementary_main').removeClass('initial-id-not-found');
      $(this).show();
      $(this).not('.slick-initialized').slick({
        rows: 2,
        dots: false,
        arrows: true,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: $('.complementary_main .prev'),
        nextArrow: $('.complementary_main .next'),
        responsive: [
          {
            breakpoint: 767,
            settings: {
              rows: 1,
              slidesToShow: 1
            }
          }
        ]
      });
      $(this).slick("refresh");
    }else{
      $(this).hide();
    }
  });
  // Add a class to the parent div if initial_id is not found
  if (!found) {
    $('.complementary_main').addClass('initial-id-not-found');
  }
}

// handle varinat change function call from theme.js
function handleVariantChange(args) {
  var variant = args.variant;
  let currencyFormat = window.theme.currencyCodeEnabled
    ? window.theme.moneyWithCurrencyFormat
    : window.theme.moneyFormat;
  var extraProduct =
    parseFloat(document.getElementById("bespokeTab").getAttribute("data-id")) ||
    0;
  let bespoke_price = document.querySelector(".bespoke-product__info .price");
  if (extraProduct != 0 && is_bespoke) {
    var extraCost =
      parseFloat(
        document.getElementById("bespokeTab").getAttribute("data-price")
      ) || 0;
    let updated_price = variant.price + parseInt(extraCost);
    bespoke_price.innerHTML = Shopify.formatMoney(
      updated_price,
      currencyFormat
    );
  } else {
    bespoke_price.innerHTML = Shopify.formatMoney(
      variant.price,
      currencyFormat
    );
  }
  var initial_id = args.variant.id
  slider_upsell(initial_id);

  var weight = args.variant.weight / 1000;
  document.querySelector('.product-meta__weight-number').innerText = ' ' + weight + 'kg';
  document.querySelector('.product-detail__weight-number').innerText = ' ' + weight + 'kg';

  var url = '/products/' + args.product.handle;
  fetch(url + `?variant=${args.variant.id}&section_id=product-variant-upsell`)
  .then(res => res.text())
  .then(html => {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    document.getElementById('product-variant-upsell-content').innerHTML = doc.getElementById('product-variant-upsell-content').innerHTML;

  })



}

// on initial load selected variant slider
  var initial_id = $('.complementary_slider_upsell').attr('data-main-variant-id');
  slider_upsell(initial_id);

// on product added function
// function onProductAdded(params) {
//   const calculateArea = document.getElementById("calculate");
//   const calculateClasses = calculateArea?.getAttribute("class");

//   if (calculateArea && calculateClasses.includes("active")) {
//     if (
//       calculateArea.getAttribute("data-bespoke-extra") != null ||
//       calculateArea.getAttribute("data-bespoke-extra") != undefined
//     ) {
//       var extraProduct =
//         parseFloat(
//           document.getElementById("bespokeTab").getAttribute("data-id")
//         ) || 0;
//       let bespoke_price = document.querySelector(
//         ".bespoke-product__info .price"
//       );
//       let variant_price = document
//         .querySelector(".product-price [data-product-price] .theme-money")
//         .getAttribute("data-price");
//       let currencyFormat = window.theme.currencyCodeEnabled
//         ? window.theme.moneyWithCurrencyFormat
//         : window.theme.moneyFormat;

//       if (extraProduct != 0 && is_bespoke) {
//         var extraCost =
//           parseFloat(
//             document.getElementById("bespokeTab").getAttribute("data-price")
//           ) || 0;
//         extraProduct = parseInt(extraProduct);

//         function addProduct(url, body, callback) {
//           let xhr = new XMLHttpRequest();
//           xhr.open("POST", url, true);
//           xhr.setRequestHeader(
//             "Content-Type",
//             "application/json; charset=UTF-8"
//           );
//           xhr.send(JSON.stringify(body));
//           xhr.onreadystatechange = function () {
//             if (this.readyState == 4 && this.status == 200) {
//               let regexStatus = /(\w+ state:.*?)</g,
//                 response = xhr.responseText;
//               response = JSON.parse(response);
//               callback();
//             } else {
//               if (xhr.response) {
//               }
//             }
//           };
//         }

//         let data = {
//           items: [
//             {
//               id: extraProduct,
//               quantity: 1,
//             },
//           ],
//         };

//         addProduct("/cart/add.js", data, function () {
//           document.documentElement.dispatchEvent(
//             new CustomEvent("cart:refresh", {
//               bubbles: true,
//             })
//           );
//         });

//         //Update the price
//         let updated_price = parseInt(variant_price) + parseInt(extraCost);
//         bespoke_price.innerHTML = Shopify.formatMoney(
//           updated_price,
//           currencyFormat
//         );
//       } else {
//         bespoke_price.innerHTML = Shopify.formatMoney(
//           variant_price,
//           currencyFormat
//         );
//       }
//     }
//   }
// }

async function onProductAdded(params) {
  const calculateArea = document.getElementById("calculate");
  const calculateClasses = calculateArea?.getAttribute("class");

  if (calculateArea && calculateClasses.includes("active")) {
    const bespokeExtra = calculateArea.getAttribute("data-bespoke-extra");
    if (bespokeExtra) {
      const extraProductId = parseFloat(
        document.getElementById("bespokeTab").getAttribute("data-id")
      ) || 0;
      const variantPrice = document
        .querySelector(".product-price [data-product-price] .theme-money")
        .getAttribute("data-price");
      const currencyFormat = window.theme.currencyCodeEnabled
          ? window.theme.moneyWithCurrencyFormat
          : window.theme.moneyFormat;
      if (extraProductId !== 0 && is_bespoke) {
        const extraCost = parseFloat(
          document.getElementById("bespokeTab").getAttribute("data-price")
        ) || 0;

        try {
          await addProduct("/cart/add.js", {
            items: [
              {
                id: extraProductId,
                quantity: 1,
              },
            ],
          });

          // Update the price after successful addition
          const updatedPrice = parseInt(variantPrice) + parseInt(extraCost);
          const bespokePrice = document.querySelector(
            ".bespoke-product__info .price"
          );
          bespokePrice.innerHTML = Shopify.formatMoney(updatedPrice, currencyFormat);

          document.documentElement.dispatchEvent(
            new CustomEvent("cart:refresh", {
              bubbles: true,
            })
          );
          // location.reload();

        } catch (error) {
          // Handle errors during product addition
          console.error("Error adding product:", error);
          // Optionally, provide user feedback or take other actions
        }
      } else {
        const bespokePrice = document.querySelector(
          ".bespoke-product__info .price"
        );
        bespokePrice.innerHTML = Shopify.formatMoney(variantPrice, currencyFormat);
      }
    }
  }
}

async function addProduct(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to parse response as JSON");
  }
}


function getStatus(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let response = xhr.responseText;
      response = JSON.parse(response);
      if (callback) callback(response);
    } else {
      if (xhr.response) {
      }
    }
  };
}
// on cart page change function
function onCartChange(params) {
  var target = params.target;
  console.log(target);
  var parsedQuantity = parseInt(params.target.value);
  console.log(parsedQuantity);
  // var _this = event.detail._this;

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

    formData["updates"][parseInt(target.getAttribute("data-id"))] =
      parsedQuantity;
    formData["updates"][39606868934719] = boardCount;
    formData["updates"][39648912277567] = planterCount;
    formData["updates"][39651602989119] = gatesCount;
    formData["updates"][39651603054655] = pairGatesCount;
    formData["updates"][39651603087423] = picketCount;
    formData["updates"][39651603152959] = panelCount;

    fetch("".concat("/cart/update", ".js"), {
      body: JSON.stringify(formData),
      credentials: "same-origin",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    }).then(function (cart) {
      cart.json().then(function (content) {
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
        
        // _this._rerender(false).then(function () {
        //   document.dispatchEvent(new CustomEvent("theme:loading:end"));
        // });
      });
    });
  });
}

function removeFromCart(elm) {
  // e.preventDefault();
  var href = elm.getAttribute("href");
  var target = elm;
  var vid = parseInt(elm.getAttribute("data-id"));
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
      window.location.reload();
    });
  });
}



// custom js
$(document).ready(function () {
  $(function($){$('.twentytwenty-container').twentytwenty();});
  $(".about_slider_main").slick({
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    dots: true,
    prevArrow: $('.about_main_arrows .prev'),
    nextArrow: $('.about_main_arrows .next'),
    arrows: true,
    responsive: [
      {
        breakpoint: 989,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 650,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 450,
        settings: {
          slidesToShow: 1.3,
          slidesToScroll: 1,
        },
      },
    ],
  });

  
  checkContainer();
  function checkContainer () {
    if ($('.complementary_slider_up').is(':visible')) { //if the container is visible on the page
      $(".complementary_slider_up").slick({
        rows: 2,
        dots: false,
        arrows: true,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: $('.complementary_main .prev'),
        nextArrow: $('.complementary_main .next'),
        responsive: [
        {
          breakpoint: 767,
          settings: {
            rows: 1,
            slidesToShow: 1
          }
        }
      ]
      });
    } else {
      setTimeout(checkContainer, 5); //wait 50 ms, then try again
    }
  }
    

  // Product Page Tab
  // Show the first tab and hide the rest
  $('#tabs-nav li:first-child').addClass('active');
  $('.tab-content-main').hide();
  $('.tab-content-main:first').show();

  // Click function
  $('#tabs-nav li').click(function () {
    $('#tabs-nav li').removeClass('active');
    $(this).addClass('active');
    $('.tab-content-main').hide();

    var activeTab = $(this).find('a').attr('href');
    $(activeTab).fadeIn();
    return false;
  });

  // Footer accordian
  if ($(window).outerWidth() < 767) {
    var footer_heading = $('.footer-block__heading');
    footer_heading.next().hide();
    footer_heading.next().css('padding-bottom', '16px');
    footer_heading.on('click', function(){
      $(this).next().slideToggle();
      if($(this).hasClass('active')){
        $(this).removeClass('active');
      }else{
        $(this).addClass('active');
      }
    });
  }

  $(".meta_video").lazy();

  $(window).on("resize", function () {
    progresScreen();
  });
  progresScreen();
  function progresScreen() {
    if ($(window).outerWidth() < 989) {
      $(".icon_texts_main").slick({
          dots: false,
          arrows: false,
          infinite: true,
          speed: 300,
          slidesToShow: 2,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 0,
          speed: 8000,
          pauseOnHover: false,
          cssEase: 'linear',
          responsive: [
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
    }else{
      if ($(".icon_texts_main").hasClass('slick-initialized')) {
        $(".icon_texts_main").slick('unslick');
      }
    }
  }

  // Collection description show more/show less
    var $description = $('.description');
    var descriptionHeight = $description.outerHeight();

    if (descriptionHeight < 100) {
      $('.toggle-description').hide();
      $(document).find('.less_more_main').addClass('remove_after');
    }
  
    $('.toggle-description').on('click', function() {
      var $description = $(this).prev('.description');
      $description.toggleClass('expanded');
      if ($description.hasClass('expanded')) {
        $(document).find('.less_more_main').addClass('remove_after');
        $description.css('max-height', 'none');
        $(this).text('Show Less');
      } else {
        $(document).find('.less_more_main').removeClass('remove_after');
        $description.css('max-height', '100px');
        $(this).text('Show More');
      }
    });


// Area calculator for cladding products
  // function calculateQuantity() {
  //   var dimensionString = "{{ product.metafields.custom.dimension_of_board }}";
  //   var dimensions = dimensionString.split(" x ");
  //   var width_mm = parseInt(dimensions[0].replace("mm", ""));
  //   var thickness_mm = parseInt(dimensions[1].replace("mm", ""));
  //   var width = width_mm * 0.001;
  //   var thickness = thickness_mm * 0.001;
  //   var radioButtons = document.querySelectorAll(
  //     '.option-selector__btns input[type="radio"]'
  //   );
  //   var length = 0;
  
  //   for (var i = 0; i < radioButtons.length; i++) {
  //     if (radioButtons[i].checked) {
  //       length = parseFloat(radioButtons[i].value);
  //       break;
  //     }
  //   }
  
  //   var areaCalculatorInput = document.querySelector(".area_calculator_input");
  //   var input_val = parseFloat(areaCalculatorInput.value);
  
  //   if (areaCalculatorInput.value.trim() === "") {
  //     var quantityInput = document.getElementById("Quantity");
  //     quantityInput.value = 1;
  //     return;
  //   }
  
  //   if (isNaN(width) || isNaN(thickness) || isNaN(length) || isNaN(input_val) || length === 0) {
  //     console.error("Invalid input values. Please check your inputs.");
  //     return;
  //   }
  
  //   // var quantity = input_val / (width * thickness * length);
  //   var quantity = input_val / (width * length);
  //   var finalQuantity = Math.round(quantity);
  //   var quantityInput = document.getElementById("Quantity");
  //   quantityInput.value = finalQuantity;
  //   console.log("Final Quantity:", finalQuantity);
  // }
  
  // function calculateArea() {
  //   var dimensionString = "{{ product.metafields.custom.dimension_of_board }}";
  //   var dimensions = dimensionString.split(" x ");
  //   var width_mm = parseInt(dimensions[0].replace("mm", ""));
  //   var thickness_mm = parseInt(dimensions[1].replace("mm", ""));
  //   var width = width_mm * 0.001;
  //   var thickness = thickness_mm * 0.001;
  //   var radioButtons = document.querySelectorAll(
  //     '.option-selector__btns input[type="radio"]'
  //   );
  //   var length = 0;
  
  //   for (var i = 0; i < radioButtons.length; i++) {
  //     if (radioButtons[i].checked) {
  //       length = parseFloat(radioButtons[i].value);
  //       break;
  //     }
  //   }
  
  //   var quantityInput = document.getElementById("Quantity");
  //   var quantity = parseFloat(quantityInput.value);
  
  //   if (isNaN(width) || isNaN(thickness) || isNaN(length) || isNaN(quantity) || length === 0) {
  //     console.error("Invalid input values. Please check your inputs.");
  //     return;
  //   }
  
  //   // var area = quantity * (width * thickness * length);
  //   var area = quantity * (width * length);
  //   var areaCalculatorInput = document.querySelector(".area_calculator_input");
  //   areaCalculatorInput.value = area.toFixed(2);
  //   console.log("Calculated Area:", area);
  // }
  
  // var areaCalculatorInput = document.querySelector(".area_calculator_input");
  // if (areaCalculatorInput) {
  //   areaCalculatorInput.addEventListener("input", calculateQuantity);
  // }
  
  // var radioButtons = document.querySelectorAll(
  //   '.option-selector__btns input[type="radio"]'
  // );
  // radioButtons.forEach(function (radioButton) {
  //   radioButton.addEventListener("change", calculateQuantity);
  // });
  
  // var quantityInput = document.getElementById("Quantity");
  // if (quantityInput) {
  //   quantityInput.addEventListener("input", calculateArea);
  // }
  
  // calculateArea();
});
function removeBespokeProperties() {
  let bespokeInputs = document.querySelectorAll('input[name^="properties[bespoke-"]');
  bespokeInputs.forEach(input => {
    input.parentNode.removeChild(input);
  });
}
var origiLi = document.querySelector('.notBesPoke');
origiLi.onclick = function() {
  removeBespokeProperties()
};


var variantTabs = document.querySelectorAll('.variant-tabs');
  variantTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
          var besPokeIsActive = document.querySelector('.besPoke.active');
          //var paymentButton = document.querySelector('.shopify-payment-button');

          var defaultPrice = document.getElementById('defaultPriceWrapper');
          var bespokePrice = document.getElementById('bespokePriceWrapper');

          if (besPokeIsActive) {
              //paymentButton.style.display = 'none'; 
              defaultPrice.style.display = 'none'; 
              bespokePrice.style.display = 'block'; 
          } else {
              //paymentButton.style.display = 'block';
              defaultPrice.style.display = 'block'; 
              bespokePrice.style.display = 'none'; 
          }
      });
  });