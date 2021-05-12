const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');

const yahooStockPrices = require('yahoo-stock-prices');

var connectionString = process.env.MONGO_CONNECT;

var userSchema = new Schema({
    "username": {
        type: String,
        unique: true
    },
    "password": String,
    "availableBalance": {
        type: Number,
        default: 0
    },
    "totalBalance": {
        type: Number,
        default: 0
    },
    "stocks": [{"name": String,
                "bought": [{"price": Number, "quantity": Number, "date": { type: Date, default: Date.now }}],
                "sold": [{"price": Number, "quantity": Number, "date": { type: Date, default: Date.now }}],
                "totalShares": Number      
    }] 
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
                    resolve("User " + userData.username + " successfully registered");
                }
            });
        })
            .catch(err => reject(err));
    });
};

module.exports.loginUser = function (userData) {
    return new Promise(function (resolve, reject) {

        User.findOne({ username: userData.username })
            .exec()
            .then(user => {
                bcrypt.compare(userData.password, user.password).then(res => {
                    if (res) {
                        resolve(user);
                    } else {
                        reject("Incorrect password for user " + userData.username);
                    }
                });
            }).catch(err => {
                reject("Unable to find user " + userData.username);
            });
    });
};

module.exports.addAmount = function (userData) {

    return new Promise(function (resolve, reject) {
        const user = await User.findOne({ username: userData.username});

        user.availableBalance += userData.amount;

        user.save()
        .then(user =>{
            resolve(user);
        })
        .catch(err =>{
            reject(err);
        });
    });
}

module.exports.getCurrentPrice = function (stock) {
    return new Promise(function (resolve, reject) {
        yahooStockPrices.getCurrentPrice(stock)
        .then(price => {
            resolve(price);
        })
        .catch(err => {
            reject("There was an error getting the price for " + stock);
        })
    });
}

module.exports.calculateTotalBalance = function(userData) {
    return new Promise(function (resolve, reject) {
        const user = await User.findOne({ username: userData.username});
        let totalInShares; 
        user.stocks.forEach(stock => {
            if (stock.totalShares > 0)
            {
                totalInShares += stock.totalShares * (await yahooStockPrices.getCurrentPrice(stock.name));
            }
        });
        
        user.totalBalance = totalInShares + availableBalance;
        user.save()
            .then(user =>{
                resolve(user);
            })
            .catch(err =>{
                reject(err);
            });
    });
}

module.exports.buyShare = function (userData, stock) {
    return new Promise(function (resolve, reject) {
        const price = await yahooStockPrices.getCurrentPrice(stock.name);
        const user = await User.findOne({ username: userData.username });

        if ((price * quantity) > user.availableBalance) {
            reject("Your balance is less than the total price!");
        }
        else {
            let index = user.stocks['name'].indexOf(stock.name);
            if(index == -1) {
                user.stocks.push({
                    "name": stock.name,
                    "bought": {
                        "price": price,
                        "quantity": stock.quantity
                    }
                });
            }
            else {
                user.stocks[index].bought.push({
                    "price": price,
                    "quantity": stock.quantity
                });
            }

            user.stocks[index].totalQuantity += stock.quantity;
            user.availableBalance -= (price * stock.quantity);
            

            user.save()
            .then(user =>{
                resolve(user);
            })
            .catch(err =>{
                reject(err);
            });
            
        }
    });
}

module.exports.sellShare = function (userData, stock) {
    return new Promise(function (resolve, reject) {
        const price = await yahooStockPrices.getCurrentPrice(stock.name);
        const user = await User.findOne({ username: userData.username });
        let index = user.stocks['name'].indexOf(stock.name);
        if((index == -1) || user.stocks[index].totalShares == 0) {
            reject("You don't own any shares of " + stock.name);
        }
        else{
            if(user.stock[index].totalShares < stock.quantity) {
                reject("Your total amount of shares is less than the amount requested!");
            }
            else{
                user.stocks[index].sold.push({
                    "price": price,
                    "quantity": stock.quantity
                });

                user.stocks[index].totalQuantity -= stock.quantity;
                user.availableBalance += (price * stock.quantity);
                
                user.save()
                .then(user =>{
                    resolve(user);
                })
                .catch(err =>{
                    reject(err);
                });
            } 
        }
    });
}