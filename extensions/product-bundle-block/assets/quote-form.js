document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('quote-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch('/apps/b2bdiscount/submit-quote', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Quote submitted successfully!');
        form.reset();
      } else {
        alert('⚠️ Failed: ' + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error('❌ AJAX Error:', err);
      alert('❌ Failed to submit quote');
    }
  });
});


