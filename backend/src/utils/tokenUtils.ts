import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import Token from "../models/token";
import userModel from "../models/userModel";

export const generateTokens = async (user: userModel) => {
    const jti = uuidv4();

    const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user.id, jti },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
    );

    await Token.create({
        user_id: user.id,
        jti,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { accessToken, refreshToken };
};
