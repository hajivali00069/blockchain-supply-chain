# Blockchain-Based Supply Chain Transparency Platform

Clean, Azure-ready rebuild of the supply chain tracking project. Structured
so the frontend and backend can be deployed to separate Azure services.

## Folder structure

```
frontend/            → Plain HTML/CSS/JS. Deploy this to Azure Static Web Apps.
backend/local-server/  → Express server for local development/testing only.
backend/azure-functions/ → The real backend. Deploy this to an Azure Function App.
database/schema.sql  → Run this once against your Azure SQL Database to create tables.
docs/AZURE_INTEGRATION_GUIDE.md → Full step-by-step Azure setup + Phase 2 roadmap.
```

## Quick start (local testing, before touching Azure)

1. Create a SQL Server database locally or use a temporary Azure SQL Database.
2. Run `database/schema.sql` against it.
3. `cd backend/local-server`
4. `cp .env.example .env` and fill in your DB details.
5. `npm install`
6. `npm start` → API runs at `http://localhost:5000/api`
7. Open `frontend/index.html` in a browser (or serve it with any static server,
   e.g. VS Code "Live Server" extension) — it already points at
   `http://localhost:5000/api` in `frontend/js/config.js`.

## Deploying to Azure

See `docs/AZURE_INTEGRATION_GUIDE.md` for the full walkthrough:
Azure SQL Database → Azure Function App → Azure Static Web Apps → CORS → done.

## What's real vs. what's a placeholder right now

- **Real:** Products, Suppliers, Shipment tracking, QR-code-driven public
  verification — all backed by Azure SQL Database.
- **Placeholder (clearly marked with `TODO Phase 2` comments):**
  Azure Confidential Ledger (currently a local SHA-256 hash + mirror table
  standing in for it), Azure Blob Storage (QR codes/certs saved to local
  disk for now), Azure IoT Hub (shipment checkpoints are logged manually
  instead of by a simulated sensor).

These placeholders were a deliberate choice so you have a fully working app
end-to-end first, matching your guideline of "meet the basic objective with
recommended services before expanding." Swap them in Phase 2 - the doc in
`docs/` tells you exactly where.
