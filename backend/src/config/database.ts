import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import dotenv from 'dotenv';
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: 5432,
    clientMinMessages: 'notice',
    timezone: '+00:00',
});


export default sequelize;