const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userDB'
)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    userUniqueId: {
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    userAge: {
        type: Number,
        required: true
    }
});

// User Model
const User = mongoose.model('User', userSchema);

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home Route - Display Users
app.get("/", async (req, res) => {
    try {
        const users = await User.find({});
        res.render("home", { data: users });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching users");
    }
});

// Add User Route
app.post("/", async (req, res) => {
    try {
        const newUser = new User({
            userUniqueId: req.body.userUniqueId,
            userName: req.body.userName,
            userEmail: req.body.userEmail,
            userAge: req.body.userAge
        });

        await newUser.save();
        const users = await User.find({});
        res.render("home", { data: users });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding user");
    }
});

// Delete User Route
app.post('/delete', async (req, res) => {
    try {
        const requestedUserUniqueId = req.body.userUniqueId;
        await User.deleteOne({ userUniqueId: requestedUserUniqueId });

        const users = await User.find({});
        res.render("home", { data: users });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting user");
    }
});

// Update User Route
app.post('/update', async (req, res) => {
    try {
        const { userUniqueId, userName, userEmail, userAge } = req.body;

        await User.findOneAndUpdate(
            { userUniqueId: userUniqueId },
            {
                userName: userName,
                userEmail: userEmail,
                userAge: userAge
            },
            { new: true } // Return updated document
        );

        const users = await User.find({});
        res.render("home", { data: users });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating user");
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});