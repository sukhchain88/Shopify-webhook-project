// // src\config\db.ts
// import dotenv from "dotenv";
// dotenv.config();

// import { Sequelize } from "sequelize";
// import {
//   DB_HOST,
//   DB_PORT,
//   DB_USER,
//   DB_PASSWORD,
//   DB_NAME,
// } from "../config/config.js";

// const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
//   host: DB_HOST,
//   port: parseInt(DB_PORT || "5432"),
//   dialect: "postgres",
//   logging: process.env.NODE_ENV === "development" ? console.log : false,
// });

// export default sequelize;


// src/config/db.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Render requires this to be false
    },
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('🔥 Connection error:', err));

export default sequelize;
