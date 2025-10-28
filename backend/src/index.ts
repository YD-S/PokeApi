import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import passport from "passport";
import authRoutes from "./routes/authRoutes";
import "./models/associations"
import pokemonRoutes from "./routes/pokemonRoutes";
import {setupSwagger} from "./config/swagger";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            console.log("🌍 CORS check:", origin);
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn("🚫 Blocked by CORS:", origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

const PORT = Number(process.env.PORT);

setupSwagger(app);

app.use("/auth", authRoutes);
app.use("/pokemon", pokemonRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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