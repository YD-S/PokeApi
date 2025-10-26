import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import passport from "passport";
import authRoutes from "./routes/authRoutes";
import "./models/associations"
import pokemonRoutes from "./routes/pokemonRoutes";

dotenv.config();

const app = express();
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = Number(process.env.PORT);

app.use("/auth", authRoutes);
app.use("/pokemon", pokemonRoutes);

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
        process.exit(1);
    }
})();
