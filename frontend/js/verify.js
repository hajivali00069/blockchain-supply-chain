document.addEventListener('DOMContentLoaded', () => {
    const verifyBtn = document.getElementById('verifyBtn');
    const productIdInput = document.getElementById('verifyProductId'); 
    const resultContainer = document.getElementById('verifyResult'); 

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
                        <div class="alert alert-danger text-center mt-4">
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
                            <div class="border-left pl-3 mb-3" style="border-left: 3px solid #28a745 !important; padding-left: 15px;">
                                <strong>📍 ${event.Location}</strong> - <span class="badge badge-info">${event.Status}</span><br>
                                <small class="text-muted">🕒 ${new Date(event.Timestamp).toLocaleString()}</small><br>
                                <small>🌡️ Temp: ${event.Temperature ? event.Temperature + '°C' : 'N/A'} | Lat: ${event.Latitude}, Lon: ${event.Longitude}</small>
                            </div>`;
                    });
                } else {
                    timelineHtml = '<p class="text-muted">No checkpoint history recorded yet.</p>';
                }

                resultContainer.innerHTML = `
                    <div class="card border-success mt-4" style="border: 1px solid #28a745; border-radius: 4px;">
                        <div class="card-header bg-success text-white" style="background-color: #28a745; color: white; padding: 10px 15px;">
                            🛡️ Official Authenticity Certificate
                        </div>
                        <div class="card-body" style="padding: 15px;">
                            <h5 class="card-title text-success" style="color: #28a745; margin-bottom: 15px;">✅ Verified Authentic Product</h5>
                            <p><strong>Product ID:</strong> ${data.product.ProductId}</p>
                            <p><strong>Product Name:</strong> ${data.product.Name}</p>
                            <p><strong>Batch Number:</strong> ${data.product.BatchNumber}</p>
                            <hr style="margin: 20px 0;">
                            <h6>📋 Supply Chain Journey Ledger:</h6>
                            <div class="mt-3">${timelineHtml}</div>
                        </div>
                    </div>`;

            } catch (error) {
                console.error(error);
                resultContainer.innerHTML = `
                    <div class="alert alert-danger mt-4">
                        Error communicating with the verification service. Please try again.
                    </div>`;
            }
        });
    }
});
