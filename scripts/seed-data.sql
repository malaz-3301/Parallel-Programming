-- scripts/seed-data.sql
-- Seed initial data for testing

-- Insert a company (adjust columns as per your schema)
INSERT INTO "company" (id, name) VALUES (1, 'Demo Company');

-- Insert initial products linked to the company
INSERT INTO "product" (id, "count", "price", "photo", "details", "companyId", "deletedAt", "version")
VALUES
  (1, 100, 1999, 'http://example.com/photo1.png', 'Sample product 1', 1, NULL, 1),
  (2, 50, 2999, 'http://example.com/photo2.png', 'Sample product 2', 1, NULL, 1);
