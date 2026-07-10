document.addEventListener('DOMContentLoaded', () => {
    const verifyBtn = document.getElementById('verifyBtn');
    const productIdInput = document.getElementById('productId');
    const resultContainer = document.getElementById('resultContainer');

    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            const productId = productIdInput.value.trim();
            if (!productId) {
                alert('Please enter a Product ID');
                return;
            }

            try {
                // Call your Azure Function API via your config/api helper
                const response = await fetch(`${API_BASE_URL}/verifyProduct?productId=${productId}`);
                
                if (response.status === 404) {
                    resultContainer.innerHTML = `
                        <div class="alert alert-danger text-center">
                            ❌ Product NOT Found or Fake! This item is not registered in the official ledger.
                        </div>`;
                    return;
                }

                const data = await response.json();
                
                // Render the Verification Certificate Card
                let timelineHtml = '';
                if (data.history && data.history.length > 0) {
                    data.history.forEach(event => {
                        timelineHtml += `
                            <div class="border-left pl-3 mb-3">
                                <strong>📍 ${event.Location}</strong> - <span class="badge badge-info">${event.Status}</span><br>
                                <small class="text-muted">🕒 ${new Date(event.Timestamp).toLocaleString()}</small><br>
                                <small>🌡️ Temp: ${event.Temperature ? event.Temperature + '°C' : 'N/A'} | Lat: ${event.Latitude}, Lon: ${event.Longitude}</small>
                            </div>`;
                    });
                } else {
                    timelineHtml = '<p class="text-muted">No checkpoint history recorded yet.</p>';
                }

                resultContainer.innerHTML = `
                    <div class="card border-success mt-4">
                        <div class="card-header bg-success text-white">
                            🛡️ Official Authenticity Certificate
                        </div>
                        <div class="card-body">
                            <h5 class="card-title text-success">✅ Verified Authentic Product</h5>
                            <p><strong>Product ID:</strong> ${data.product.ProductId}</p>
                            <p><strong>Product Name:</strong> ${data.product.Name}</p>
                            <p><strong>Batch Number:</strong> ${data.product.BatchNumber}</p>
                            <hr>
                            <h6>📋 Supply Chain Journey Ledger:</h6>
                            <div class="mt-3">${timelineHtml}</div>
                        </div>
                    </div>`;

            } catch (error) {
                console.error(error);
                resultContainer.innerHTML = `
                    <div class="alert alert-danger">
                        Error communicating with the verification service. Please try again.
                    </div>`;
            }
        });
    }
});