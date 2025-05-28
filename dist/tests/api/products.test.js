import axios from 'axios';
import crypto from 'crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Product } from '../../models/product.js';
import { appConfig } from '../../config/environment.js';
const API_URL = `http://localhost:${appConfig.server.port}`;
describe('Products API Tests', () => {
    let testProductId;
    // Test product data
    const testProduct = {
        shop_domain: 'test-shop.myshopify.com',
        title: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        currency: 'USD',
        inventory_quantity: 100,
        sku: 'TEST-SKU-001',
        vendor: 'Test Vendor',
        product_type: 'Test Type',
        tags: ['test', 'sample', 'product']
    };
    // Clean up database before and after tests
    beforeAll(async () => await Product.destroy({ where: {} }));
    afterAll(async () => await Product.destroy({ where: {} }));
    describe('Regular API Endpoints', () => {
        // Test creating a product
        it('should create a new product', async () => {
            const response = await axios.post(`${API_URL}/products`, testProduct);
            expect(response.status).toBe(201);
            expect(response.data.message).toBe('Product created successfully');
            expect(response.data.data).toMatchObject({
                ...testProduct,
                status: 'draft',
                tags: testProduct.tags.join(',')
            });
            testProductId = response.data.data.id;
        });
        // Test getting all products
        it('should get all products', async () => {
            const response = await axios.get(`${API_URL}/products`);
            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Products retrieved successfully');
            expect(response.data.data).toBeInstanceOf(Array);
            expect(response.data.data.length).toBeGreaterThan(0);
        });
        // Test getting a single product
        it('should get a single product by ID', async () => {
            const response = await axios.get(`${API_URL}/products/${testProductId}`);
            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Product retrieved successfully');
            expect(response.data.data).toMatchObject({
                id: testProductId,
                ...testProduct,
                status: 'draft',
                tags: testProduct.tags.join(',')
            });
        });
        // Test updating a product
        it('should update a product', async () => {
            const updateData = {
                title: 'Updated Test Product',
                price: 149.99,
                status: 'active'
            };
            const response = await axios.put(`${API_URL}/products/${testProductId}`, updateData);
            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Product updated successfully');
            expect(response.data.data).toMatchObject({
                id: testProductId,
                ...testProduct,
                ...updateData,
                tags: testProduct.tags.join(',')
            });
        });
        // Test error handling - Product not found
        it('should return 404 when product not found', async () => {
            try {
                await axios.get(`${API_URL}/products/99999`);
                fail('Should have thrown an error');
            }
            catch (error) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.error).toBe('Product not found');
            }
        });
        // Test error handling - Invalid product data
        it('should return 400 when creating product with invalid data', async () => {
            try {
                await axios.post(`${API_URL}/products`, {
                    description: 'Invalid product data'
                });
                fail('Should have thrown an error');
            }
            catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.error).toBe('Shop domain, title, and price are required');
            }
        });
        // Test deleting a product
        it('should delete a product', async () => {
            const response = await axios.delete(`${API_URL}/products/${testProductId}`);
            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Product deleted successfully');
            // Verify product is deleted
            try {
                await axios.get(`${API_URL}/products/${testProductId}`);
                fail('Should have thrown an error');
            }
            catch (error) {
                expect(error.response.status).toBe(404);
            }
        });
    });
    describe('Shopify Webhook Handler', () => {
        const webhookSecret = appConfig.shopify.webhookSecret;
        const shopDomain = 'test-shop.myshopify.com';
        // Helper function to create webhook request
        const createWebhookRequest = (topic, data) => {
            const body = JSON.stringify(data);
            const hmac = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('base64');
            return {
                headers: {
                    'x-shopify-topic': topic,
                    'x-shopify-hmac-sha256': hmac,
                    'x-shopify-shop-domain': shopDomain,
                    'content-type': 'application/json'
                },
                data: body
            };
        };
        // Test product creation webhook
        it('should handle product creation webhook', async () => {
            const webhookData = {
                id: 123456789,
                title: 'Webhook Test Product',
                body_html: 'Product from webhook',
                vendor: 'Webhook Vendor',
                product_type: 'Webhook Type',
                status: 'active',
                tags: 'webhook,test',
                variants: [{
                        price: '199.99',
                        sku: 'WHK-001',
                        inventory_quantity: 50
                    }]
            };
            const request = createWebhookRequest('products/create', webhookData);
            const response = await axios.post(`${API_URL}/products/webhook`, request.data, { headers: request.headers });
            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Webhook processed successfully');
            // Verify product was created in database
            const product = await Product.findOne({
                where: { shopify_product_id: webhookData.id.toString() }
            });
            expect(product).toBeTruthy();
            expect(product?.get('title')).toBe(webhookData.title);
            expect(product?.get('price')).toBe(199.99);
        });
        // Test invalid webhook signature
        it('should reject webhook with invalid signature', async () => {
            const webhookData = { id: 123456789 };
            const request = createWebhookRequest('products/create', webhookData);
            request.headers['x-shopify-hmac-sha256'] = 'invalid-signature';
            try {
                await axios.post(`${API_URL}/products/webhook`, request.data, { headers: request.headers });
                fail('Should have thrown an error');
            }
            catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.error).toBe('Invalid webhook signature');
            }
        });
        // Test missing webhook headers
        it('should reject webhook with missing headers', async () => {
            try {
                await axios.post(`${API_URL}/products/webhook`, JSON.stringify({ id: 123456789 }), { headers: { 'content-type': 'application/json' } });
                fail('Should have thrown an error');
            }
            catch (error) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.error).toBe('Missing required Shopify webhook headers');
            }
        });
    });
});
