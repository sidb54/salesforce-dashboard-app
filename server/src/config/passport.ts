import { PassportStatic } from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { User } from '../models/user.model';

export const configurePassport = (passport: PassportStatic) => {
  const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret',
  };

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        // Find the user specified in token
        const user = await User.findByPk(payload.id);

        // If user doesn't exist, handle it
        if (!user) {
          return done(null, false);
        }

        // Otherwise, return the user
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
}; 