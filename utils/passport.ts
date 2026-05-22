import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import type { VerifiedCallback } from "passport-jwt";
import config from "./config.ts";
import userService from "../services/userService.ts";
import type { GithubProfile, GoogleProfile } from "../types.ts";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET,
    },
    (payload: { userId: string }, done) => {
      userService
        .findById(payload.userId)
        .then((user) => {
          if (user) return done(null, user);
          return done(null, false);
        })
        .catch((e) => done(e, false));
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    (_accessToken, _refreshToken, profile, done) => {
      userService
        .addFromGoogleProfile(profile as GoogleProfile)
        .then((user) => done(null, user))
        .catch((e) => done(e, false));
    },
  ),
);

passport.use(
  new GithubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
    },
    (
      _accessToken: string,
      _refreshToken: string,
      profile: GithubProfile,
      done: VerifiedCallback,
    ) => {
      userService
        .addFromGithubProfile(profile)
        .then((user) => done(null, user))
        .catch((e) => done(e, false));
    },
  ),
);

export default passport;
