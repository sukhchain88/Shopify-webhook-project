-- SQL Queries for Previous Day Orders and Order Items

-- 1. All orders from previous day
SELECT 
    o.id as order_id,
    o.shopify_order_id,
    o.customer_id,
    c.first_name,
    c.last_name,
    o.total_price,
    o.currency,
    o.status,
    o.created_at as order_date
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND o.created_at < CURRENT_DATE
ORDER BY o.created_at DESC;

-- 2. Order items from previous day
SELECT 
    oi.id as order_item_id,
    oi.order_id,
    oi.shopify_product_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    oi.product_title,
    o.created_at as order_date,
    c.first_name,
    c.last_name
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND o.created_at < CURRENT_DATE
ORDER BY o.created_at DESC;

-- 3. Customers who placed orders yesterday
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
INNER JOIN orders o ON c.id = o.customer_id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND o.created_at < CURRENT_DATE
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.shopify_customer_id
ORDER BY total_spent DESC;

-- 4. Summary statistics for previous day
SELECT 
    COUNT(DISTINCT c.id) as unique_customers,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(oi.id) as total_order_items,
    SUM(o.total_price) as total_revenue,
    AVG(o.total_price) as average_order_value,
    SUM(oi.quantity) as total_items_sold,
    SUM(oi.total_price) as total_items_revenue
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND o.created_at < CURRENT_DATE;

-- 5. Orders without customer association from previous day
SELECT 
    o.id as order_id,
    o.shopify_order_id,
    o.total_price,
    o.currency,
    o.status,
    o.created_at as order_date,
    COUNT(oi.id) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND o.created_at < CURRENT_DATE
  AND o.customer_id IS NULL
GROUP BY o.id, o.shopify_order_id, o.total_price, o.currency, o.status, o.created_at
ORDER BY o.created_at DESC;

-- 6. Alternative: Last 24 hours (if you want exact 24 hours instead of calendar day)
SELECT 
    o.id as order_id,
    o.shopify_order_id,
    o.customer_id,
    c.first_name,
    c.last_name,
    o.total_price,
    o.currency,
    o.status,
    o.created_at as order_date
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY o.created_at DESC;

-- 7. Order items from last 24 hours
SELECT 
    oi.id as order_item_id,
    oi.order_id,
    oi.shopify_product_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    oi.product_title,
    o.created_at as order_date,
    c.first_name,
    c.last_name
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY o.created_at DESC; 