const ORDER_KEY = 'charCafeOrder';
let order = [];

function loadOrder() {
    try {
        order = JSON.parse(localStorage.getItem(ORDER_KEY)) || [];
    } catch (e) {
        console.error('Failed to load order from localStorage:', e);
        order = [];
    }
}

function saveOrder() {
    try {
        localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch (e) {
        console.error('Failed to save order to localStorage:', e);
    }
}

function addToOrder(name, price) {
    const existing = order.find(function (item) { return item.name === name; });

    if (existing) {
        existing.qty += 1;
    } else {
        order.push({ name: name, price: price, qty: 1 });
    }

    clearOrderMessage();
    saveOrder();
    renderOrder();
}

function changeQty(index, amount) {
    order[index].qty += amount;

    if (order[index].qty <= 0) {
        order.splice(index, 1);
    }

    saveOrder();
    renderOrder();
}

function removeFromOrder(index) {
    order.splice(index, 1);
    saveOrder();
    renderOrder();
}

function makeButton(label, className, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = className;
    btn.addEventListener('click', onClick);
    return btn;
}

function renderOrder() {
    const list = document.getElementById('orderList');
    const total = document.getElementById('orderTotal');
    const empty = document.getElementById('orderEmpty');
    const placeBtn = document.getElementById('placeOrderBtn');
    let sum = 0;

    list.innerHTML = '';

    order.forEach(function (item, i) {
        sum += item.price * item.qty;

        const li = document.createElement('li');

        const name = document.createElement('span');
        name.className = 'order-name';
        name.textContent = item.name;

        const qty = document.createElement('span');
        qty.className = 'order-qty';
        qty.appendChild(makeButton('−', 'qty-btn', function () { changeQty(i, -1); }));

        const count = document.createElement('span');
        count.textContent = item.qty;
        qty.appendChild(count);

        qty.appendChild(makeButton('+', 'qty-btn', function () { changeQty(i, 1); }));

        const line = document.createElement('span');
        line.className = 'order-line';
        line.textContent = '₱' + (item.price * item.qty);

        const remove = makeButton('✕', 'remove-btn', function () { removeFromOrder(i); });
        remove.setAttribute('aria-label', 'Remove ' + item.name);

        li.appendChild(name);
        li.appendChild(qty);
        li.appendChild(line);
        li.appendChild(remove);
        list.appendChild(li);
    });

    total.textContent = '₱' + sum;
    empty.style.display = order.length === 0 ? 'block' : 'none';
    placeBtn.disabled = order.length === 0;
}

function placeOrder() {
    if (order.length === 0) {
        return;
    }

    const message = document.getElementById('orderMessage');
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const sum = order.reduce(function (acc, item) { return acc + item.price * item.qty; }, 0);
    const count = order.reduce(function (acc, item) { return acc + item.qty; }, 0);

    message.textContent = 'Thank you! Order #' + orderNumber + ' (' + count + ' item' + (count > 1 ? 's' : '') + ', ₱' + sum + ') has been placed. Please pay at the counter.';
    message.className = 'order-message success';

    order = [];
    saveOrder();
    renderOrder();
}

function clearOrderMessage() {
    const message = document.getElementById('orderMessage');
    message.textContent = '';
    message.className = 'order-message';
}


const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (FORM_ENDPOINT.indexOf('YOUR_FORM_ID') !== -1) {
        formStatus.textContent = 'The form is not connected yet. Add your Formspree link in script.js.';
        formStatus.className = 'form-status error';
        return;
    }

    formStatus.textContent = 'Sending...';
    formStatus.className = 'form-status';

    try {
        const response = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            formStatus.textContent = 'Message sent! We will get back to you soon.';
            formStatus.className = 'form-status success';
            contactForm.reset();
        } else {
            formStatus.textContent = 'Something went wrong. Please try again.';
            formStatus.className = 'form-status error';
        }
    } catch (error) {
        formStatus.textContent = 'Could not send. Check your internet connection.';
        formStatus.className = 'form-status error';
    }
});

loadOrder();
renderOrder();