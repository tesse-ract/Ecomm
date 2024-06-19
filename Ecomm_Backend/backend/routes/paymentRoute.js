import express from "express"
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { processPayment, sendStripeAPIKey } from "../controllers/paymentController.js";

const router=express.Router();

router.post("/payment/process",isAuthenticatedUser,processPayment);
router.get("/stripeApiKey",sendStripeAPIKey);

export default router;