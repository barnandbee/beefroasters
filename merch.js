/* Merch preorder cart. Reads products from the .product cards in merch.html,
 * keeps the cart in localStorage (best effort) and sends the preorder as a
 * pre-filled email to SITE.email (set in script.js).
 */
(function merch() {
  const POSTAGE = 10; // PLACEHOLDER: flat postage within Australia, AUD
  const STORE_KEY = "br-preorder-v1";
  const money = (n) => `$${n.toFixed(2)}`;

  const products = {};
  let cart = [];

  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    if (Array.isArray(saved)) cart = saved;
  } catch (_) { /* storage unavailable: start empty */ }

  const save = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (_) { /* ignore */ }
  };

  /* ---------- Build controls on each product card ---------- */
  document.querySelectorAll(".product").forEach((card) => {
    const { id, name, price, sizes } = card.dataset;
    products[id] = { name, price: Number(price) };

    const body = card.querySelector(".product-body");
    const buy = document.createElement("div");
    buy.className = "product-buy";

    const priceEl = document.createElement("span");
    priceEl.className = "product-price";
    priceEl.textContent = `$${Number(price)}`;
    buy.append(priceEl);

    let select = null;
    if (sizes) {
      const label = document.createElement("label");
      label.className = "sr-only";
      label.htmlFor = `size-${id}`;
      label.textContent = `Size for ${name}`;
      select = document.createElement("select");
      select.id = `size-${id}`;
      select.className = "size-select";
      const ph = new Option("Size", "");
      ph.disabled = true;
      ph.selected = true;
      select.append(ph, ...sizes.split(",").map((s) => new Option(s, s)));
      buy.append(label, select);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-small";
    btn.textContent = "Add to preorder";
    buy.append(btn);

    const msg = document.createElement("p");
    msg.className = "product-msg";
    msg.setAttribute("aria-live", "polite");

    body.append(buy, msg);

    btn.addEventListener("click", () => {
      const size = select ? select.value : "";
      if (select && !size) {
        msg.textContent = "Pick a size first.";
        select.focus();
        return;
      }
      const line = cart.find((l) => l.id === id && l.size === size);
      if (line) line.qty = Math.min(line.qty + 1, 20);
      else cart.push({ id, size, qty: 1 });
      save();
      render();
      msg.textContent = `Added${size ? ` (${size})` : ""}. ${line ? `You now have ${line.qty}.` : ""}`;
      btn.textContent = "Added ✓";
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.textContent = "Add to preorder"; msg.textContent = ""; }, 2200);
    });
  });

  // Drop anything saved for products that no longer exist
  cart = cart.filter((l) => products[l.id] && l.qty > 0);

  /* ---------- Cart rendering ---------- */
  const list = document.getElementById("cart-list");
  const empty = document.getElementById("cart-empty");
  const totals = document.getElementById("cart-totals");
  const fab = document.getElementById("cart-fab");
  const form = document.getElementById("preorder-form");

  const isPost = () => form.elements.delivery.value === "post";

  function sums() {
    const count = cart.reduce((n, l) => n + l.qty, 0);
    const subtotal = cart.reduce((n, l) => n + l.qty * products[l.id].price, 0);
    const delivery = count && isPost() ? POSTAGE : 0;
    return { count, subtotal, delivery, total: subtotal + delivery };
  }

  function render() {
    list.replaceChildren();
    cart.forEach((l, i) => {
      const p = products[l.id];
      const li = document.createElement("li");
      li.className = "cart-line";

      const img = document.createElement("img");
      img.src = `images/merch/${l.id}.svg`;
      img.alt = "";
      img.width = 56;
      img.height = 56;

      const info = document.createElement("div");
      info.className = "cart-info";
      const nm = document.createElement("b");
      nm.textContent = p.name;
      const meta = document.createElement("span");
      meta.textContent = `${l.size ? `Size ${l.size} · ` : ""}${money(p.price)} each`;
      info.append(nm, meta);

      const qty = document.createElement("div");
      qty.className = "qty";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", `One fewer ${p.name}`);
      const val = document.createElement("span");
      val.textContent = l.qty;
      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", `One more ${p.name}`);
      qty.append(minus, val, plus);

      const line = document.createElement("span");
      line.className = "cart-line-total";
      line.textContent = money(l.qty * p.price);

      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "cart-remove";
      rm.textContent = "Remove";

      minus.addEventListener("click", () => { l.qty -= 1; if (l.qty <= 0) cart.splice(i, 1); save(); render(); });
      plus.addEventListener("click", () => { l.qty = Math.min(l.qty + 1, 20); save(); render(); });
      rm.addEventListener("click", () => { cart.splice(i, 1); save(); render(); });

      li.append(img, info, qty, line, rm);
      list.append(li);
    });

    const s = sums();
    empty.hidden = s.count > 0;
    totals.hidden = s.count === 0;
    document.getElementById("cart-subtotal").textContent = money(s.subtotal);
    document.getElementById("cart-delivery").textContent = s.delivery ? money(s.delivery) : "Free";
    document.getElementById("cart-total").textContent = money(s.total);

    fab.hidden = s.count === 0;
    document.getElementById("cart-fab-count").textContent = `${s.count} item${s.count === 1 ? "" : "s"}`;
    document.getElementById("cart-fab-total").textContent = money(s.total);
  }

  /* ---------- Delivery toggle ---------- */
  const addressField = document.getElementById("address-field");
  form.querySelectorAll('input[name="delivery"]').forEach((r) =>
    r.addEventListener("change", () => {
      addressField.hidden = !isPost();
      render();
    })
  );

  /* ---------- Submit -> mailto ---------- */
  const err = document.getElementById("po-error");
  const sent = document.getElementById("po-sent");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    err.textContent = "";
    sent.hidden = true;
    const f = form.elements;
    [f.name, f.email, f.address].forEach((el) => el.removeAttribute("aria-invalid"));

    if (!cart.length) {
      err.textContent = "Your preorder is empty. Add something from the range first.";
      document.getElementById("products").scrollIntoView();
      return;
    }
    const required = [f.name, f.email];
    if (isPost()) required.push(f.address);
    const missing = required.filter((el) => !el.value.trim());
    if (missing.length) {
      missing.forEach((el) => el.setAttribute("aria-invalid", "true"));
      err.textContent = isPost()
        ? "Please fill in your name, email and postal address."
        : "Please fill in your name and email.";
      missing[0].focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) {
      f.email.setAttribute("aria-invalid", "true");
      err.textContent = "That email address doesn't look right.";
      f.email.focus();
      return;
    }

    const s = sums();
    const lines = cart.map((l) => {
      const p = products[l.id];
      return `- ${l.qty} x ${p.name}${l.size ? ` (size ${l.size})` : ""}: ${money(l.qty * p.price)}`;
    });
    const body = [
      "Hi Beef Roasters, I'd like to preorder:",
      "",
      ...lines,
      "",
      `Subtotal: ${money(s.subtotal)}`,
      `Delivery: ${isPost() ? `Post within Australia (${money(s.delivery)})` : "Pick up in Olinda (free)"}`,
      `Total: ${money(s.total)} AUD`,
      "",
      `Name: ${f.name.value.trim()}`,
      `Email: ${f.email.value.trim()}`,
      f.phone.value.trim() ? `Phone: ${f.phone.value.trim()}` : null,
      isPost() ? `Postal address:\n${f.address.value.trim()}` : null,
      f.notes.value.trim() ? `\nNotes: ${f.notes.value.trim()}` : null,
    ].filter((x) => x !== null).join("\n");

    const subject = `[Merch preorder] ${f.name.value.trim()}, ${s.count} item${s.count === 1 ? "" : "s"}`;
    window.location.href =
      `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    sent.hidden = false;
  });

  render();
})();
