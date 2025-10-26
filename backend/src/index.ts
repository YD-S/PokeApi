import express, {NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import passport from "passport";
import authRoutes from "./routes/authRoutes";
import "./models/associations"
import pokemonRoutes from "./routes/pokemonRoutes";
import {setupSwagger} from "./config/swagger";
import cors from "cors";
import path from "path";
import {authMiddleware, AuthRequest} from "./middleware/authMiddleware";

dotenv.config();

const app = express();
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define allowed origins from environment variable or fallback to a default list
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000"];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
const PORT = Number(process.env.PORT);

setupSwagger(app);

const authWrapper = (req: Request, res: Response, next: NextFunction) =>
    authMiddleware(req as AuthRequest, res, next);

app.use("/auth", authRoutes);
app.use("/pokemon", pokemonRoutes);
app.use("/uploads",authWrapper, express.static(path.join(__dirname, "../uploads")));

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