import axios from 'axios';

const testOrder = {
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

async function testOrderAPI() {
  try {
    console.log('Testing POST /orders with valid order...');
    console.log('Request payload:', JSON.stringify(testOrder, null, 2));
    
    const response = await axios.post('http://localhost:3000/orders', testOrder, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success! Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Verify JSON is valid before sending
try {
  JSON.parse(JSON.stringify(testOrder));
  console.log('JSON validation passed');
  testOrderAPI();
} catch (error) {
  console.error('Invalid JSON:', error.message);
} 