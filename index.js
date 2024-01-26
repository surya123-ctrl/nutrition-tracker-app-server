const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const uri = 'mongodb+srv://suryatomar303:Nutri123@cluster0.4svgirh.mongodb.net/?retryWrites=true&w=majority';
// Importing models
const userModel = require('./models/userModel');
const foodModel = require('./models/foodModel');
const trackingModel = require('./models/trackingModel');
const isAuthenticated = require('./isAuthenticated');
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));



const app = express();
app.use(express.json());
app.use(cors());
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
                        res.status(201).send({ message: "User Created Successfully!", createdUser })
                    }
                    catch (error) {
                        res.status(500).send({ message: "Unable to create a user", error });
                    }
                }
            })
        }
    })

})

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await userModel.findOne({ email: email })
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    jwt.sign({ email: email }, "jwt-secret-key", (err, token) => {
                        if (!err) {
                            console.log("token", token);
                            res.send({ token: token, message: "Logged In Successfully!", name: user.name, userId: user._id });
                        }
                        else {
                            console.log("Error in generating Token");
                            res.status(500).send({ message: "Error in generating Token" })
                        }
                    })
                }
                else {
                    res.status(403).send({ message: "Invalid Password" });
                }
            })
        }
        else {
            res.status(404).send({ message: "Invalid Email" });
        }
    }
    catch (error) {
        res.status(500).send({ message: "Error in Logging In", error });
    }
})

app.get('/foods', isAuthenticated, async (req, res) => {
    try {
        const food = await foodModel.find();
        res.status(200).send(food);
    }
    catch (error) {
        res.status(500).send({ message: "Error in getting Food Data", error });
    }
})

// search food by name
app.get('/foods/:name', isAuthenticated, async (req, res) => {
    try {
        console.log(req.params.name);
        const food = await foodModel.find({ name: { $regex: req.params.name, $options: 'i' } });
        if (food.length) res.json(food);
        else res.status(404).send({ message: "Unable to find food" });
    }
    catch (error) {
        res.status(500).send({ message: "Unable to find food" });
    }
})
app.post('/track', isAuthenticated, async (req, res) => {
    const trackData = req.body;
    try {
        console.log("trackData", trackData);
        const data = await trackingModel.create(trackData);
        res.status(201).send({ message: "Food added successfully" });
    }
    catch (error) {
        console.log("ERROR IN ADDING FOOD TO TRACKING DATABASE");
        res.status(500).send({ message: "Server Error! Can't add this item right now." });
    }

})

app.get('/track/:userId/:date', isAuthenticated, async (req, res) => {
    const userId = req.params.userId;
    const date = new Date(req.params.date).toLocaleDateString();
    console.log(date);
    try {
        const foods = await trackingModel.find({ userId: userId, eatenDate: date }).populate('userId').populate('foodId');
        res.status(200).json(foods);
    }
    catch (error) {
        console.log('ERROR GETTING USER\'S FOODS FROM THE DATABASE \nUSER ID: ', userId, '\nERROR: ', error);
        res.status(500).send({ message: "ERROR GETTING USER'S FOODS FROM THE DATABASE " })
    }
})
app.get('/', (req, res) => {
    res.send("Hello World")
})
app.listen(8000, () => {
    console.log("Server is running on port 8000")
})
//Tracking collection
// __id, user_id, food_id, date, quantity