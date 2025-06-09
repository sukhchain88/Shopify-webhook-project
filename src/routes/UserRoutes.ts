// src\routes\user.routes.ts
import express, { RequestHandler } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/UserController.js';

const userRouter = express.Router();

// No need to add /users prefix as it's already in the path
// GET all users
userRouter.get('/', getAllUsers as unknown as RequestHandler);

// GET a single user by ID
userRouter.get('/:id', getUserById as unknown as RequestHandler);

// POST create a new user
userRouter.post('/', createUser as unknown as RequestHandler);

// PUT update a user
userRouter.put('/:id', updateUser as unknown as RequestHandler);

// DELETE a user
userRouter.delete('/:id', deleteUser as unknown as RequestHandler);

export default userRouter; 
 