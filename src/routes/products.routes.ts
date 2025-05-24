// src\routes\products.routes.ts
// src\routes\products.routes.js
import express, { RequestHandler } from "express";
import {
  createProduct,
  getAllProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

// No need to add /products prefix as it's already in the path
router.post("/", createProduct as unknown as RequestHandler);
router.get("/", getAllProducts as unknown as RequestHandler);

export default router;
