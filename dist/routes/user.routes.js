// src\routes\user.routes.ts
import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';
const userRouter = express.Router();
// No need to add /users prefix as it's already in the path
// GET all users
userRouter.get('/', getAllUsers);
// GET a single user by ID
userRouter.get('/:id', getUserById);
// POST create a new user
userRouter.post('/', createUser);
// PUT update a user
userRouter.put('/:id', updateUser);
// DELETE a user
userRouter.delete('/:id', deleteUser);
export default userRouter;
