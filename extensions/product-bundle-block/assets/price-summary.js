document.addEventListener('DOMContentLoaded', () => {
    const unitPriceElement = document.getElementById('product-unit-price');
    const baseUnitPrice = parseFloat(unitPriceElement?.dataset?.price || '0');

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    }

    const jsonScript = document.getElementById('bulk-discount-data');
    let rules = [];

    if (jsonScript) {
        try {
            const parsed = JSON.parse(jsonScript.textContent);
            rules = parsed.map(entry => {
                const rangeMatch = entry.range.match(/^(\d+)\D+(\d+|\+)?$/);
                const percent = parseInt(entry.percent, 10);
                if (!rangeMatch) return null;
                const from = parseInt(rangeMatch[1], 10);
                const to = rangeMatch[2] === '+' ? Infinity : parseInt(rangeMatch[2], 10);
                return { from, to, percent };
            }).filter(Boolean);
        } catch (err) {
            console.error('Invalid discount rules JSON:', err);
        }
    }

    async function updateDiscountUI() {
        try {
            const res = await fetch('/cart.js');
            const cart = await res.json();

            const totalQty = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            const originalPrice = cart.items.reduce((sum, item) => sum + item.original_line_price, 0) / 100;

            let discountPercent = 0;
            for (const rule of rules) {
                if (totalQty >= rule.from && totalQty <= rule.to) {
                    discountPercent = rule.percent;
                    break;
                }
            }

            const discountAmount = +(originalPrice * discountPercent / 100).toFixed(2);
            const finalPrice = +(originalPrice - discountAmount).toFixed(2);

            document.getElementById('original-price').textContent = formatCurrency(originalPrice);
            document.getElementById('discount-amount').textContent = discountPercent > 0
                ? `- ${formatCurrency(discountAmount)}`
                : '-';
            document.getElementById('final-price').textContent = formatCurrency(finalPrice);

            if (discountPercent > 0) {
                // const discountCode = await fetch(`/apps/myapp/generate-discount?percent=${discountPercent}`)
                const discountCode = await fetch(`/apps/bulk-discount/generate-discount?percent=${discountPercent}`)
                    .then(res => res.text());

                attachCheckoutRedirect(discountCode);
            }
        } catch (err) {
            console.error('Failed to update discount UI:', err);
        }
    }

    function attachCheckoutRedirect(discountCode) {
        const checkoutForm = document.querySelector('form[action="/checkout"]');
        if (checkoutForm && !checkoutForm.classList.contains('bulk-discount-applied')) {
            checkoutForm.classList.add('bulk-discount-applied');

            checkoutForm.addEventListener('submit', function (e) {
                e.preventDefault();
                window.location.href = `/discount/${discountCode}?redirect=/checkout`;
            });
        }
    }

    updateDiscountUI();

    // Hook into fetch to update UI after cart changes
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const res = await originalFetch(...args);
        if (args[0].includes('/cart/add') || args[0].includes('/cart/change')) {
            setTimeout(updateDiscountUI, 300);
        }
        return res;
    };

    // Update UI after add-to-cart form submits
    document.querySelectorAll('form[action^="/cart/add"]').forEach(form => {
        form.addEventListener('submit', () => {
            setTimeout(updateDiscountUI, 300);
        });
    });
});
