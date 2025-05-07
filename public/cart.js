const cartItemsContainer = document.getElementById("cart-items");
const totalDisplay = document.getElementById("total");
const placeOrderBtn = document.getElementById("place-order");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <h4>${item.name}</h4>
      <p>Price: ₹${item.price}</p>
      <label>Qty:
        <input type="number" value="${item.qty}" min="1" data-index="${index}" class="qty-input">
      </label>
      <p>Subtotal: ₹${subtotal}</p>
      <button onclick="removeItem(${index})">Remove</button>
      <hr>
    `;

    cartItemsContainer.appendChild(div);
  });

  totalDisplay.textContent = `Total: ₹${total}`;
  return total; // Return total for later use
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

cartItemsContainer.addEventListener("input", (e) => {
  if (e.target.classList.contains("qty-input")) {
    const index = e.target.dataset.index;
    const newQty = parseInt(e.target.value);
    if (newQty > 0) {
      cart[index].qty = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  }
});

placeOrderBtn.addEventListener("click", async () => {
  if (cart.length === 0) return alert("Your cart is empty!");

  const total = renderCart(); // Get updated total
  const res = await fetch("/place-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: cart, total }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("Order placed successfully!");
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  } else {
    alert(data.error || "Something went wrong. Try again.");
  }
});

renderCart();

// Function to handle the theme toggle
document.getElementById("theme-toggle").addEventListener("change", function () {
  document.body.classList.toggle("dark-mode", this.checked);
});