// ...existing code...
<form method="post" action="/quote">
  {/* ...existing form fields... */}
  <input type="hidden" name="product_title" value={product.title} />
  <input type="hidden" name="product_image" value={product.image} />
  {/* ...existing form fields... */}
  <button type="submit">Submit Quote</button>
</form>
// ...existing code...