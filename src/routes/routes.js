const { Router } = require("express");
const path = require("path");
const router = Router();

// Settings
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const DOMAIN = "http://localhost:3000";
const calculateOrderAmount = (items) => {
    return 150000;
};

// Home
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/../../public/index.html"));
});

// Create stripe session
router.post("/create-session", async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "mxn",
                    product_data: {
                        name: "DualSense",
                        images: [
                            "https://images-na.ssl-images-amazon.com/images/I/71y%2BUGuJl5L._SL1500_.jpg",
                        ],
                    },
                    unit_amount: 150000,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${DOMAIN}/success.html`,
        cancel_url: DOMAIN,
    });
    res.json({ id: session.id });
});

// Create stripe payment intent
router.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "mxn",
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

module.exports = router;
