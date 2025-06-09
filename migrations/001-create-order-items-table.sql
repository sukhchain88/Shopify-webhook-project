-- Migration: Create order_items table for order-product relationships
-- Run this in your PostgreSQL database

-- ========================================
-- CREATE ORDER_ITEMS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Shopify References
    shopify_product_id VARCHAR(255),
    shopify_variant_id VARCHAR(255),
    
    -- Product Information (preserved at time of purchase)
    product_title VARCHAR(500) NOT NULL,
    product_variant_title VARCHAR(255),
    sku VARCHAR(100),
    
    -- Quantity and Pricing
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Discounts and Taxes
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Additional Data
    product_metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Index for order lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Index for product lookups
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Index for Shopify product lookups
CREATE INDEX IF NOT EXISTS idx_order_items_shopify_product_id ON order_items(shopify_product_id);

-- Index for Shopify variant lookups
CREATE INDEX IF NOT EXISTS idx_order_items_shopify_variant_id ON order_items(shopify_variant_id);

-- Composite index for order + product queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON order_items(order_id, product_id);

-- Index for SKU lookups
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);

-- ========================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE order_items IS 'Line items for orders - links orders to specific products with quantities and pricing';
COMMENT ON COLUMN order_items.order_id IS 'Reference to the order this item belongs to';
COMMENT ON COLUMN order_items.product_id IS 'Reference to product in local catalog (can be null if product deleted)';
COMMENT ON COLUMN order_items.shopify_product_id IS 'Shopify product ID for reference';
COMMENT ON COLUMN order_items.shopify_variant_id IS 'Shopify variant ID for specific product variant';
COMMENT ON COLUMN order_items.product_title IS 'Product title at time of purchase (preserved even if product deleted)';
COMMENT ON COLUMN order_items.product_variant_title IS 'Variant title (size, color, etc.)';
COMMENT ON COLUMN order_items.sku IS 'Product SKU at time of purchase';
COMMENT ON COLUMN order_items.quantity IS 'Number of units purchased';
COMMENT ON COLUMN order_items.unit_price IS 'Price per unit at time of purchase';
COMMENT ON COLUMN order_items.total_price IS 'Total price for this line item (quantity × unit_price)';
COMMENT ON COLUMN order_items.discount_amount IS 'Discount applied to this line item';
COMMENT ON COLUMN order_items.tax_amount IS 'Tax amount for this line item';
COMMENT ON COLUMN order_items.product_metadata IS 'Additional product data from Shopify (weight, vendor, etc.)';

-- ========================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'order_items';

-- Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'order_items';

-- ========================================
-- SAMPLE DATA INSERT (for testing)
-- ========================================

-- Uncomment to insert sample data after running migration:

/*
-- Insert sample order items (replace with actual order and product IDs)
INSERT INTO order_items (
    order_id, 
    product_id, 
    shopify_product_id,
    product_title,
    quantity,
    unit_price,
    total_price,
    currency
) VALUES 
(1, 1, '123456789', 'Sample Product 1', 2, 25.00, 50.00, 'USD'),
(1, 2, '123456790', 'Sample Product 2', 1, 15.00, 15.00, 'USD'),
(2, 1, '123456789', 'Sample Product 1', 1, 25.00, 25.00, 'USD');
*/ 