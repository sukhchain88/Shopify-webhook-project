"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src\routes\user.routes.ts
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const userRouter = express_1.default.Router();
// No need to add /users prefix as it's already in the path
// GET all users
userRouter.get('/', UserController_1.getAllUsers);
// GET a single user by ID
userRouter.get('/:id', UserController_1.getUserById);
// POST create a new user
userRouter.post('/', UserController_1.createUser);
// PUT update a user
userRouter.put('/:id', UserController_1.updateUser);
// DELETE a user
userRouter.delete('/:id', UserController_1.deleteUser);
exports.default = userRouter;
