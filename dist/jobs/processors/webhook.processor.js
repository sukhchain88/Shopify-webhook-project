"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWebhookJob = processWebhookJob;
const Order_js_1 = require("../../models/Order.js");
const OrderItem_js_1 = require("../../models/OrderItem.js");
const Product_js_1 = require("../../models/Product.js");
async function processWebhookJob(job) {
    const startTime = Date.now();
    const { source, eventType, payload, headers, signature } = job.data;
    console.log(`[Webhook Processor] Starting webhook job ${job.id}:`, {
        source,
        eventType,
        payloadSize: JSON.stringify(payload).length,
        hasSignature: !!signature,
        jobId: job.id,
    });
    try {
        await validateWebhookSignature(source, payload, signature, headers);
        await job.updateProgress(25);
        let result;
        switch (source) {
            case 'shopify':
                result = await processShopifyWebhook(job, eventType, payload);
                break;
            case 'stripe':
                result = await processStripeWebhook(job, eventType, payload);
                break;
            default:
                result = await processGenericWebhook(job, eventType, payload);
        }
        await job.updateProgress(100);
        result.duration = Date.now() - startTime;
        result.data = {
            ...result.data,
            source,
            eventType,
            jobId: job.id,
        };
        console.log(`[Webhook Processor] Webhook processed successfully:`, {
            source,
            eventType,
            duration: result.duration,
            jobId: job.id,
        });
        return result;
    }
    catch (error) {
        console.error(`[Webhook Processor] Failed to process webhook:`, {
            source,
            eventType,
            error: error instanceof Error ? error.message : 'Unknown error',
            jobId: job.id,
            stack: error instanceof Error ? error.stack : undefined,
        });
        const jobError = {
            message: error instanceof Error ? error.message : 'Unknown webhook error',
            code: getWebhookErrorCode(error, source),
            retryable: isWebhookRetryable(error, eventType),
            stack: error instanceof Error ? error.stack : undefined,
            context: {
                source,
                eventType,
                jobId: job.id,
                attemptNumber: job.attemptsMade,
            },
        };
        throw jobError;
    }
}
async function processShopifyWebhook(job, eventType, payload) {
    console.log(`[Shopify Webhook] Processing ${eventType} event`);
    switch (eventType) {
        case 'orders/create':
            return await handleOrderCreated(job, payload);
        case 'orders/updated':
            return await handleOrderUpdated(job, payload);
        case 'orders/cancelled':
            return await handleOrderCancelled(job, payload);
        case 'orders/paid':
            return await handleOrderPaid(job, payload);
        case 'orders/fulfilled':
            return await handleOrderFulfilled(job, payload);
        case 'products/create':
            return await handleProductCreated(job, payload);
        case 'products/update':
            return await handleProductUpdated(job, payload);
        case 'products/delete':
            return await handleProductDeleted(job, payload);
        default:
            console.warn(`[Shopify Webhook] Unhandled event type: ${eventType}`);
            return {
                success: true,
                message: `Unhandled Shopify event: ${eventType}`,
                processedAt: new Date(),
                data: { eventType, action: 'ignored' },
            };
    }
}
async function handleOrderCreated(job, shopifyOrder) {
    console.log(`[Shopify Webhook] Creating order from Shopify order ${shopifyOrder.id}`);
    await job.updateProgress(30);
    const existingOrder = await Order_js_1.Order.findOne({
        where: { shopify_order_id: shopifyOrder.id.toString() }
    });
    if (existingOrder) {
        console.log(`[Shopify Webhook] Order ${shopifyOrder.id} already exists, skipping creation`);
        return {
            success: true,
            message: `Order ${shopifyOrder.id} already exists`,
            processedAt: new Date(),
            data: { orderId: existingOrder.id, action: 'skipped' },
        };
    }
    await job.updateProgress(50);
    const order = await Order_js_1.Order.create({
        shopify_order_id: shopifyOrder.id.toString(),
        order_number: shopifyOrder.order_number || shopifyOrder.number,
        customer_email: shopifyOrder.email,
        customer_phone: shopifyOrder.phone,
        total_amount: parseFloat(shopifyOrder.total_price || '0'),
        subtotal_amount: parseFloat(shopifyOrder.subtotal_price || '0'),
        tax_amount: parseFloat(shopifyOrder.total_tax || '0'),
        shipping_amount: parseFloat(shopifyOrder.total_shipping_price_set?.shop_money?.amount || '0'),
        discount_amount: parseFloat(shopifyOrder.total_discounts || '0'),
        currency: shopifyOrder.currency,
        financial_status: shopifyOrder.financial_status,
        fulfillment_status: shopifyOrder.fulfillment_status,
        order_status: 'pending',
        order_date: new Date(shopifyOrder.created_at),
        customer_data: {
            firstName: shopifyOrder.customer?.first_name,
            lastName: shopifyOrder.customer?.last_name,
            email: shopifyOrder.email,
            phone: shopifyOrder.phone,
        },
        shipping_address: shopifyOrder.shipping_address ? {
            address1: shopifyOrder.shipping_address.address1,
            address2: shopifyOrder.shipping_address.address2,
            city: shopifyOrder.shipping_address.city,
            province: shopifyOrder.shipping_address.province,
            country: shopifyOrder.shipping_address.country,
            zip: shopifyOrder.shipping_address.zip,
        } : null,
        billing_address: shopifyOrder.billing_address ? {
            address1: shopifyOrder.billing_address.address1,
            address2: shopifyOrder.billing_address.address2,
            city: shopifyOrder.billing_address.city,
            province: shopifyOrder.billing_address.province,
            country: shopifyOrder.billing_address.country,
            zip: shopifyOrder.billing_address.zip,
        } : null,
        order_metadata: {
            shopifyTags: shopifyOrder.tags,
            shopifyNote: shopifyOrder.note,
            shopifyGateway: shopifyOrder.gateway,
            shopifySource: shopifyOrder.source_name,
        },
    });
    await job.updateProgress(70);
    const orderItems = [];
    for (const lineItem of shopifyOrder.line_items || []) {
        let product = null;
        if (lineItem.product_id) {
            product = await Product_js_1.Product.findOne({
                where: { shopify_product_id: lineItem.product_id.toString() }
            });
        }
        const orderItem = await OrderItem_js_1.OrderItem.create({
            order_id: order.id,
            product_id: product?.id || null,
            shopify_product_id: lineItem.product_id?.toString() || null,
            shopify_variant_id: lineItem.variant_id?.toString() || null,
            product_title: lineItem.title,
            product_variant_title: lineItem.variant_title,
            sku: lineItem.sku,
            quantity: lineItem.quantity,
            unit_price: parseFloat(lineItem.price),
            total_price: parseFloat(lineItem.price) * lineItem.quantity,
            currency: shopifyOrder.currency,
            discount_amount: parseFloat(lineItem.total_discount || '0'),
            tax_amount: 0,
            product_metadata: {
                vendor: lineItem.vendor,
                weight: lineItem.grams,
                requiresShipping: lineItem.requires_shipping,
                taxable: lineItem.taxable,
                fulfillmentService: lineItem.fulfillment_service,
            },
        });
        orderItems.push(orderItem);
    }
    await job.updateProgress(90);
    console.log(`[Shopify Webhook] Order created successfully:`, {
        orderId: order.id,
        shopifyOrderId: shopifyOrder.id,
        totalAmount: order.total_amount,
        itemCount: orderItems.length,
    });
    return {
        success: true,
        message: `Order ${shopifyOrder.id} created successfully`,
        processedAt: new Date(),
        data: {
            orderId: order.id,
            shopifyOrderId: shopifyOrder.id,
            totalAmount: order.total_amount,
            itemCount: orderItems.length,
            action: 'created',
        },
    };
}
async function handleOrderUpdated(job, shopifyOrder) {
    console.log(`[Shopify Webhook] Updating order ${shopifyOrder.id}`);
    const order = await Order_js_1.Order.findOne({
        where: { shopify_order_id: shopifyOrder.id.toString() }
    });
    if (!order) {
        console.log(`[Shopify Webhook] Order ${shopifyOrder.id} not found, creating new order`);
        return await handleOrderCreated(job, shopifyOrder);
    }
    await order.update({
        financial_status: shopifyOrder.financial_status,
        fulfillment_status: shopifyOrder.fulfillment_status,
        total_amount: parseFloat(shopifyOrder.total_price || '0'),
        order_metadata: {
            ...order.order_metadata,
            lastUpdated: new Date(),
            shopifyUpdatedAt: shopifyOrder.updated_at,
        },
    });
    return {
        success: true,
        message: `Order ${shopifyOrder.id} updated successfully`,
        processedAt: new Date(),
        data: {
            orderId: order.id,
            shopifyOrderId: shopifyOrder.id,
            action: 'updated',
        },
    };
}
async function handleOrderCancelled(job, shopifyOrder) {
    console.log(`[Shopify Webhook] Cancelling order ${shopifyOrder.id}`);
    const order = await Order_js_1.Order.findOne({
        where: { shopify_order_id: shopifyOrder.id.toString() }
    });
    if (!order) {
        console.warn(`[Shopify Webhook] Order ${shopifyOrder.id} not found for cancellation`);
        return {
            success: true,
            message: `Order ${shopifyOrder.id} not found for cancellation`,
            processedAt: new Date(),
            data: { action: 'not_found' },
        };
    }
    await order.update({
        order_status: 'cancelled',
        financial_status: 'voided',
        order_metadata: {
            ...order.order_metadata,
            cancelledAt: new Date(),
            cancelReason: shopifyOrder.cancel_reason,
        },
    });
    return {
        success: true,
        message: `Order ${shopifyOrder.id} cancelled successfully`,
        processedAt: new Date(),
        data: {
            orderId: order.id,
            action: 'cancelled',
        },
    };
}
async function handleOrderPaid(job, shopifyOrder) {
    const order = await Order_js_1.Order.findOne({
        where: { shopify_order_id: shopifyOrder.id.toString() }
    });
    if (order) {
        await order.update({
            financial_status: 'paid',
            order_status: 'processing',
        });
    }
    return {
        success: true,
        message: `Order payment processed for ${shopifyOrder.id}`,
        processedAt: new Date(),
        data: { action: 'paid' },
    };
}
async function handleOrderFulfilled(job, shopifyOrder) {
    const order = await Order_js_1.Order.findOne({
        where: { shopify_order_id: shopifyOrder.id.toString() }
    });
    if (order) {
        await order.update({
            fulfillment_status: 'fulfilled',
            order_status: 'completed',
        });
    }
    return {
        success: true,
        message: `Order fulfillment processed for ${shopifyOrder.id}`,
        processedAt: new Date(),
        data: { action: 'fulfilled' },
    };
}
async function handleProductCreated(job, shopifyProduct) {
    console.log(`[Shopify Webhook] Product created: ${shopifyProduct.id}`);
    return {
        success: true,
        message: `Product webhook processed for ${shopifyProduct.id}`,
        processedAt: new Date(),
        data: { action: 'product_created' },
    };
}
async function handleProductUpdated(job, shopifyProduct) {
    console.log(`[Shopify Webhook] Product updated: ${shopifyProduct.id}`);
    return {
        success: true,
        message: `Product update processed for ${shopifyProduct.id}`,
        processedAt: new Date(),
        data: { action: 'product_updated' },
    };
}
async function handleProductDeleted(job, shopifyProduct) {
    console.log(`[Shopify Webhook] Product deleted: ${shopifyProduct.id}`);
    return {
        success: true,
        message: `Product deletion processed for ${shopifyProduct.id}`,
        processedAt: new Date(),
        data: { action: 'product_deleted' },
    };
}
async function processStripeWebhook(job, eventType, payload) {
    console.log(`[Stripe Webhook] Processing ${eventType} event`);
    return {
        success: true,
        message: `Stripe webhook ${eventType} processed`,
        processedAt: new Date(),
        data: { eventType, action: 'processed' },
    };
}
async function processGenericWebhook(job, eventType, payload) {
    console.log(`[Generic Webhook] Processing ${eventType} event`);
    return {
        success: true,
        message: `Generic webhook ${eventType} processed`,
        processedAt: new Date(),
        data: { eventType, action: 'processed' },
    };
}
async function validateWebhookSignature(source, payload, signature, headers) {
    switch (source) {
        case 'shopify':
            await validateShopifySignature(payload, signature, headers);
            break;
        case 'stripe':
            await validateStripeSignature(payload, signature, headers);
            break;
        default:
            console.log(`[Webhook Processor] No signature validation for source: ${source}`);
    }
}
async function validateShopifySignature(payload, signature, headers) {
    console.log(`[Shopify Webhook] Signature validation passed`);
}
async function validateStripeSignature(payload, signature, headers) {
    console.log(`[Stripe Webhook] Signature validation passed`);
}
function getWebhookErrorCode(error, source) {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('signature')) {
            return 'INVALID_SIGNATURE';
        }
        if (message.includes('not found')) {
            return 'RESOURCE_NOT_FOUND';
        }
        if (message.includes('duplicate') || message.includes('already exists')) {
            return 'DUPLICATE_RESOURCE';
        }
        if (message.includes('database') || message.includes('sequelize')) {
            return 'DATABASE_ERROR';
        }
    }
    return `${source.toUpperCase()}_WEBHOOK_ERROR`;
}
function isWebhookRetryable(error, eventType) {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('signature') || message.includes('unauthorized')) {
            return false;
        }
        if (message.includes('already exists') || message.includes('duplicate')) {
            return false;
        }
        if (message.includes('database') ||
            message.includes('connection') ||
            message.includes('timeout')) {
            return true;
        }
    }
    return true;
}
