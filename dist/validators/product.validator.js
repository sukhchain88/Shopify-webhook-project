// src\validators\product.validator.ts
import { z } from "zod";
const productSchema = z.object({
    product: z.object({
        title: z.string(),
        body_html: z.string().optional(),
        vendor: z.string().optional(),
        product_type: z.string().optional(),
        tags: z.union([z.string(), z.array(z.string())]).optional(),
        variants: z.array(z.object({
            price: z.string().or(z.number()),
        })).nonempty(),
    }),
});
export const validateProductInput = (data) => {
    return productSchema.safeParse(data);
};
