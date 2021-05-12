const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

var connectionString = process.env.MONGO_CONNECT;

var userSchema = new Schema({
    "username": {
        type: String,
        unique: true
    },
    "password": String,
    "balance": {
        type: Number,
        default: 0
    }
});

let User;

module.exports.connect = function() {
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection(connectionString, { useUnifiedTopology: true});
        db.on('error', err => {
            reject(err);
        });

        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        bcrypt.hash(userData.password, 10).then(hash => {

            userData.password = hash;

            let newUser = new User(userData);

            newUser.save(err => {
                if (err) {
                    if (err.code == 11000) {
                        reject("User Name already taken");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }

                } else {
                    resolve("User " + userData.userName + " successfully registered");
                }
            });
        })
            .catch(err => reject(err));
    });
};

module.exports.loginUser = function (userData) {
    return new Promise(function (resolve, reject) {

        User.findOne({ userName: userData.userName })
            .exec()
            .then(user => {
                bcrypt.compare(userData.password, user.password).then(res => {
                    if (res) {
                        resolve(user);
                    } else {
                        reject("Incorrect password for user " + userData.userName);
                    }
                });
            }).catch(err => {
                reject("Unable to find user " + userData.userName);
            });
    });
};