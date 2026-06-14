import express from 'express'
import {registerUser, sendSignupOtp ,loginUser, sendResetOtp, resetPassword} from '../controller/authController.js';
import { otpLimiter,loginLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();

router.post('/send-signup-otp',otpLimiter,sendSignupOtp)
router.post('/signup',registerUser)
router.post('/login',loginLimiter,loginUser)
router.post('/send-reset-otp',otpLimiter,sendResetOtp)
router.put('/reset-password',resetPassword)
export default router