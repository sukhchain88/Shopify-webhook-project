// src\index.ts
import express, { RequestHandler } from "express";
import cors from "cors";
import { config } from "dotenv";
import sequelize from "./config/db.js";
import productRoutes from "./routes/products.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import shopifyRoutes from "./routes/shopify.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import { viewUsers } from "./controllers/user.controller.js";
import {
  verifyAndRegisterWebhooks,
  listRegisteredWebhooks,
} from "./services/shopify.service.js";
import bodyParser from "body-parser";
import crypto from "crypto";
import userRouter from "./routes/user.routes.js";
const router = express.Router();
config();

const app = express();
const port = process.env.PORT || 3000;

// Add this **before** any route uses or bodyParser.json
app.use("/api/webhooks", bodyParser.raw({ type: "application/json" }));

// Only use JSON parser for other non-webhook routes
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRouter);
app.use("/api/webhooks", webhookRoutes);
router.get("/users", viewUsers as unknown as RequestHandler);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    await sequelize.sync();
    console.log("✅ Models synchronized");

    await verifyAndRegisterWebhooks();
    console.log("✅ Webhooks verified and registered");

    await listRegisteredWebhooks();
    console.log("✅ Webhook list retrieved");

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("🔥 Server/database startup error:", error);
    app.listen(port, () => {
      console.log(`⚠️ Running on port ${port} without DB`);
    });
  }
};

startServer();
