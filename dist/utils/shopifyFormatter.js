export const formatShopifyProductPayload = (product) => {
    return {
        product: {
            title: product.title,
            body_html: product.description || '',
            vendor: product.metadata?.vendor || '',
            product_type: product.metadata?.product_type || '',
            tags: Array.isArray(product.metadata?.tags)
                ? product.metadata.tags.join(', ')
                : product.metadata?.tags || '',
            variants: [
                {
                    price: product.price?.toString() || '',
                },
            ],
        },
    };
};
