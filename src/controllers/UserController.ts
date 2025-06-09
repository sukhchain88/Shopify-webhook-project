// src\controllers\user.controller.ts
import { Request, Response } from "express";
import { Users } from "../models/User";

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await Users.findAll({
      raw: true,
      logging: console.log
    });

    console.log("📄 Users Table Data:");
    console.table(users);

    return res.status(200).json({
      message: "Users retrieved successfully",
      data: users
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    return res.status(500).json({ 
      error: "Failed to fetch users", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Get a single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      data: user
    });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    return res.status(500).json({ 
      error: "Failed to fetch user", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    if (!userData.name || !userData.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const user = await Users.create(userData);
    
    console.log("✅ User created:", user.toJSON());
    
    return res.status(201).json({
      message: "User created successfully",
      data: user
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    return res.status(500).json({ 
      error: "Failed to create user", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Update a user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    const user = await Users.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await user.update(userData);
    
    console.log("✅ User updated:", user.toJSON());
    
    return res.status(200).json({
      message: "User updated successfully",
      data: user
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    return res.status(500).json({ 
      error: "Failed to update user", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await Users.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await user.destroy();
    
    console.log("✅ User deleted:", id);
    
    return res.status(200).json({
      message: "User deleted successfully",
      data: { id }
    });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    return res.status(500).json({ 
      error: "Failed to delete user", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
};

// View users
export const viewUsers = async (req: Request, res: Response) => {
  try {
    const users = await Users .findAll({
      raw: true,
      logging: console.log
    });

    console.log("📄 Users Table Data:");
    console.table(users);

    return res.status(200).json({
      message: "Users retrieved successfully",
      data: users
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    return res.status(500).json({ 
      error: "Failed to fetch users", 
      details: err instanceof Error ? err.message : "Unknown error" 
    });
  }
}; 
 