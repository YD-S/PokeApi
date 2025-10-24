import express from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import Token from "../models/token";
import {generateTokens} from "../utils/tokenUtils";

const router = express.Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        const user = req.user as userModel;
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );
        res.json({ token, user });
    }
);


router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
        const tokenRecord = await Token.findOne({
            where: { jti: decoded.jti, revoked: false },
        });

        if (!tokenRecord) {
            return res.status(401).json({ message: "Invalid or revoked refresh token" });
        }

        const user = await userModel.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await tokenRecord.update({ revoked: true });

        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

        return res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (err: any) {
        console.error("Refresh error:", err.message);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
});

router.post("/logout", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
        await Token.update({ revoked: true }, { where: { jti: decoded.jti } });
        return res.json({ message: "Logged out successfully" });
    } catch {
        return res.status(400).json({ message: "Invalid token" });
    }
});


export default router;
