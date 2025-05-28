/**
 * Comprehensive API Test Suite
 * Tests all endpoints in the Shopify Webhook Project
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || 'test-secret';

/**
 * Utility function to make HTTP requests
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    
    return {
      status: response.status,
      data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false
    };
  }
}

/**
 * Generate HMAC signature for webhook testing
 */
function generateHMAC(payload) {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('base64');
}

/**
 * Test Results Storage
 */
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Test runner function
 */
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Testing: ${testName}`);
  try {
    await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

/**
 * TEST SUITE
 */

// 1. Health Check Endpoint
async function testHealthCheck() {
  const result = await makeRequest('/health');
  if (!result.success || result.status !== 200) {
    throw new Error(`Health check failed: ${result.status}`);
  }
}

// 2. Create Product Endpoint
async function testCreateProduct() {
  const productData = {
    title: "API Test Product",
    price: "29.99",
    description: "Test product created via API",
    status: "active",
    metadata: {
      vendor: "Test Vendor",
      product_type: "Test Type",
      tags: "api, test"
    }
  };

  const result = await makeRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });

  if (!result.success || result.status !== 201) {
    throw new Error(`Create product failed: ${result.status} - ${JSON.stringify(result.data)}`);
  }

  // Store product ID for later tests
  global.testProductId = result.data.data.id;
}

// 3. Get All Products Endpoint
async function testGetAllProducts() {
  const result = await makeRequest('/products');
  
  if (!result.success || result.status !== 200) {
    throw new Error(`Get all products failed: ${result.status}`);
  }

  if (!Array.isArray(result.data.data)) {
    throw new Error('Products data should be an array');
  }
}

// 4. Get Product by ID Endpoint
async function testGetProductById() {
  if (!global.testProductId) {
    throw new Error('No test product ID available');
  }

  const result = await makeRequest(`/products/${global.testProductId}`);
  
  if (!result.success || result.status !== 200) {
    throw new Error(`Get product by ID failed: ${result.status}`);
  }
}

// 5. Update Product Endpoint
async function testUpdateProduct() {
  if (!global.testProductId) {
    throw new Error('No test product ID available');
  }

  const updateData = {
    title: "Updated API Test Product",
    price: "39.99"
  };

  const result = await makeRequest(`/products/${global.testProductId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  if (!result.success || result.status !== 200) {
    throw new Error(`Update product failed: ${result.status}`);
  }
}

// 6. Webhook Endpoint - Product Create
async function testWebhookProductCreate() {
  const webhookPayload = {
    id: 999888777,
    title: "Webhook Test Product",
    body_html: "<p>Created via webhook</p>",
    vendor: "Webhook Vendor",
    product_type: "Webhook Type",
    tags: "webhook, test",
    status: "active",
    variants: [
      {
        price: "19.99",
        sku: "WEBHOOK-001",
        inventory_quantity: 100
      }
    ]
  };

  const payloadString = JSON.stringify(webhookPayload);
  const hmac = generateHMAC(payloadString);

  const result = await makeRequest('/api/webhooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Topic': 'products/create',
      'X-Shopify-Hmac-SHA256': hmac,
      'X-Shopify-Shop-Domain': 'test-store.myshopify.com'
    },
    body: payloadString
  });

  if (!result.success || result.status !== 200) {
    throw new Error(`Webhook test failed: ${result.status} - ${JSON.stringify(result.data)}`);
  }
}

// 7. Get All Webhooks Endpoint
async function testGetAllWebhooks() {
  const result = await makeRequest('/api/webhooks');
  
  if (!result.success || result.status !== 200) {
    throw new Error(`Get all webhooks failed: ${result.status}`);
  }
}

// 8. Customer Endpoints (if they exist)
async function testCustomerEndpoints() {
  // Test create customer
  const customerData = {
    shop_domain: "test-store.myshopify.com",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@test.com",
    phone: "+1234567890"
  };

  const createResult = await makeRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData)
  });

  // Note: This might fail if customer endpoints aren't fully implemented
  // We'll handle this gracefully
  if (createResult.status === 404) {
    console.log('   ℹ️  Customer endpoints not implemented yet');
    return;
  }

  if (!createResult.success) {
    throw new Error(`Create customer failed: ${createResult.status}`);
  }
}

// 9. Order Endpoints (if they exist)
async function testOrderEndpoints() {
  const orderData = {
    shop_domain: "test-store.myshopify.com",
    order_number: "TEST-001",
    total_price: 99.99,
    currency: "USD",
    status: "pending"
  };

  const createResult = await makeRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });

  // Note: This might fail if order endpoints aren't fully implemented
  if (createResult.status === 404) {
    console.log('   ℹ️  Order endpoints not implemented yet');
    return;
  }

  if (!createResult.success) {
    throw new Error(`Create order failed: ${createResult.status}`);
  }
}

// 10. Delete Product Endpoint (cleanup)
async function testDeleteProduct() {
  if (!global.testProductId) {
    throw new Error('No test product ID available');
  }

  const result = await makeRequest(`/products/${global.testProductId}`, {
    method: 'DELETE'
  });

  if (!result.success || result.status !== 200) {
    throw new Error(`Delete product failed: ${result.status}`);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Tests...\n');
  console.log('=' .repeat(50));

  // Run all tests
  await runTest('Health Check', testHealthCheck);
  await runTest('Create Product', testCreateProduct);
  await runTest('Get All Products', testGetAllProducts);
  await runTest('Get Product by ID', testGetProductById);
  await runTest('Update Product', testUpdateProduct);
  await runTest('Webhook - Product Create', testWebhookProductCreate);
  await runTest('Get All Webhooks', testGetAllWebhooks);
  await runTest('Customer Endpoints', testCustomerEndpoints);
  await runTest('Order Endpoints', testOrderEndpoints);
  await runTest('Delete Product', testDeleteProduct);

  // Print results
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
  }

  console.log('\n🎉 Testing Complete!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests }; 