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