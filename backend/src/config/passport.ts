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
                const [user] = await userModel.findOrCreate({
                    where: { googleId: profile.id },
                    defaults: {
                        googleId: profile.id,
                        email: profile.emails?.[0]?.value ?? `${profile.id}@google.com`,
                        name: profile.displayName,
                    },
                });
                return done(null, user);
            } catch (err) {
                return done(err, undefined);
            }
        }
    )
);

export default passport;
