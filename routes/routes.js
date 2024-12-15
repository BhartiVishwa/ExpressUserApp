const express = require('express');
const router = express.Router();
const User = require("../models/users");
const multer = require('multer');
const path = require ('path');

// Image upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Path to store uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname); // Unique file naming based on timestamp
    }
});

const upload = multer({ storage: storage }).single('image'); // Middleware for single image upload


// Home Route - Fetch and display users
router.get('/', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from the database
        
        const message = req.session.message;
        req.session.message = null;

        res.render('index', {
            title: "Home Page",
            users: users, // Pass users as an array to the EJS template
            message: req.session.message // Pass session message for feedback
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.render('index', {
            title: "Home Page",
            users: [], // Empty users array on error
            message: { type: 'danger', message: 'Failed to load users' },
        });
    }
});


// Route to render the Add User form
router.get('/add-user', (req, res) => {
    res.render('add_user', { 
        title: "Add User",
         message: req.session.message || null });
});

// Route to handle user creation
router.post('/add-user', upload, async (req, res) => {
    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file ? req.file.filename : null,
        });
        await newUser.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully!',
        };

        res.redirect('/'); // Redirect carries session message to the home page
    } catch (err) {
        console.error("Error adding user:", err);
        req.session.message = {
            type: 'danger',
            message: 'Failed to add user. Please try again.',
        };
        res.redirect('/add-user');
    }
});




// Route to render Edit User form
router.get('/edit-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render('edit_user', { title: "Edit User", user });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.redirect('/');
    }
});

// Route to handle Edit User form submission
router.post('/edit-user/:id', upload, async (req, res) => {
    try {
        const updatedData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        };
        if (req.file) {
            updatedData.image = req.file.filename; // Update image if a new one is uploaded
        }

        await User.findByIdAndUpdate(req.params.id, updatedData);
        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        console.error("Error updating user:", err);
        req.session.message = {
            type: 'danger',
            message: 'Failed to update user.',
        };
        res.redirect(`/edit-user/${req.params.id}`);
    }
});

// Route to handle Delete User
router.get('/delete-user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        req.session.message = {
            type: 'success',
            message: 'User deleted successfully!',
        };
    } catch (err) {
        console.error("Error deleting user:", err);
        req.session.message = {
            type: 'danger',
            message: 'Failed to delete user.',
        };
    }
    res.redirect('/');
});



// Route to render the About Page
// router.get('/about', (req, res) => {
//     res.render('about', { title: "About Page" });
// });

// Export the router
module.exports = router;

