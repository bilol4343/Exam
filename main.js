const productsContainer = document.getElementById("products");
const categoriesContainer = document.getElementById("categories");
const filterButtons = document.querySelectorAll(".filter-buttons button");
const cartCounter = document.getElementById("cart-counter");
const cartItems = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Chegirma foizi
const DISCOUNT_PERCENT = 24;

function updateCartCounter() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if(cartCounter) cartCounter.textContent = `Cart (${totalQty})`;
}

function displayProducts(products) {
    if(!productsContainer) return;
    productsContainer.innerHTML = "";

    products.forEach(product => {
        // Narxni chegirma bilan hisoblash
        const discountedPrice = (product.price * (1 - DISCOUNT_PERCENT/100)).toFixed(2);

        const card = document.createElement("div");
        card.classList.add("product-card");
        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" />
            <div class="product-title">${product.title}</div>
            <div class="price-box">
                <span class="old-price">$${product.price.toFixed(2)}</span>
                <span class="new-price">$${discountedPrice}</span>
            </div>
            <button class="add-to-cart">Add to Cart</button>
            <button class="show-btn">Show</button>
        `;
        productsContainer.appendChild(card);

        // Add to Cart
        card.querySelector(".add-to-cart").addEventListener("click", () => {
            const exist = cart.find(item => item.id === product.id);
            if(exist) exist.qty += 1;
            else cart.push({...product, qty:1, price: parseFloat(discountedPrice)});
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCounter();
        });

        // Show button
        card.querySelector(".show-btn").addEventListener("click", () => {
            alert(
                `Title: ${product.title}\n` +
                `Original Price: $${product.price.toFixed(2)}\n` +
                `Discount: ${DISCOUNT_PERCENT}%\n` +
                `Price after discount: $${discountedPrice}\n` +
                `Category: ${product.category}\n` +
                `Description: ${product.description}`
            );
        });
    });
}

function displayCategories(products) {
    if(!categoriesContainer) return;
    const categories = [...new Set(products.map(p => p.category))];
    categoriesContainer.innerHTML = "";
    categories.forEach(cat => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.textContent = cat.toUpperCase();
        card.dataset.category = cat.toLowerCase();
        categoriesContainer.appendChild(card);

        card.addEventListener("click", () => {
            const filtered = products.filter(p => p.category.toLowerCase() === cat.toLowerCase());
            displayProducts(filtered);
        });
    });
}

function renderCart() {
    if(!cartItems) return;
    cartItems.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${item.image}" class="cart-img"/> ${item.title}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <button class="minus" data-id="${item.id}">−</button>
                <span>${item.qty}</span>
                <button class="plus" data-id="${item.id}">+</button>
            </td>
            <td>$${(item.price*item.qty).toFixed(2)}</td>
        `;
        cartItems.appendChild(tr);
        subtotal += item.price * item.qty;
    });

    const shipping = 5;
    const discount = 0;
    const total = subtotal + shipping - discount;

    if(subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if(shippingEl) shippingEl.textContent = shipping.toFixed(2);
    if(discountEl) discountEl.textContent = discount.toFixed(2);
    if(totalEl) totalEl.textContent = total.toFixed(2);

    document.querySelectorAll(".plus").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const prod = cart.find(p => p.id === id);
            prod.qty += 1;
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
            updateCartCounter();
        });
    });
    document.querySelectorAll(".minus").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const prod = cart.find(p => p.id === id);
            prod.qty -= 1;
            if(prod.qty <= 0) cart = cart.filter(p => p.id !== id);
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
            updateCartCounter();
        });
    });
}

// Fetch products and initialize
if(productsContainer) {
    fetch("https://fakestoreapi.com/products")
        .then(res => res.json())
        .then(data => {
            displayProducts(data);
            displayCategories(data);

            filterButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    const filter = btn.dataset.filter.toLowerCase();
                    if(filter === "all") displayProducts(data);
                    else displayProducts(data.filter(p => p.category.toLowerCase() === filter));
                });
            });
        })
        .catch(err => console.error("API fetch error:", err));
}

updateCartCounter();
renderCart();
