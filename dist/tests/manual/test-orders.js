import axios from 'axios';
const API_URL = 'http://localhost:3000';
// Test data
const validOrder = {
    shop_domain: "quickstart-3dd6f37a.myshopify.com",
    order_number: "TEST-1234",
    total_price: 99.99,
    currency: "USD",
    status: "pending",
    line_items: [
        {
            quantity: 2,
            price: "49.99",
            title: "Test Product"
        }
    ],
    customer: {
        email: "test@example.com",
        first_name: "John",
        last_name: "Doe",
        address: {
            address1: "123 Test St",
            city: "Test City",
            province: "Test Province",
            country: "Test Country",
            zip: "12345"
        }
    }
};
const invalidOrder = {
    // Missing required fields
    shop_domain: "",
    order_number: "",
    total_price: -1,
    line_items: [],
    customer: {
        email: "invalid-email",
    }
};
const malformedJson = `{
  "shop_domain": "test.myshopify.com",
  "order_number": "123"
  "invalid_json": true
}`;
async function testOrderEndpoints() {
    try {
        console.log('🧪 Starting Order API Tests...\n');
        // Test 1: Create Order - Valid Data
        console.log('Test 1: Create Order - Valid Data');
        try {
            const createResponse = await axios.post(`${API_URL}/orders`, validOrder);
            console.log('✅ Success:', createResponse.data);
            const orderId = createResponse.data.data.local.id;
            // Test 2: Get Order by ID
            console.log('\nTest 2: Get Order by ID');
            const getResponse = await axios.get(`${API_URL}/orders/${orderId}`);
            console.log('✅ Success:', getResponse.data);
            // Test 3: Update Order
            console.log('\nTest 3: Update Order');
            const updateResponse = await axios.put(`${API_URL}/orders/${orderId}`, {
                ...validOrder,
                status: "paid"
            });
            console.log('✅ Success:', updateResponse.data);
            // Test 4: Delete Order
            console.log('\nTest 4: Delete Order');
            const deleteResponse = await axios.delete(`${API_URL}/orders/${orderId}`);
            console.log('✅ Success:', deleteResponse.data);
        }
        catch (error) {
            console.error('❌ Error:', error.response?.data || error.message);
        }
        // Test 5: Create Order - Invalid Data
        console.log('\nTest 5: Create Order - Invalid Data');
        try {
            await axios.post(`${API_URL}/orders`, invalidOrder);
        }
        catch (error) {
            console.log('✅ Expected error:', error.response?.data);
        }
        // Test 6: Create Order - Malformed JSON
        console.log('\nTest 6: Create Order - Malformed JSON');
        try {
            await axios.post(`${API_URL}/orders`, malformedJson, {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        catch (error) {
            console.log('✅ Expected error:', error.response?.data);
        }
        // Test 7: Get All Orders
        console.log('\nTest 7: Get All Orders');
        try {
            const getAllResponse = await axios.get(`${API_URL}/orders`);
            console.log('✅ Success:', getAllResponse.data);
        }
        catch (error) {
            console.error('❌ Error:', error.response?.data || error.message);
        }
        // Test 8: Get Non-existent Order
        console.log('\nTest 8: Get Non-existent Order');
        try {
            await axios.get(`${API_URL}/orders/999999`);
        }
        catch (error) {
            console.log('✅ Expected error:', error.response?.data);
        }
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}
// Run the tests
testOrderEndpoints().then(() => {
    console.log('\n🏁 Tests completed!');
});
