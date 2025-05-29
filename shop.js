// Product Factory Function
function Product(id, name, price, quantity = 1) {
  this.id = id;
  this.name = name;
  this.price = price;
  this.quantity = quantity;
}

// Cart Object
const Cart = {
  products: [],

  // Add product with quantity support
  addProduct(product) {
    const existing = this.products.find((p) => p.id === product.id);
    if (existing) {
      existing.quantity += product.quantity;
      console.log(`Updated quantity for: ${product.name}`);
    } else {
      this.products.push(product);
      console.log(`Added: ${product.name}`);
    }
  },

  // Remove a product by ID
  removeProduct(productId) {
    const index = this.products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      const [removed] = this.products.splice(index, 1);
      console.log(`Removed: ${removed.name}`);
    } else {
      console.log(`Product with ID ${productId} not found.`);
    }
  },

  // Calculate total price with optional discount/tax
  getTotal(callback) {
    const total = this.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    return callback ? callback(total, this.products) : total;
  },

  // Print cart summary
  printSummary() {
    console.log("Cart Summary:");
    this.products.forEach((p) =>
      console.log(
        `- ${p.name} x${p.quantity}: $${(p.price * p.quantity).toFixed(2)}`
      )
    );
    console.log(`Total (no discount): $${this.getTotal().toFixed(2)}`);
  },

  // Async checkout simulation
  checkout() {
    console.log("Processing checkout...");
    setTimeout(() => {
      console.log("✅ Checkout complete!");
      this.products = []; // Clear cart
    }, 2000); // simulate delay
  },
};

// Discount callback: 10% off
function tenPercentOff(total) {
  return total * 0.9;
}

// Applies a "Buy 2, Get 1 Free" discount with two priority rules:
// Same product - for every 3 of same product, 1 is free
// Mixed products - for remaining items, every 3 items makes cheapest free
function buyTwoGetOneFree(total, products) {
  let discountAmount = 0;
  const remainingItems = []; // Items left after same-product discounts

  // Apply same-product discounts (Priority 1)
  products.forEach((product, index) => {
    const freeItems = Math.floor(product.quantity / 3);
    const remainingQuantity = product.quantity - freeItems;

    if (freeItems > 0) {
      const sameProductDiscount = freeItems * product.price;
      discountAmount += sameProductDiscount;
      console.log(
        `Product ${index + 1} (Price: $${product.price}): ${
          product.quantity
        } items → ${freeItems} free, ${remainingQuantity} remaining`
      );
      console.log(
        `  Discount: ${freeItems} × $${product.price} = $${sameProductDiscount}`
      );
    } else {
      console.log(
        `Product ${index + 1} (Price: $${product.price}): ${
          product.quantity
        } items → 0 free, ${remainingQuantity} remaining`
      );
    }

    // Add remaining items to mixed discount pool
    for (let i = 0; i < remainingQuantity; i++) {
      remainingItems.push(product.price);
    }
  });

  // Apply mixed-product discounts (Priority 2)
  console.log(
    `Remaining items for mixed discount: [${remainingItems.join(", ")}]`
  );

  if (remainingItems.length >= 3) {
    // Sort remaining items from cheapest to most expensive
    remainingItems.sort((a, b) => a - b);

    const mixedGroupsOfThree = Math.floor(remainingItems.length / 3);
    console.log(`Mixed groups of 3: ${mixedGroupsOfThree}`);

    // Make the cheapest items free from mixed groups
    for (let i = 0; i < mixedGroupsOfThree; i++) {
      const freeItemPrice = remainingItems[i];
      discountAmount += freeItemPrice;
      console.log(
        `  Mixed group ${i + 1}: Cheapest item $${freeItemPrice} is free`
      );
    }
  } else {
    console.log(
      "Not enough remaining items for mixed discount (need at least 3)"
    );
  }

  console.log(`\n--- FINAL RESULT ---`);
  console.log(`Total discount applied: $${discountAmount.toFixed(2)}`);
  console.log(`Original total: $${total.toFixed(2)}`);
  console.log(`Final total: $${(total - discountAmount).toFixed(2)}`);

  return total - discountAmount;
}

// Tax callback: 15% VAT
function addVAT(total) {
  return total * 1.15;
}

// Add 23 products with quantity = 1 by default
const predefinedProducts = [
  new Product(1, "Wireless Mouse", 25.99),
  new Product(2, "Mechanical Keyboard", 89.99),
  new Product(3, "USB-C Cable", 12.49),
  new Product(4, '27" Monitor', 199.99),
  new Product(5, "Gaming Headset", 74.95),
  new Product(6, "Webcam HD", 45.0),
  new Product(7, "External Hard Drive 1TB", 59.99),
  new Product(8, "Laptop Stand", 29.5),
  new Product(9, "Bluetooth Speaker", 39.99),
  new Product(10, "Smartphone Case", 15.0),
  new Product(11, "Fitness Tracker", 49.99),
  new Product(12, "Portable Charger", 24.99),
  new Product(13, "LED Desk Lamp", 19.99),
  new Product(14, "Noise Cancelling Earbuds", 129.0),
  new Product(15, "HDMI Cable", 9.99),
  new Product(16, "Smart Thermostat", 199.95),
  new Product(17, "WiFi Router", 79.99),
  new Product(18, "Smart Watch", 149.99),
  new Product(19, "Ergonomic Chair", 299.0),
  new Product(20, "Standing Desk", 399.99),
  new Product(21, "USB Hub 4-Port", 18.49),
  new Product(22, "Laptop Backpack", 54.95),
  new Product(23, "Graphics Tablet", 119.99),
];

// Create cart instance and add products
const cart = Object.create(Cart);
predefinedProducts.forEach((p) => cart.addProduct(p));

// Remove a few for testing
cart.removeProduct(5);
cart.removeProduct(10);
cart.removeProduct(15);
cart.removeProduct(23);
cart.removeProduct(99); // does not exist

// Print full cart summary
cart.printSummary();

// Totals
console.log(
  `Total with 10% discount: $${cart.getTotal(tenPercentOff).toFixed(2)}`
);
console.log(`Total with B2G1: $${cart.getTotal(buyTwoGetOneFree).toFixed(2)}`);
console.log(`Total with VAT (15%): $${cart.getTotal(addVAT).toFixed(2)}`);

// Simulate checkout
cart.checkout();
