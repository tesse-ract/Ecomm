import Stripe from "stripe"
 const stripe=Stripe(process.env.STRIPE_SECRET_KEY);


const processPayment=async(req,res,next)=>{
    const paymentIntent=await stripe.paymentIntents.create({
        amount:req.body.amount,
        currency:"inr",
        automatic_payment_methods:{
            enabled:true,
        },
    });

    res.status(200).json({
        success:true,
        client_secret:paymentIntent.client_secret
    })
}

const sendStripeAPIKey=async(req,res,next)=>{
    res.status(200).json({
        stripeApiKey:process.env.STRIPE_API_KEY
    })
}

export {processPayment,sendStripeAPIKey}