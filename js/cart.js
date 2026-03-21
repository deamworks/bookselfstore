// cart.js — Bookself Store

// โหลด Font Awesome อัตโนมัติ
(function() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement("link");
        link.rel  = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
        document.head.appendChild(link);
    }
})();

const CART_KEY = "bookself_cart";

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch { return {}; }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(bookId, bookName, price, qty = 1) {
    const cart = getCart();
    if (cart[bookId]) { cart[bookId].qty += qty; }
    else { cart[bookId] = { name: bookName, price: parseFloat(price), qty }; }
    saveCart(cart);
    showCartToast(bookName);
}

function removeFromCart(bookId) {
    const cart = getCart(); delete cart[bookId]; saveCart(cart);
}

function updateQty(bookId, delta) {
    const cart = getCart();
    if (!cart[bookId]) return;
    cart[bookId].qty += delta;
    if (cart[bookId].qty <= 0) delete cart[bookId];
    saveCart(cart);
}

function clearCart() { localStorage.removeItem(CART_KEY); updateCartBadge(); }

function getCartCount() {
    return Object.values(getCart()).reduce((s, i) => s + i.qty, 0);
}

function getCartTotal() {
    const cart = getCart();
    const subtotal = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
    const totalQty = getCartCount();
    const discount  = totalQty >= 5 ? subtotal * 0.10 : 0;
    const afterDisc = subtotal - discount;
    const vat       = afterDisc - (afterDisc / 1.07);
    return { subtotal, discount, vat, total: afterDisc, totalQty };
}

function updateCartBadge() {
    const count = getCartCount();
    document.querySelectorAll(".cart-badge-count").forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? "inline-flex" : "none";
    });
}

function getCartPath() {
    return window.location.pathname.includes('/bookpage/') ? '../cart.html' : 'cart.html';
}

function showCartToast(bookName) {
    let toast = document.getElementById("cartToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "cartToast";
        toast.style.cssText = "position:fixed;bottom:24px;right:24px;background:#2e7d32;color:white;padding:12px 20px;border-radius:10px;font-family:'Prompt',sans-serif;font-size:14px;z-index:9999;opacity:0;transition:opacity 0.3s ease;max-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.2);";
        document.body.appendChild(toast);
    }
    const short = bookName.length > 25 ? bookName.substring(0, 25) + "..." : bookName;
    toast.innerHTML = `✅ เพิ่ม "${short}" แล้ว &nbsp;<a href="${getCartPath()}" style="color:#a5d6a7;font-size:13px;">ดูตะกร้า →</a>`;
    toast.style.opacity = "1";
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = "0"; }, 3000);
}

function injectCartIcon() {
    document.querySelectorAll(".menu").forEach(menu => {
        if (menu.querySelector(".cart-nav-item")) return;
        const li = document.createElement("li");
        li.className = "cart-nav-item";
        li.innerHTML = `
            <a href="${getCartPath()}" style="
                position:relative; display:inline-flex;
                align-items:center; color:#fff;
                text-decoration:none; padding:0 4px;">
                <i class="fa-solid fa-cart-shopping" style="color:#fff; font-size:18px;"></i>
                <span class="cart-badge-count" style="
                    position:absolute; top:-8px; right:-10px;
                    background:#fceaca; color:#7c2220;
                    font-size:11px; font-weight:700;
                    min-width:18px; height:18px;
                    border-radius:9px; padding:0 4px;
                    display:none; align-items:center;
                    justify-content:center;
                    font-family:'Prompt',sans-serif;
                ">0</span>
            </a>`;
        const ref = menu.querySelector("#navContractItem") || menu.querySelector("#navUserItem");
        if (ref) menu.insertBefore(li, ref); else menu.appendChild(li);
    });
    updateCartBadge();
}

document.addEventListener("DOMContentLoaded", injectCartIcon);