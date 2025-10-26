import express from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import Token from "../models/token";
import {generateTokens} from "../utils/tokenUtils";
import {hash} from "../utils/tokenUtils";
import User from "../models/userModel";

const router = express.Router();

/**
 * GET /auth/google
 * Initiate Google OAuth2 login
 * Redirects to Google for authentication
 */
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * GET /auth/google/callback
 * Google OAuth2 callback URL
 * Handles the response from Google and generates JWT tokens
 * Redirects to the client with tokens
 */

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

/**
 * POST /auth/refresh
 * Refresh JWT tokens using a valid refresh token
 * Returns new access and refresh tokens
 * Requires: { refreshToken }
 * Body: { refreshToken }
 * Response: { accessToken, refreshToken }
 * Errors:
 * - 400: Missing refresh token
 *  - 401: Invalid or revoked refresh token
 *  - 404: User not found
 *  - 500: Server error
 */
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

/**
 * POST /auth/login
 * User login with email and password
 * Body: { email, password }
 * Response: { accessToken, refreshToken, user }
 * Errors:
 * - 200: Login successful
 * - 400: Invalid payload
 * - 404: User not found
 * - 401: Invalid password
 * - 500: Server error
 */
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


/**
 * POST /auth/register
 * User registration with email, password, and name
 * Body: { email, password, name }
 * Response: { userId, accessToken, refreshToken }
 * Errors:
 * - 201: User registered successfully
 * - 400: Invalid payload
 * - 409: User already exists
 * - 500: Registration failed
 */
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

/**
 * POST /auth/logout
 * User logout by revoking the refresh token
 * Body: { refreshToken }
 * Response: { message }
 * Errors:
 * - 400: Missing or invalid refresh token
 * - 200: Logged out successfully
 */
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
