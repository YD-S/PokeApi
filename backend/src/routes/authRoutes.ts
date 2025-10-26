import express from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import Token from "../models/token";
import {generateTokens} from "../utils/tokenUtils";
import {hash} from "../utils/tokenUtils";
import User from "../models/userModel";

const router = express.Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        try {
            const user = req.user as userModel;
            const { accessToken, refreshToken } = await generateTokens(user);

            res.json({ accessToken, refreshToken, user });

            // res.redirect(`${process.env.CLIENT_URL}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        } catch (err) {
            console.error("Google OAuth callback error:", err);
            res.status(500).json({ message: "OAuth failed" });
        }
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

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = hash(password);
        if (user.password !== hashedPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const { accessToken, refreshToken } = await generateTokens(user);

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Login failed" });
    }
});

router.post("/register", async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    const hashedPassword = hash(password);

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
        });

        const { accessToken, refreshToken } = await generateTokens(newUser);

        return res.status(201).json({
            message: "User registered successfully",
            userId: newUser.id,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ error: "Registration failed" });
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
