import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import passport from "passport";
import authRoutes from "./routes/authRoutes";
import {authMiddleware, AuthRequest} from "./middleware/authMiddleware";

dotenv.config();

const app = express();
app.use(passport.initialize());
const PORT = Number(process.env.PORT);

const authWrapper = (req: Request, res: Response, next: NextFunction) =>
    authMiddleware(req as AuthRequest, res, next);

app.use("/auth", authRoutes);

app.get("/", authWrapper, (_req: Request, res: Response) => {
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
        process.exit(1);
    }
})();
