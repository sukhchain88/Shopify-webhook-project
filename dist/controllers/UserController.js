"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewUsers = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = require("../models/User");
// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.Users.findAll({
            raw: true,
            logging: console.log
        });
        console.log("📄 Users Table Data:");
        console.table(users);
        return res.status(200).json({
            message: "Users retrieved successfully",
            data: users
        });
    }
    catch (err) {
        console.error("❌ Error fetching users:", err);
        return res.status(500).json({
            error: "Failed to fetch users",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
exports.getAllUsers = getAllUsers;
// Get a single user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({
            message: "User retrieved successfully",
            data: user
        });
    }
    catch (err) {
        console.error("❌ Error fetching user:", err);
        return res.status(500).json({
            error: "Failed to fetch user",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
exports.getUserById = getUserById;
// Create a new user
const createUser = async (req, res) => {
    try {
        const userData = req.body;
        // Validate required fields
        if (!userData.name || !userData.email) {
            return res.status(400).json({ error: "Name and email are required" });
        }
        const user = await User_1.Users.create(userData);
        console.log("✅ User created:", user.toJSON());
        return res.status(201).json({
            message: "User created successfully",
            data: user
        });
    }
    catch (err) {
        console.error("❌ Error creating user:", err);
        return res.status(500).json({
            error: "Failed to create user",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
exports.createUser = createUser;
// Update a user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        const user = await User_1.Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await user.update(userData);
        console.log("✅ User updated:", user.toJSON());
        return res.status(200).json({
            message: "User updated successfully",
            data: user
        });
    }
    catch (err) {
        console.error("❌ Error updating user:", err);
        return res.status(500).json({
            error: "Failed to update user",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
exports.updateUser = updateUser;
// Delete a user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await user.destroy();
        console.log("✅ User deleted:", id);
        return res.status(200).json({
            message: "User deleted successfully",
            data: { id }
        });
    }
    catch (err) {
        console.error("❌ Error deleting user:", err);
        return res.status(500).json({
            error: "Failed to delete user",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
exports.deleteUser = deleteUser;
// View users
const viewUsers = async (req, res) => {
    try {
        const users = await User_1.Users.findAll({
            raw: true,
            logging: console.log
        });
        console.log("📄 Users Table Data:");
        console.table(users);
        return res.status(200).json({
            message: "Users retrieved successfully",
            data: users
        });
    }
    catch (err) {
        console.error("❌ Error fetching users:", err);
        return res.status(500).json({
            error: "Failed to fetch users",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
exports.viewUsers = viewUsers;
