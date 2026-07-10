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

            // Clear previous screen states before starting a new request
            resultContainer.innerHTML = '<div class="text-center mt-4"><div class="spinner-border text-primary" role="status"></div></div>';

            try {
                // Evaluated route matching backend schema: verify/{productId}
                const response = await fetch(`${API_BASE_URL}/verify/${productId}`);
                
                if (response.status === 404) {
                    resultContainer.innerHTML = `
                        <div class="alert alert-danger text-center mt-4">
                            ❌ Product NOT Found or Fake! This item is not registered in the official ledger.
                        </div>`;
                    return;
                }

                const data = await response.json();
                
                // Build the historical tracking timeline steps string
                let timelineHtml = '';
                if (data.history && data.history.length > 0) {
                    data.history.forEach(event => {
                        timelineHtml += `
                            <div class="mb-3" style="border-left: 3px solid #28a745; padding-left: 15px; margin-left: 5px;">
                                <strong>📍 ${event.Location}</strong> - <span class="badge badge-info">${event.Status}</span><br>
                                <small class="text-muted">🕒 ${new Date(event.Timestamp).toLocaleString()}</small><br>
                                <small class="text-secondary">🌡️ Temp: ${event.Temperature ? event.Temperature + '°C' : 'N/A'} | Lat: ${event.Latitude}, Lon: ${event.Longitude}</small>
                            </div>`;
                    });
                } else {
                    timelineHtml = '<p class="text-muted">No checkpoint history recorded yet.</p>';
                }

                // Inject the structured certificate template layout card
                resultContainer.innerHTML = `
                    <div class="card border-success mt-4 shadow-sm" style="border: 1px solid #28a745; border-radius: 6px; background-color: #fff;">
                        <div class="card-header bg-success text-white font-weight-bold" style="background-color: #28a745; color: #fff; padding: 12px 20px;">
                            🛡️ Official Authenticity Certificate
                        </div>
                        <div class="card-body" style="padding: 20px;">
                            <div class="d-flex justify-content-between align-items-start flex-wrap" style="gap: 20px;">
                                <div>
                                    <h5 class="card-title text-success font-weight-bold" style="color: #28a745; margin-bottom: 15px;">✅ Verified Authentic Product</h5>
                                    <p class="mb-2"><strong>Product ID:</strong> ${data.product.ProductId}</p>
                                    <p class="mb-2"><strong>Product Name:</strong> ${data.product.Name}</p>
                                    <p class="mb-2"><strong>Batch Number:</strong> ${data.product.BatchNumber}</p>
                                    <p class="mb-0"><strong>Total Verified Ledger Events:</strong> <span class="badge badge-success">${data.verifiedEvents}</span></p>
                                </div>
                                <!-- QR Element Node -->
                                <div class="text-center bg-light p-2 border rounded" style="min-width: 140px;">
                                    <div id="qrcode" class="d-inline-block" style="padding: 5px; background: #fff;"></div>
                                    <small class="text-muted d-block mt-1" style="font-size: 11px; font-weight: 500;">Scan to Authenticate</small>
                                </div>
                            </div>
                            <hr style="margin: 20px 0;">
                            <h6 class="font-weight-bold text-dark mb-3">📋 Supply Chain Journey Ledger:</h6>
                            <div class="mt-2">${timelineHtml}</div>
                        </div>
                    </div>`;

                // Calculate current page web URL to anchor tracking QR data
                const currentUrl = window.location.href.split('?')[0]; 
                const verificationLink = `${currentUrl}?id=${data.product.ProductId}`;

                // Instantiate QR Canvas renderer onto screen element container
                new QRCode(document.getElementById("qrcode"), {
                    text: verificationLink,
                    width: 110,
                    height: 110,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });

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
