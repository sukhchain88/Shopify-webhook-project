"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const userRouter = express_1.default.Router();
userRouter.get('/', UserController_1.getAllUsers);
userRouter.get('/:id', UserController_1.getUserById);
userRouter.post('/', UserController_1.createUser);
userRouter.put('/:id', UserController_1.updateUser);
userRouter.delete('/:id', UserController_1.deleteUser);
exports.default = userRouter;
