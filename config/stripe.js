import Stripe from "stripe";
import "./env.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;
