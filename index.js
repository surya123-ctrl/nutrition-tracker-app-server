const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uri = 'mongodb+srv://suryatomar303:Nutri123@cluster0.4svgirh.mongodb.net/?retryWrites=true&w=majority';
// Importing models
const userModel = require('./models/userModel');
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));



const app = express();
app.use(express.json());

app.post('/register', (req, res) => {
    const user = req.body;
    console.log(user);
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        else {
            bcrypt.hash(user.password, salt, async (err, hashedPassword) => {
                if (err) throw err;
                else {
                    user.password = hashedPassword;
                    try {
                        const createdUser = await userModel.create(user);
                        res.status(201).send({ message: "User Created Successfully", createdUser })
                    }
                    catch (error) {
                        res.status(500).send({ message: "Unable to create a user", error });
                    }
                }
            })
        }
    })

})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})