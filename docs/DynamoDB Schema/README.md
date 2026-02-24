# E-Commerce Inventory Management System
## DynamoDB Schema & Index Design Documentation

---

## Table of Contents
1. Overview
2. Table 1: Products-table
3. Table 2: VendorInventory
4. Table 3: StockTransactions
5. Global Secondary Indexes (GSI)
6. Access Patterns
7. Data Model Relationships

---

## 1. Overview

### System Purpose
The Inventory Management System uses Amazon DynamoDB to manage product catalogs, inventory levels, and stock transactions for multiple vendors in an e-commerce platform.

### Database Architecture
- **Database Type:** Amazon DynamoDB (NoSQL)
- **Region:** Asia Pacific (Mumbai) - ap-south-1
- **Total Tables:** 3
- **Total GSIs:** 7
- **Billing Mode:** On-Demand (Pay-per-request)

### Key Design Decisions
1. **Composite Keys:** Used to support hierarchical data (Product → SKUs)
2. **GSIs:** Enable efficient querying by vendor, category, and stock levels
3. **Denormalization:** Some data duplicated across tables for read optimization
4. **Immutable Logs:** StockTransactions table never updates, only inserts

---

## 2. Table 1: Products-table

### Purpose
Stores product catalog information including name, description, pricing, and categorization.

### Primary Key Structure
| Key Type | Attribute Name | Data Type | Description |
|----------|---------------|-----------|-------------|
| Partition Key (PK) | product_id | String | Unique identifier (format: PROD-XXXXX) |

### Attributes
| Attribute Name | Data Type | Required | Description | Example |
|---------------|-----------|----------|-------------|---------|
| product_id | String | Yes | Primary key | "PROD-A1B2C" |
| vendor_id | String | Yes | Vendor who owns this product | "VENDOR-001" |
| product_name | String | Yes | Display name | "Wireless Headphones Pro" |
| description | String | No | Detailed product description | "Premium noise-canceling..." |
| category | String | Yes | Main category | "Electronics" |
| subcategory | String | No | Sub-category | "Audio" |
| brand | String | No | Brand name | "SoundMax" |
| base_price | Number | Yes | Base selling price | 89.99 |
| images | List | No | Array of S3 image URLs | ["https://s3.../img1.jpg"] |
| tags | List | No | Search/filter tags | ["wireless", "audio"] |
| is_active | Boolean | Yes | Product active status | true |
| created_at | String | Yes | ISO 8601 timestamp | "2026-02-23T10:30:00Z" |
| updated_at | String | Yes | ISO 8601 timestamp | "2026-02-23T10:30:00Z" |

### Global Secondary Indexes (GSI)

#### GSI 1: VendorProductsIndex
**Purpose:** Query all products for a specific vendor, sorted by creation date

| Index Key | Attribute | Key Type |
|-----------|-----------|----------|
| Partition Key | vendor_id | String |
| Sort Key | created_at | String |

**Projection:** ALL
**Use Case:** Vendor dashboard showing "My Products" list

#### GSI 2: CategoryIndex
**Purpose:** Browse products by category, filter by active status

| Index Key | Attribute | Key Type |
|-----------|-----------|----------|
| Partition Key | category | String |
| Sort Key | is_active | Boolean |

**Projection:** ALL
**Use Case:** Customer browsing products by category

### Sample Item
```json
{
  "product_id": "PROD-E4F9A",
  "vendor_id": "VENDOR-001",
  "product_name": "Wireless Bluetooth Headphones",
  "description": "Premium over-ear headphones with active noise cancellation",
  "category": "Electronics",
  "subcategory": "Audio",
  "brand": "SoundMax",
  "base_price": 89.99,
  "images": [
    "https://shopsmart-inventory-images.s3.ap-south-1.amazonaws.com/PROD-E4F9A_img1.jpg",
    "https://shopsmart-inventory-images.s3.ap-south-1.amazonaws.com/PROD-E4F9A_img2.jpg"
  ],
  "tags": ["wireless", "bluetooth", "audio", "headphones"],
  "is_active": true,
  "created_at": "2026-02-23T10:30:00Z",
  "updated_at": "2026-02-23T10:30:00Z"
}
```

---

## 3. Table 2: VendorInventory

### Purpose
Tracks stock levels for each product SKU variant, including available, reserved, and threshold quantities.

### Primary Key Structure
| Key Type | Attribute Name | Data Type | Description |
|----------|---------------|-----------|-------------|
| Partition Key (PK) | product_id | String | Links to Products-table |
| Sort Key (SK) | sku | String | Unique SKU identifier |

### Attributes
| Attribute Name | Data Type | Required | Description | Example |
|---------------|-----------|----------|-------------|---------|
| product_id | String | Yes | Partition key, links to product | "PROD-E4F9A" |
| sku | String | Yes | Sort key, unique variant ID | "SKU-PROD-E4F9A-BLK-L" |
| vendor_id | String | Yes | Vendor who owns this inventory | "VENDOR-001" |
| variant_name | String | Yes | Human-readable variant name | "Black - Large" |
| variant_attributes | Map | No | Variant characteristics | {"color": "Black", "size": "Large"} |
| current_stock | Number | Yes | Total units in stock | 50 |
| reserved_stock | Number | Yes | Units reserved for orders | 5 |
| available_stock | Number | Yes | Units available for sale | 45 |
| reorder_threshold | Number | Yes | Alert threshold | 10 |
| unit_price | Number | Yes | Price for this variant | 89.99 |
| last_updated | String | Yes | ISO 8601 timestamp | "2026-02-23T14:20:00Z" |
| last_updated_by | String | Yes | User/system that updated | "VENDOR-001" |
| is_active | Boolean | Yes | SKU active status | true |

### Calculated Fields
- **available_stock** = current_stock - reserved_stock
- **low_stock_flag** = current_stock <= reorder_threshold

### Global Secondary Indexes (GSI)

#### GSI 3: VendorInventoryIndex
**Purpose:** View all inventory items for a vendor, sorted by last update

| Index Key | Attribute | Key Type |
|-----------|-----------|----------|
| Partition Key | vendor_id | String |
| Sort Key | last_updated | String |

**Projection:** ALL
**Use Case:** Vendor viewing entire inventory with recent changes first

#### GSI 4: LowStockIndex
**Purpose:** Quickly identify items needing restock for a vendor

| Index Key | Attribute | Key Type |
|-----------|-----------|----------|
| Partition Key | vendor_id | String |
| Sort Key | current_stock | Number |

**Projection:** ALL
**Use Case:** Low stock alerts dashboard
**Filter:** current_stock <= reorder_threshold (applied in application layer)

### Sample Item
```json
{
  "product_id": "PROD-E4F9A",
  "sku": "SKU-PROD-E4F9A-BLK-L",
  "vendor_id": "VENDOR-001",
  "variant_name": "Black - Large",
  "variant_attributes": {
    "color": "Black",
    "size": "Large"
  },
  "current_stock": 50,
  "reserved_stock": 5,
  "available_stock": 45,
  "reorder_threshold": 10,
  "unit_price": 89.99,
  "last_updated": "2026-02-23T14:20:00Z",
  "last_updated_by": "VENDOR-001",
  "is_active": true
}
```

---

## 4. Table 3: StockTransactions

### Purpose
Immutable audit log of all stock changes for compliance, debugging, and analytics.

### Primary Key Structure
| Key Type | Attribute Name | Data Type | Description |
|----------|---------------|-----------|-------------|
| Partition Key (PK) | transaction_id | String | Unique transaction ID (UUID) |
| Sort Key (SK) | timestamp | String | ISO 8601 timestamp |

### Attributes
| Attribute Name | Data Type | Required | Description | Example |
|---------------|-----------|----------|-------------|---------|
| transaction_id | String | Yes | Partition key, UUID | "TXN-550e8400-e29b-41d4-a716-446655440000" |
| timestamp | String | Yes | Sort key, when transaction occurred | "2026-02-23T14:20:00Z" |
| product_id | String | Yes | Affected product | "PROD-E4F9A" |
| sku | String | Yes | Affected SKU | "SKU-PROD-E4F9A-BLK-L" |
| vendor_id | String | Yes | Vendor who owns the product | "VENDOR-001" |
| transaction_type | String | Yes | Type of stock change | "restock" |
| quantity_change | Number | Yes | Change amount (+ or -) | +25 |
| stock_before | Number | Yes | Stock level before change | 50 |
| stock_after | Number | Yes | Stock level after change | 75 |
| order_id | String | No | Related order (if applicable) | "ORDER-12345" |
| performed_by | String | Yes | User/system that made change | "VENDOR-001" |
| notes | String | No | Additional context | "Monthly restock shipment" |

### Transaction Types
| Type | Description | Quantity Change |
|------|-------------|-----------------|
| restock | Inventory replenishment | Positive |
| order_placed | Stock reserved for order | 0 (reserves only) |
| order_confirmed | Stock actually deducted | Negative |
| order_cancelled | Reserved stock released | 0 (releases reservation) |
| refund | Item returned to inventory | Positive |
| manual_adjustment | Admin correction | Positive or Negative |

### Global Secondary Indexes (GSI)

#### GSI 5: ProductTransactionIndex
**Purpose:** View all transactions for a specific product

| Index Key | Attribute | Key Type |
|-----------|-----------|----------|
| Partition Key | product_id | String |
| Sort Key | timestamp | String |

**Projection:** ALL
**Use Case:** Product stock history timeline

#### GSI 6: VendorTransactionIndex
**Purpose:** View all transactions for a vendor

| Index Key | Attribute | Key Type |
|-----------|-----------|----------|
| Partition Key | vendor_id | String |
| Sort Key | timestamp | String |

**Projection:** ALL
**Use Case:** Vendor activity audit log

#### GSI 7: SKUTransactionIndex
**Purpose:** View transaction history for a specific SKU

| Index Key | Attribute | Key Type |
|-----------|-----------|----------|
| Partition Key | sku | String |
| Sort Key | timestamp | String |

**Projection:** ALL
**Use Case:** SKU-level stock change tracking

### Sample Item
```json
{
  "transaction_id": "TXN-550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-23T14:20:00Z",
  "product_id": "PROD-E4F9A",
  "sku": "SKU-PROD-E4F9A-BLK-L",
  "vendor_id": "VENDOR-001",
  "transaction_type": "restock",
  "quantity_change": 25,
  "stock_before": 50,
  "stock_after": 75,
  "order_id": null,
  "performed_by": "VENDOR-001",
  "notes": "Monthly restock shipment from warehouse"
}
```

---

## 5. Global Secondary Indexes Summary

| Index Name | Table | Partition Key | Sort Key | Projection | Purpose |
|------------|-------|---------------|----------|------------|---------|
| VendorProductsIndex | Products-table | vendor_id | created_at | ALL | List vendor's products |
| CategoryIndex | Products-table | category | is_active | ALL | Browse by category |
| VendorInventoryIndex | VendorInventory | vendor_id | last_updated | ALL | View vendor inventory |
| LowStockIndex | VendorInventory | vendor_id | current_stock | ALL | Low stock alerts |
| ProductTransactionIndex | StockTransactions | product_id | timestamp | ALL | Product history |
| VendorTransactionIndex | StockTransactions | vendor_id | timestamp | ALL | Vendor audit log |
| SKUTransactionIndex | StockTransactions | sku | timestamp | ALL | SKU history |

**Total GSIs:** 7
**Total Projected Attributes:** ALL (for all indexes)

---

## 6. Access Patterns

### Common Query Patterns

| Use Case | Table | Access Method | Example Query |
|----------|-------|---------------|---------------|
| Get product details | Products-table | GetItem | GetItem(product_id="PROD-E4F9A") |
| List vendor products | Products-table | GSI Query | Query(VendorProductsIndex, vendor_id="VENDOR-001") |
| Browse Electronics | Products-table | GSI Query | Query(CategoryIndex, category="Electronics") |
| Get SKU inventory | VendorInventory | GetItem | GetItem(product_id="PROD-E4F9A", sku="SKU-...") |
| List vendor inventory | VendorInventory | GSI Query | Query(VendorInventoryIndex, vendor_id="VENDOR-001") |
| Find low stock items | VendorInventory | GSI Query + Filter | Query(LowStockIndex, vendor_id="VENDOR-001") + Filter |
| Get transaction by ID | StockTransactions | GetItem | GetItem(transaction_id="TXN-...") |
| Product stock history | StockTransactions | GSI Query | Query(ProductTransactionIndex, product_id="PROD-E4F9A") |
| Vendor audit log | StockTransactions | GSI Query | Query(VendorTransactionIndex, vendor_id="VENDOR-001") |

### Performance Characteristics
- **Average Read Latency:** < 10ms (single-digit milliseconds)
- **Average Write Latency:** < 20ms
- **Consistency Model:** Eventually consistent reads (GSI), Strongly consistent reads (primary key)
- **Scalability:** Unlimited throughput with On-Demand billing

---

## 7. Data Model Relationships

### Entity Relationship Diagram (Text)
```
VENDOR
  |
  |-- has many --> PRODUCTS (Products-table)
  |                   |
  |                   |-- identified by --> product_id (PK)
  |                   |-- has many --> SKUS (VendorInventory)
  |                                       |
  |                                       |-- identified by --> (product_id, sku) (PK, SK)
  |                                       |-- tracks --> current_stock
  |                                       |-- tracks --> reserved_stock
  |                                       |-- tracks --> available_stock
  |                                       |
  |                                       |-- generates --> TRANSACTIONS (StockTransactions)
  |                                                           |
  |                                                           |-- identified by --> (transaction_id, timestamp)
  |                                                           |-- records --> quantity_change
  |                                                           |-- records --> stock_before
  |                                                           |-- records --> stock_after
```

### Referential Integrity
- **Products-table.product_id** → Referenced by VendorInventory.product_id
- **VendorInventory.sku** → Referenced by StockTransactions.sku
- **No foreign key constraints** (DynamoDB NoSQL design)
- **Application-level enforcement** via Lambda functions

### Data Consistency Rules
1. **Product Creation:** Must create Product before creating SKUs
2. **Stock Updates:** Must log transaction in StockTransactions table atomically
3. **Available Stock:** Always calculated as (current_stock - reserved_stock)
4. **Soft Deletes:** is_active flag used instead of deletion
5. **Immutable Logs:** StockTransactions never updated or deleted

---

## 8. Capacity Planning

### Estimated Data Sizes
| Table | Items per Vendor | Item Size | Total Size (100 Vendors) |
|-------|------------------|-----------|--------------------------|
| Products-table | 50-200 | 1-2 KB | 10-40 MB |
| VendorInventory | 100-500 | 0.5-1 KB | 5-50 MB |
| StockTransactions | 1000-10000 | 0.4 KB | 40-400 MB |

### Billing Mode: On-Demand
- **Reads:** $0.25 per million read request units
- **Writes:** $1.25 per million write request units
- **Storage:** $0.25 per GB-month
- **No minimum capacity**
- **Auto-scales with traffic**

---

## 9. Security & Compliance

### Access Control
- **IAM Policies:** Lambda execution roles have fine-grained DynamoDB permissions
- **Encryption at Rest:** AES-256 (AWS-managed keys)
- **Encryption in Transit:** TLS 1.2+
- **VPC:** Not required (public DynamoDB endpoints with IAM auth)

### Audit & Compliance
- **Audit Trail:** Complete transaction log in StockTransactions table
- **CloudWatch Logs:** All Lambda executions logged
- **DynamoDB Streams:** Enabled for real-time change capture
- **Backup:** On-demand backups available (not currently configured)

---

## 10. Conclusion

This DynamoDB schema provides:
- ✅ **Scalability:** Handles millions of products and transactions
- ✅ **Performance:** Sub-10ms read latency
- ✅ **Flexibility:** GSIs enable multiple access patterns
- ✅ **Auditability:** Complete immutable transaction log
- ✅ **Multi-tenancy:** Supports unlimited vendors
- ✅ **Cost-effective:** Pay-per-request billing

**Total Tables:** 3
**Total GSIs:** 7
**Total Attributes:** 35 across all tables

---

*Document Version: 1.0*
*Last Updated: February 23, 2026*
*Author: Team Arnav - E-Commerce Inventory Management System*
