import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import sequelize from "./config/database";
import passport from "passport";
import authRoutes from "./routes/authRoutes";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
app.use(passport.initialize());
const PORT = Number(process.env.PORT);

app.use("/auth", authRoutes);

app.get("/", (_req, res) => {
    res.status(200).send("Hello World");
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established.");

        await sequelize.sync();
        console.log("✅ Models synchronized.");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1); // exit if DB fails
    }
})();
