// src/config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value ?? `${profile.id}@google.com`;
                const name = profile.displayName;

                let user = await userModel.findOne({
                    where: { googleId: profile.id },
                });

                if (!user) {
                    user = await userModel.findOne({ where: { email } });
                    if (user) {
                        await user.update({ googleId: profile.id });
                    } else {
                        user = await userModel.create({
                            googleId: profile.id,
                            email,
                            name,
                            password: null,
                        });
                    }
                }

                return done(null, user);
            } catch (err) {
                return done(err, undefined);
            }
        }
    )
);

export default passport;