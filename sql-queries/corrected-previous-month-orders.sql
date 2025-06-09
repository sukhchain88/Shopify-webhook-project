-- CORRECTED SQL Queries for Previous Month Orders and Order Items
-- Based on actual database schema analysis

-- 1. Get all customers who placed orders in the previous month
-- Note: There's a data type mismatch between customers.shopify_customer_id (varchar) and orders.customer_id (integer)
-- We need to check if there's a proper relationship or use direct order data

SELECT DISTINCT 
    c.id as customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.shopify_customer_id,
    COUNT(o.id) as total_orders,
    SUM(o.total_price) as total_spent
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id  -- Use the actual integer IDs
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.shopify_customer_id
ORDER BY total_spent DESC;

-- 2. Get all orders from the previous month
SELECT 
    o.id as order_id,
    o.shopify_order_id,
    o.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    o.total_price,
    o.currency,
    o.status,
    o.created_at as order_date,
    COUNT(oi.id) as total_items
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id  -- Use integer IDs
LEFT JOIN order_items oi ON o.id = oi.order_id  -- Use integer order IDs
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
GROUP BY o.id, o.shopify_order_id, o.customer_id, c.first_name, c.last_name, c.email, 
         o.total_price, o.currency, o.status, o.created_at
ORDER BY o.created_at DESC;

-- 3. Get all order items for orders from the previous month
SELECT 
    oi.id as order_item_id,
    oi.order_id,
    oi.product_id,
    oi.shopify_product_id,
    oi.shopify_variant_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    oi.product_title,
    oi.product_variant_title,
    oi.sku,
    p.title as product_name,
    p.vendor,
    o.created_at as order_date,
    c.first_name,
    c.last_name,
    c.email
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id  -- Use integer order IDs
LEFT JOIN customers c ON o.customer_id = c.id  -- Use integer customer IDs
LEFT JOIN products p ON oi.shopify_product_id = p.shopify_product_id
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
ORDER BY o.created_at DESC, oi.id;

-- 4. Comprehensive query: Customers, Orders, and Order Items from previous month
SELECT 
    -- Customer Information
    c.id as customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    
    -- Order Information
    o.id as order_id,
    o.shopify_order_id,
    o.total_price as order_total,
    o.currency,
    o.status,
    o.created_at as order_date,
    
    -- Order Item Information
    oi.id as order_item_id,
    oi.shopify_product_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price as item_total,
    oi.product_title,
    oi.product_variant_title,
    oi.sku,
    
    -- Product Information
    p.title as product_name,
    p.vendor,
    p.product_type
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
INNER JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.shopify_product_id = p.shopify_product_id
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
ORDER BY o.created_at DESC, oi.id;

-- 5. Summary statistics for previous month
SELECT 
    COUNT(DISTINCT c.id) as unique_customers,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(oi.id) as total_order_items,
    SUM(o.total_price) as total_revenue,
    AVG(o.total_price) as average_order_value,
    SUM(oi.quantity) as total_items_sold,
    SUM(oi.total_price) as total_items_revenue
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
INNER JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND o.created_at < DATE_TRUNC('month', CURRENT_DATE);

-- 6. Top selling products from previous month
SELECT 
    p.id as product_id,
    p.title as product_name,
    p.vendor,
    p.product_type,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.total_price) as total_revenue,
    COUNT(DISTINCT oi.order_id) as number_of_orders,
    AVG(oi.unit_price) as average_unit_price
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
LEFT JOIN products p ON oi.shopify_product_id = p.shopify_product_id
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p.id, p.title, p.vendor, p.product_type
ORDER BY total_quantity_sold DESC;

-- 7. Top customers by spending in previous month
SELECT 
    c.id as customer_id,
    c.first_name,
    c.last_name,
    c.email,
    COUNT(DISTINCT o.id) as number_of_orders,
    SUM(o.total_price) as total_spent,
    AVG(o.total_price) as average_order_value,
    SUM(oi.quantity) as total_items_purchased
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
INNER JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
GROUP BY c.id, c.first_name, c.last_name, c.email
ORDER BY total_spent DESC
LIMIT 10;

-- 8. Since many orders have NULL customer_id, let's also get orders without customers
SELECT 
    o.id as order_id,
    o.shopify_order_id,
    o.customer_id,
    o.total_price,
    o.currency,
    o.status,
    o.created_at as order_date,
    COUNT(oi.id) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
  AND o.customer_id IS NULL  -- Orders without customer association
GROUP BY o.id, o.shopify_order_id, o.customer_id, o.total_price, o.currency, o.status, o.created_at
ORDER BY o.created_at DESC; 