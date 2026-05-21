import { Router } from 'express'
import passport from '../utils/passport.ts'
import middleware from '../utils/middleware.ts'
import authController from "../controllers/authController.ts"
import config from '../utils/config.ts'

const router = Router()


router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/refresh', authController.refresh);

router.get('/google',          
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${config.CLIENT_URL}` }),
    authController.oauthCallback
)

router.get('/github',          
    passport.authenticate('github', { scope: ['user:email'], session: false }))
router.get('/github/callback', 
    passport.authenticate('github', { session: false, failureRedirect: `${config.CLIENT_URL}` }),
    authController.oauthCallback
)

router.use(middleware.authMiddleware)
router.post('/logout', authController.logout);
router.patch('/credentials', authController.updateCredentials);
router.delete('/profile', authController.deleteProfile);


export default router;
