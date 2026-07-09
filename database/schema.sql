-- ============================================================================
-- Blockchain-Based Supply Chain Transparency Platform
-- Azure SQL Database Schema
-- ============================================================================
-- Run this against your Azure SQL Database (Basic / Serverless tier) using
-- the Query Editor in the Azure Portal, Azure Data Studio, or SSMS.
-- ============================================================================

-- 1. SUPPLIERS
CREATE TABLE Suppliers (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    SupplierId    NVARCHAR(50)  NOT NULL UNIQUE,       -- business-facing id e.g. SUP-001
    SupplierName  NVARCHAR(150) NOT NULL,
    Email         NVARCHAR(150) NOT NULL UNIQUE,
    Phone         NVARCHAR(30)  NOT NULL,
    SupplierType  NVARCHAR(50)  NOT NULL,               -- Manufacturer / Distributor / Logistics
    Address       NVARCHAR(300) NOT NULL,
    Rating        DECIMAL(3,2)  NULL,                   -- for supplier performance analytics
    CreatedAt     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 2. PRODUCTS
CREATE TABLE Products (
    Id                INT IDENTITY(1,1) PRIMARY KEY,
    ProductId         NVARCHAR(50)  NOT NULL UNIQUE,    -- business-facing id e.g. PRD-004
    ProductName       NVARCHAR(150) NOT NULL,
    BatchNumber       NVARCHAR(100) NOT NULL,
    SupplierId        NVARCHAR(50)  NOT NULL FOREIGN KEY REFERENCES Suppliers(SupplierId),
    ManufacturingDate DATE          NOT NULL,
    ExpiryDate        DATE          NOT NULL,
    CertificateUrl    NVARCHAR(400) NULL,               -- Azure Blob Storage URL (Phase 2)
    QrCodeUrl         NVARCHAR(400) NULL,               -- Azure Blob Storage URL (Phase 2)
    Status            NVARCHAR(50)  NOT NULL DEFAULT 'Manufactured',
    LedgerTxId        NVARCHAR(200) NULL,               -- Azure Confidential Ledger transaction id (Phase 2)
    CarbonFootprintKg DECIMAL(10,2) NULL,                -- sustainability reporting
    CreatedAt         DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt         DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 3. SHIPMENTS / TRACKING EVENTS (fed by Azure IoT Hub in Phase 2)
CREATE TABLE ShipmentEvents (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    ProductId    NVARCHAR(50)  NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Location     NVARCHAR(200) NULL,                    -- human-readable location
    Latitude     DECIMAL(9,6)  NULL,
    Longitude    DECIMAL(9,6)  NULL,
    Temperature  DECIMAL(5,2)  NULL,                    -- simulated IoT sensor reading
    Status       NVARCHAR(50)  NOT NULL,                -- Manufactured/In Transit/Delivered/etc.
    RecordedAt   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 4. LEDGER ENTRIES (mirrors what gets written to Azure Confidential Ledger)
--    Keeping a local mirror lets the UI query history fast, while the
--    LedgerTransactionId proves the entry is independently verifiable on ACL.
CREATE TABLE LedgerEntries (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    ProductId           NVARCHAR(50)   NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    EventType           NVARCHAR(50)   NOT NULL,        -- Created/StatusChange/Verified
    EventData           NVARCHAR(MAX)  NOT NULL,        -- JSON snapshot of the record at event time
    RecordHash          NVARCHAR(128)  NOT NULL,        -- SHA-256 hash of EventData
    LedgerTransactionId NVARCHAR(200)  NULL,             -- returned by Azure Confidential Ledger
    CreatedAt           DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Helpful indexes
CREATE INDEX IX_Products_SupplierId ON Products(SupplierId);
CREATE INDEX IX_ShipmentEvents_ProductId ON ShipmentEvents(ProductId);
CREATE INDEX IX_LedgerEntries_ProductId ON LedgerEntries(ProductId);

-- ============================================================================
-- Sample seed data (optional - safe to delete)
-- ============================================================================
INSERT INTO Suppliers (SupplierId, SupplierName, Email, Phone, SupplierType, Address, Rating)
VALUES ('SUP-001', 'GreenLeaf Organics', 'contact@greenleaf.example', '9990001111', 'Manufacturer', '12 Farm Road, Anantapur, IN', 4.5);

INSERT INTO Products (ProductId, ProductName, BatchNumber, SupplierId, ManufacturingDate, ExpiryDate, Status)
VALUES ('PRD-001', 'Organic Turmeric Powder', 'BATCH-2026-01', 'SUP-001', '2026-06-01', '2027-06-01', 'Manufactured');
