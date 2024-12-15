// Imports
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.DB_URI)
  .then(() => console.log("Connected to the database"))
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1); // Exit the process if the database connection fails
  });


// Serve static files (like images, CSS, JavaScript) from the 'uploads' folder

app.use(express.static(path.join(__dirname, 'public')));


// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: /*process.env.SESSION_SECRET || */'default_secret_key',
    saveUninitialized: true,
    resave: false,
  })
);
app.use((req, res, next) => {
  if (req.session.message) {
      res.locals.message = req.session.message; // Assign to locals for templates
      req.session.message = null;              // Clear session after assignment
  } else {
      res.locals.message = null;               // Ensure `message` is always defined
  }
  next();
})


// Set template engine and views folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Use routes
app.use("/", require("./routes/routes"));         

// Handle 404 errors
app.use((req, res) => {
  res.status(404).render('404', { title: "Page Not Found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
