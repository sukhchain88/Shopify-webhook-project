"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CustomerController_js_1 = require("../controllers/CustomerController.js");
const customerRoutes = express_1.default.Router();
customerRoutes.post("/", CustomerController_js_1.createCustomer);
customerRoutes.get("/", CustomerController_js_1.getAllCustomers);
customerRoutes.get("/:id", CustomerController_js_1.getCustomerById);
customerRoutes.put("/:id", CustomerController_js_1.updateCustomer);
customerRoutes.delete("/:id", CustomerController_js_1.deleteCustomer);
customerRoutes.post("/sync", CustomerController_js_1.syncCustomers);
exports.default = customerRoutes;
