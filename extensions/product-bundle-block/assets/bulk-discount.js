// 💥 Update Discount Table
document.addEventListener('DOMContentLoaded', () => {
  const unitPriceElement = document.getElementById('product-unit-price');
  const baseUnitPrice = parseFloat(unitPriceElement?.dataset?.price || '0');

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  }

  document.querySelectorAll('#discount-rules tr').forEach(row => {
    const cell = row.querySelector('.discounted-price');
    if (!cell || !cell.dataset) return;
    const percent = parseFloat(cell.dataset.percent || '0');

    const quantityCell = row.querySelector('td');
    const quantityRange = quantityCell ? quantityCell.textContent.trim() : '';

    const match = quantityRange.match(/^(\d+)(?:[-–—](\d+)|\+)?$/);
    if (!match) {
      cell.textContent = '-';
      return;
    }

    const fromQty = parseInt(match[1], 10);
    const toQty = match[2] ? parseInt(match[2], 10) : fromQty;

    const usedQty = match[2] ? toQty : fromQty;

    if (!isNaN(percent) && baseUnitPrice > 0) {
      const discountedUnit = +(baseUnitPrice * (1 - percent / 100)).toFixed(2);
      const totalPrice = +(discountedUnit * usedQty).toFixed(2);
      // cell.textContent = `${formatCurrency(totalPrice)} (${formatCurrency(discountedUnit)} each)`;
      cell.textContent = `${formatCurrency(discountedUnit)} each`;
    } else {
      cell.textContent = '-';
    }
  });
});

// document.addEventListener('DOMContentLoaded', function () {
//   const modal = document.getElementById('knowMoreModal');
//   const trigger = document.querySelector('.know-more-btn');
//   if (!modal || !trigger) return;
//   const closeBtn = modal.querySelector('.close');

//   if (!closeBtn) return;

//   trigger.addEventListener('click', function () {
//     modal.style.display = 'block';
//   });

//   closeBtn.addEventListener('click', function () {
//     modal.style.display = 'none';
//   });

//   window.addEventListener('click', function (event) {
//     if (event.target === modal) {
//       modal.style.display = 'none';
//     }
//   });
// });


document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('knowMoreModal');
  const trigger = document.querySelector('.know-more-btn');

  if (!modal || !trigger) return;

  const closeBtn = modal.querySelector('.close');
  if (!closeBtn) return;

  trigger.addEventListener('click', function () {
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});
