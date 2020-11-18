const stripe = Stripe(
    "pk_test_51HnDQIKVLFXCQwdvxAnY63lYg8h8TtkY6Fki6NkyG8XRS8VEhuy01rQin4qCVNbJ4RYyNffeNIw4WDsT5XWaIULp00XWg3Geo7"
);

// elements
const checkoutButton = document.getElementById("checkout-button");
const buttonPayment = document.querySelector("#submit");

// settings
buttonPayment.disabled = true;

let purchase = {
    items: [{ id: "dualSense" }],
};

// Request Session
checkoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/create-session", {
            method: "POST",
        });

        const session = await response.json();
        const result = await stripe.redirectToCheckout({ sessionId: session.id });

        if (result.error) {
            console.log(result.error.message);
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
});

// Request Payment Intent
const createPaymentIntent = async (url) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(purchase),
        });

        const data = await response.json();

        // Stripe styles
        let elements = stripe.elements();
        let styles = {
            base: {
                color: "#32325d",
                fontFamily: "Roboto, sans-serif",
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#32325d",
                },
            },
            invalid: {
                fontFamily: "Roboto, sans-serif",
                color: "#fa755a",
                iconColor: "#fa755a",
            },
        };

        // Changes in the DOM (depending on the state)

        let card = elements.create("card", { style: styles });
        card.mount("#card-element");
        card.on("change", function (event) {
            buttonPayment.disabled = event.empty;
            document.querySelector("#card-error").textContent = event.error
                ? event.error.message
                : "";
        });

        // form element
        const form = document.getElementById("payment-form");

        // When the form data is submitted
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            payWithCard(stripe, card, data.clientSecret);
        });
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

// A payment attempt is created immediately
createPaymentIntent("/create-payment-intent");

// Card payment function
const payWithCard = async (stripe, card, clientSecret) => {
    // The loader is activated
    loading(true);

    // Stripe is used to confirm the payment
    try {
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
            },
        });

        if (result.error) {
            showError(result.error.message);
        } else {
            orderComplete(result.paymentIntent.id);
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

// Everything that has to do with the styles (depending on the status of the payment)

// When the order was resolved successfully
const orderComplete = () => {
    loading(false);
    document.querySelector(".result-message").classList.remove("hidden");
    document.querySelector("button").disabled = true;
};

// When there is an error with the payment
const showError = (errorMsgText) => {
    loading(false);
    var errorMsg = document.querySelector("#card-error");
    errorMsg.textContent = errorMsgText;
    setTimeout(function () {
        errorMsg.textContent = "";
    }, 4000);
};

// Loading interface
const loading = (isLoading) => {
    if (isLoading) {
        document.querySelector("button").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("button").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
};
