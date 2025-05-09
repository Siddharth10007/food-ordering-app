// Global variables
let cart = [];

// Function to handle the theme toggle
  const toggle = document.getElementById("theme-toggle");
  const prefersDark = localStorage.getItem("theme") === "dark";

  if (prefersDark) {
    document.body.classList.add("dark-mode");
    if (toggle) toggle.checked = true;
  }

  if (toggle) {
    toggle.addEventListener("change", () => {
      if (toggle.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }

// Function to filter items based on type (Veg/Non-Veg)
function filterItems(type) {
  const allItems = document.querySelectorAll(".card");
  allItems.forEach(item => {
    if (type === "veg") {
      item.style.display = item.classList.contains("veg") ? "block" : "none";
    } else if (type === "non-veg") {
      item.style.display = item.classList.contains("non-veg") ? "block" : "none";
    } else {
      item.style.display = "block";
    }
  });
}

// Function to update the "Add to Cart" button
function updateCartButton(input) {
  const button = input.nextElementSibling;
  button.disabled = input.value === "0";
}

// Function to add item to cart
function addToCart(name, price) {
  const input = document.querySelector(`[data-name='${name}'] input`);
  const quantity = parseInt(input.value);
  if (quantity > 0) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex === -1) {
      cart.push({ name, price, qty: quantity });
    } else {
      cart[itemIndex].qty += quantity;
    }

    localStorage.setItem("cart", JSON.stringify(cart)); // 🔁 Save to localStorage
    alert(`${quantity} x ${name} added to cart!`);
    input.value = 0;
    input.nextElementSibling.disabled = true;

    updateCart(); // optional: reflect changes in sidebar
  }
}

// Function to update the cart display
function updateCart() {
  const orderList = document.getElementById("order-list");
  const orderItems = document.getElementById("order-items");
  const orderTotal = document.getElementById("order-total");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  orderList.innerHTML = "";
  orderItems.innerHTML = "";

  let totalAmount = 0;

  cart.forEach(item => {
    const listItem = document.createElement("li");
    listItem.innerText = `${item.name} x${item.qty} - ₹${item.price * item.qty}`;
    orderList.appendChild(listItem);

    const orderItem = document.createElement("li");
    orderItem.innerText = `${item.name} x${item.qty}`;
    orderItems.appendChild(orderItem);

    totalAmount += item.price * item.qty;
  });

  orderTotal.innerText = `Total: ₹${totalAmount}`;
}


// Function to update an order (just a placeholder, for future functionality)
function updateOrder() {
  alert("Order has been updated.");
}

// Function to cancel an order (just a placeholder, for future functionality)
function cancelOrder() {
  cart = [];
  updateCart();
  alert("Your order has been canceled.");
}

let currentOrderId = null;

// Fetch order history from backend
async function fetchOrderHistory() {
  const res = await fetch("/orders");
  const orders = await res.json();

  const historyList = document.getElementById("order-history-list");
  historyList.innerHTML = "";

  orders.forEach((order, index) => {
    const li = document.createElement("li");
    li.textContent = `Order#${index + 1} - ${new Date(order.placedAt).toLocaleString()}`;
    li.style.cursor = "pointer";
    li.onclick = () => showOrderDetails(order, index + 1);
    historyList.appendChild(li);
  });
}

// Show selected order details
function showOrderDetails(order, number) {
  currentOrderId = order._id;
  document.getElementById("order-details-section").style.display = "block";
  document.getElementById("order-title").textContent = `Order#${number} Details`;

  const list = document.getElementById("order-items");
  list.innerHTML = "";
  let total = 0;

  order.items.forEach(item => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - ₹${item.price} x 
      <input type="number" value="${item.qty}" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
      <button onclick="removeItem('${item.id}')">❌</button>
    `;
    list.appendChild(li);
  });

  document.getElementById("order-total").textContent = `Total: ₹${total}`;
}

// Remove item from order (UI only, updates on "Update" click)
function removeItem(id) {
  const input = document.querySelector(`input[data-id="${id}"]`);
  input.parentElement.remove();
}

// Update order with confirmation and ₹100 fee
document.getElementById("update-order").addEventListener("click", async () => {
  const inputs = document.querySelectorAll("#order-items input");
  let updatedItems = [];
  let total = 0;

  inputs.forEach(input => {
    const qty = parseInt(input.value);
    const name = input.dataset.name;
    const id = input.dataset.id;
    const price = parseFloat(input.dataset.price);
    if (qty > 0) {
      updatedItems.push({ id, name, price, qty });
      total += qty * price;
    }
  });

  total += 100; // Update fee
  const res = await fetch(`/orders/${currentOrderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: updatedItems })
  });

  const data = await res.json();
  alert(data.message + ` | New Total: ₹${total}`);
  fetchOrderHistory();
});

// Cancel order with confirmation and ₹100 cancel fee
document.getElementById("cancel-order").addEventListener("click", async () => {
  const confirmCancel = confirm("Cancel this order? ₹100 fee will be applied.");
  if (!confirmCancel) return;

  const res = await fetch(`/orders/${currentOrderId}`, { method: "DELETE" });
  const data = await res.json();
  alert(data.message);
  document.getElementById("order-details-section").style.display = "none";
  fetchOrderHistory();
});

// On page load
window.onload = fetchOrderHistory;



