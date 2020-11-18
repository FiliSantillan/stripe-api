const express = require("express");
const path = require("path");

// Settings
const port = 3000;

// Initializations
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use(require("./routes/routes"));

// Static files
app.use(express.static(path.join(__dirname, "/../public")));

// Start server
app.listen(port, () => {
    console.log(`Server run on port ${port}`);
});
