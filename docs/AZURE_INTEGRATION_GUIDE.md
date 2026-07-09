# Azure Integration Guide

## Phase 1 - Get the basic objective live (what you're doing right now)

1. **Azure SQL Database**
   - Create a SQL Database (Basic tier) + its server.
   - Server → Networking → enable "Allow Azure services and resources to access this server."
   - Database → Query editor → paste and run `database/schema.sql`.

2. **Azure Function App**
   - Create a Function App, runtime = Node.js, plan = Consumption.
   - From `backend/azure-functions`: `npm install`, then
     `func azure functionapp publish <your-function-app-name>`
   - Function App → Configuration → Application settings → add:
     `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PUBLIC_VERIFY_BASE_URL`

3. **Azure Static Web App**
   - Create it from GitHub, pointing at the repo/branch containing this project.
   - App location: `/frontend`, Api location: (blank), Output location: (blank)

4. **Connect the two**
   - Function App → CORS → add your Static Web App's URL.
   - Edit `frontend/js/config.js` → set `API_BASE_URL` to your Function App's
     URL + `/api`. Commit + push to redeploy the Static Web App.

5. **Cost Management**
   - Set a budget + alert now, before moving on.

At the end of Phase 1 you have: a live site, a real database, and a real
serverless backend - the "basic objective" bar from your guidelines.

## Phase 2 - Swap placeholders for the real recommended services

| Placeholder today | Replace with | Where in the code |
|---|---|---|
| SHA-256 hash stored in `LedgerEntries` table | Azure Confidential Ledger | `backend/azure-functions/src/shared/ledger.js` - `recordEvent()` |
| QR codes / certificates on local disk | Azure Blob Storage | `backend/local-server/services/qrService.js` (add a Blob-backed function equivalent) |
| Manual shipment checkpoint form | Azure IoT Hub + a simulated device script | `backend/azure-functions/src/functions/addShipmentEvent.js` - add an IoT Hub trigger function alongside the existing HTTP one |
| No login | Azure AD B2C | Add auth middleware in front of write routes (POST/PUT) |
| No secrets vault | Azure Key Vault | Replace `DB_PASSWORD` app setting with a Key Vault reference, access via Managed Identity |
| No monitoring | Azure Monitor / Application Insights | Enable Application Insights on the Function App (one checkbox) |

## Phase 3 - Extras from your problem statement

- Carbon footprint: compute in `updateProductStatus.js` from distance × transport-mode factor, store in `Products.CarbonFootprintKg`.
- Supplier analytics dashboard: point Power BI Desktop at the Azure SQL Database directly (no code changes needed).
- Shipping/logistics API + Logic Apps: trigger a Logic App from `addShipmentEvent` once a real carrier API is chosen.
