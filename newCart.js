let currentDiscount = null;
let cartInstance = Object.create(Cart);
cartInstance.products = [];

// Render available products
function renderProducts() {
  const productsGrid = document.getElementById("products-grid");
  productsGrid.innerHTML = "";

  predefinedProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
              <h3>${product.name}</h3>
              <p class="price">$${product.price.toFixed(2)}</p>
              <button class="add-to-cart-btn" onclick="addToCart(${
                product.id
              })">
                  Add to Cart
              </button>
          `;
    productsGrid.appendChild(productCard);
  });
}

// Add product to cart
function addToCart(productId) {
  const product = predefinedProducts.find((p) => p.id === productId);
  if (product) {
    const cartProduct = new Product(product.id, product.name, product.price, 1);
    cartInstance.addProduct(cartProduct);
    updateCartDisplay();
  }
}

// Remove product from cart
function removeFromCart(productId) {
  cartInstance.removeProduct(productId);
  updateCartDisplay();
}

// Update quantity
function updateQuantity(productId, newQuantity) {
  const product = cartInstance.products.find((p) => p.id === productId);
  if (product && newQuantity > 0) {
    product.quantity = parseInt(newQuantity);
    updateCartDisplay();
  } else if (newQuantity <= 0) {
    removeFromCart(productId);
  }
}

// Calculate Buy 2 Get 1 Free details for UI display
function getBuyTwoGetOneFreeDetails(products) {
  const totalItems = products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const groupsOfThree = Math.floor(totalItems / 3);
  const freeItems = groupsOfThree;

  if (freeItems === 0) {
    return {
      freeItems: 0,
      discountAmount: 0,
      description: "Add more items to qualify",
    };
  }

  // Create array of all individual item prices
  const allItemPrices = [];
  products.forEach((product) => {
    for (let i = 0; i < product.quantity; i++) {
      allItemPrices.push(product.price);
    }
  });

  // Sort prices from cheapest to most expensive
  allItemPrices.sort((a, b) => a - b);

  // The free items are the cheapest ones
  const discountAmount = allItemPrices
    .slice(0, freeItems)
    .reduce((sum, price) => sum + price, 0);

  return {
    freeItems,
    discountAmount,
    description: `${freeItems} free item${freeItems > 1 ? "s" : ""}`,
  };
}

// Update cart display
function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  const cartEmpty = document.getElementById("cart-empty");
  const cartTable = document.getElementById("cart-table");
  const cartCount = document.getElementById("cart-count");

  // Update cart count
  const totalItems = cartInstance.products.reduce(
    (sum, p) => sum + p.quantity,
    0
  );
  cartCount.textContent = totalItems;

  if (cartInstance.products.length === 0) {
    cartTable.style.display = "none";
    cartEmpty.style.display = "block";
  } else {
    cartTable.style.display = "table";
    cartEmpty.style.display = "none";

    cartItems.innerHTML = "";
    cartInstance.products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td>${product.name}</td>
                  <td>$${product.price.toFixed(2)}</td>
                  <td>
                      <input type="number" 
                             value="${product.quantity}" 
                             min="1" 
                             class="quantity-input"
                             onchange="updateQuantity(${
                               product.id
                             }, this.value)">
                  </td>
                  <td>$${(product.price * product.quantity).toFixed(2)}</td>
                  <td>
                      <button class="remove-btn" onclick="removeFromCart(${
                        product.id
                      })">
                          Remove
                      </button>
                  </td>
              `;
      cartItems.appendChild(row);
    });
  }

  updateCartSummary();
  updateDiscountButtonText();
}

// Update discount button text to show current deal status
// function updateDiscountButtonText() {
//   const totalItems = cartInstance.products.reduce(
//     (sum, p) => sum + p.quantity,
//     0
//   );
//   const buyTwoGetOneBtn = document.querySelector(
//     "[onclick=\"applyDiscount('buy-two-get-one')\"]"
//   );

//   if (totalItems < 3) {
//     const needed = 3 - totalItems;
//     buyTwoGetOneBtn.textContent = `Buy 2 Get 1 Free (Need ${needed} more)`;
//   } else {
//     const details = getBuyTwoGetOneFreeDetails(cartInstance.products);
//     buyTwoGetOneBtn.textContent = `Buy 2 Get 1 Free (${details.freeItems} free!)`;
//   }
// }

// Update cart summary
function updateCartSummary() {
  const subtotal = cartInstance.getTotal();
  let discountAmount = 0;
  let totalBeforeVAT = subtotal;
  let discountDescription = "";

  // Apply discount if any
  if (currentDiscount) {
    if (currentDiscount === "ten-percent") {
      totalBeforeVAT = tenPercentOff(subtotal);
      discountAmount = subtotal - totalBeforeVAT;
      discountDescription = "10% Off";
    } else if (currentDiscount === "buy-two-get-one") {
      totalBeforeVAT = buyTwoGetOneFree(subtotal, cartInstance.products);
      discountAmount = subtotal - totalBeforeVAT;
      const details = getBuyTwoGetOneFreeDetails(cartInstance.products);
      discountDescription = `Buy 2 Get 1 Free - ${details.description}`;
    }
  }

  // Automatically apply VAT
  const total = addVAT(totalBeforeVAT);
  const vatAmount = total - totalBeforeVAT;

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("discount-amount").textContent = discountAmount
    ? `-$${discountAmount.toFixed(2)}`
    : `$0.00`;
  document.getElementById("vat-amount").textContent = `+$${vatAmount.toFixed(
    2
  )}`;
  document.getElementById("total-amount").textContent = `$${total.toFixed(2)}`;

  const discountRow = document.getElementById("discount-row");
  const discountSpan = discountRow.querySelector("span:first-child");

  if (discountAmount !== 0) {
    discountRow.style.display = "flex";
    discountSpan.textContent = discountDescription + ":";
  } else {
    discountRow.style.display = "none";
    discountSpan.textContent = "Discount:";
  }
}

// Apply discount
function applyDiscount(discountType) {
  // Check if Buy 2 Get 1 Free can be applied
  if (discountType === "buy-two-get-one") {
    const totalItems = cartInstance.products.reduce(
      (sum, p) => sum + p.quantity,
      0
    );
    if (totalItems < 3) {
      alert(
        `You need at least 3 items to use "Buy 2 Get 1 Free". You currently have ${totalItems} item${
          totalItems === 1 ? "" : "s"
        }.`
      );
      return;
    }
  }

  currentDiscount = discountType;
  updateCartSummary();

  // Update button styles
  document
    .querySelectorAll(".discount-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
}

// Clear discount
function clearDiscount() {
  currentDiscount = null;
  updateCartSummary();
  document
    .querySelectorAll(".discount-btn")
    .forEach((btn) => btn.classList.remove("active"));
}

// Perform checkout
function performCheckout() {
  if (cartInstance.products.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.textContent = "Processing...";
  checkoutBtn.disabled = true;

  setTimeout(() => {
    showReceipt();
    cartInstance.products = [];
    currentDiscount = null;
    updateCartDisplay();
    checkoutBtn.textContent = "Proceed to Checkout";
    checkoutBtn.disabled = false;
  }, 2000);
}

// Show receipt modal
function showReceipt() {
  const modal = document.getElementById("receipt-modal");
  const receiptDate = document.getElementById("receipt-date");
  const receiptItems = document.getElementById("receipt-items");
  const receiptTotals = document.getElementById("receipt-totals");

  // Set current date
  const now = new Date();
  receiptDate.textContent = now.toLocaleString();

  // Generate receipt items
  let itemsHTML = "";
  const purchasedItems = [...cartInstance.products];
  purchasedItems.forEach((item) => {
    itemsHTML += `
              <div class="receipt-item">
                  <span class="item-name">${item.name}</span>
                  <span class="item-details">
                      ${item.quantity} x $${item.price.toFixed(2)} = $${(
      item.price * item.quantity
    ).toFixed(2)}
                  </span>
              </div>
          `;
  });
  receiptItems.innerHTML = itemsHTML;

  // Generate totals
  const subtotal = cartInstance.getTotal();
  let totalBeforeVAT = subtotal;
  let discountAmount = 0;
  let discountDescription = "";

  if (currentDiscount) {
    if (currentDiscount === "ten-percent") {
      totalBeforeVAT = tenPercentOff(subtotal);
      discountAmount = subtotal - totalBeforeVAT;
      discountDescription = "10% Off";
    } else if (currentDiscount === "buy-two-get-one") {
      totalBeforeVAT = buyTwoGetOneFree(subtotal, cartInstance.products);
      discountAmount = subtotal - totalBeforeVAT;
      const details = getBuyTwoGetOneFreeDetails(cartInstance.products);
      discountDescription = `Buy 2 Get 1 Free (${details.freeItems} free item${
        details.freeItems > 1 ? "s" : ""
      })`;
    }
  }

  const total = addVAT(totalBeforeVAT);
  const vatAmount = total - totalBeforeVAT;

  let totalsHTML = `
          <div class="receipt-total-line">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
          </div>
      `;

  if (discountAmount !== 0) {
    totalsHTML += `
              <div class="receipt-total-line discount-line">
                  <span>${discountDescription}:</span>
                  <span>-$${discountAmount.toFixed(2)}</span>
              </div>
          `;
  }

  totalsHTML += `
          <div class="receipt-total-line">
              <span>VAT (15%):</span>
              <span>+$${vatAmount.toFixed(2)}</span>
          </div>
          <div class="receipt-total-line final-total">
              <span>TOTAL:</span>
              <span>$${total.toFixed(2)}</span>
          </div>
      `;

  receiptTotals.innerHTML = totalsHTML;

  // Show modal
  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

// Close receipt modal
function closeReceipt() {
  const modal = document.getElementById("receipt-modal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  renderProducts();
  updateCartDisplay();
});
