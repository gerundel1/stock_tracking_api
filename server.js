// TASK 2:

// Build a stock market tracking system.

// Section 1


// > Your system should have support for users to login/logout.
// > Users should be able to add balance to their wallet.
// > Users should be able to buy/sell shares (transactions need not be stored)
// > Users should be able to subscribe to an endpoint that should provide live rates.
// > Users should have the ability to see their portfolio

// The code you write is expected to be good quality, it should:

// * Have correct formatting
// * Have resilient error handling
// * Exceptions should appropriate handling
// * Architecture should be scalable, easy to maintain
// * Tricky parts of the code should have proper documentation
// ** Database queries should be efficient

// -------------

// Ideally we would like to see async non blocking code, but we would understand if you feel it’s too much effort for an assessment. Along with your code, please provide instructions on how to run it.
// Make a small doc highlighting the sections you’re proud of! (It can also include other github repositories you have worked on in the past)
// Just show us you can write excellent code and that would be enough! Best of luck!

var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const clientSessions = require("client-sessions");
require('dotenv').config();
const mongoose = require("mongoose");

const connectionString = process.env.MONGO_CONNECT;
const data_module = require("./data-module");

const bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: true }));

const exphbs = require('express-handlebars');
const { decodeBase64 } = require("bcryptjs");

app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    defaultLayout: 'main'
}));

app.set('view engine', '.hbs');
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// log when the DB is connected
mongoose.connection.on("open", () => {
  console.log("Database connection open.");
});

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "Speer_assessment",
    duration:  3 * 60 * 1000, // duration of the session in milliseconds (3 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));



function ensureUser(req, res, next) {
if (!req.session.user) {
    res.redirect("/login");
} else {
    next();
    }
}

data_module.connect().then(()=>{
app.listen(HTTP_PORT, ()=>{console.log("API listening on: " + HTTP_PORT)});
})
.catch((err)=>{
    console.log("unable to start the server: ", err.message);
    process.exit();
});