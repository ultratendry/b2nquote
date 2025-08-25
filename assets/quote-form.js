// ...existing code...
fetch(url, options)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Check if response has content
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    } else {
      return Promise.resolve({});
    }
  })
  .then(data => {
    // ...existing code...
  })
  .catch(error => {
    console.error('AJAX Error:', error);
    // ...existing code...
  });
// ...existing code...