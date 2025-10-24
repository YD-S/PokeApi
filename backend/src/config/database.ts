import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
    dialect: PostgresDialect,
    host: process.env.POSTGRES_HOST!,
    port: 5432,
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
    timezone: '+00:00',
    logging: console.log,
});

export default sequelize;
