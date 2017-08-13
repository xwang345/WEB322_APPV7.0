const mongoose = require('mongoose');
const chalk = require('chalk');
const bcrypt = require('bcryptjs');
var crypto = require('crypto');
let Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var userSchema = new Schema({
    "user": {type: String, unique: true},
    "password": String
});
var Comment; // to be defined on new connection (see initialize)

var dbURI = "mongodb://xwang345:Xlxc101302#@ds145395.mlab.com:45395/web322_a7"

module.exports.initialize = () => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("===    MongoDB for auth initialize       ===");
    console.log("===                                      ===");
    console.log("============================================");
    console.log("\n")
    console.log(">>> DB dbURI: " + dbURI + " <<<");
    console.log("\n")
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(dbURI);
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            Comment = db.model("users", userSchema);
            // Comment.remove({ }, function (err) { });
            resolve("Secess initialize MongoDB");
        });
    });
};

module.exports.registerUser = (userData) => {
    console.log("============================================");
    console.log("===                                      ===");
    console.log("===           registerUser Function      ===");
    console.log("===                                      ===");
    console.log("============================================");
    console.log("\n");
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match.");
        } else {
            let newUser = new Comment(userData);
             bcrypt.genSalt(10, function(err, salt) { // Generate a "salt" using 10 rounds
                if (err) {
                    reject("There was an error encrypting the password");
                }
                bcrypt.hash(userData.password, salt, function(err, hash) { // encrypt the password: "myPassword123"
                    // TODO: Store the resulting "hash" value in the DB
                    console.log(chalk.yellow(hash));
                    newUser.password = hash;
                    console.log(chalk.red(newUser));
                    newUser.save((err) => {
                        console.log(chalk.blue("===   Object is saving in the database.  ==="));
                        console.log(chalk.blue("============================================"));
                        console.log(userData);
                        console.log(chalk.blue("============================================"));
                        console.log(chalk.blue("This is User object id from userSchema: " + newUser._id));
                        console.log(chalk.green(newUser));
                        resolve();
                        //newUser.save(callback);
                    }).catch((err) => {
                        if (err) {
                            if (err.code == 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: ${user}");
                            }
                        }
            // reject("There was an error creating the user222222");
                    });
                });
             });
        }});
    }

module.exports.checkUser = (userData) =>{
    console.log(chalk.blue("============================================="));
    console.log(chalk.blue("===                                       ==="));
    console.log(chalk.blue("===     This is checkUser function        ==="));
    console.log(chalk.blue("===                                       ==="));
    console.log(chalk.blue("============================================="));
    // console.log(">>> userName: " + Comment.find({},) + " <<<");
    console.log(">>> userName: " + chalk.green(userData.user) + " <<<");
    console.log(">>> userPasswords: " + chalk.green(userData.password) + " <<<");
    // hash = user.password;
    // console.log(">>> hash: " + chalk.green(hash) + " <<<");


    return new Promise((resolve, reject) => {
        Comment.find({user: userData.user}).exec().then((user) => {
            console.log(chalk.bgCyan("Sucess!!!!!!" + user));
            if (user == null) {
                reject('Unable to find user: ' + userData.user);
            } else {
                hash = user[0].password;
                // bcrypt.hash(JSON.stringify(userData.password), 10, function(err, hash) {
                //     if (err) { throw (err); }

                //     // Load hash from your password DB.
                //     bcrypt.compare('123dsfdsfdaafadsfa', hash).then(function(res) {
                //         console.log(chalk.green("Success check password"));
                //         res == true;
                //         resolve();
                //     });
                //     bcrypt.compare('sdafdsafsdafsdaf', hash).then(function(res) {
                //         console.log(chalk.red("Failed check password"));
                //         res == false;
                //         reject("ERR");
                //     });
                // });
                console.log(chalk.bgMagenta("Staring compare the password"));
                bcrypt.compare(userData.password, hash, (err, valid) => {
                    if (err) { throw (err); };
                    if (valid == true) {
                        // password matches
                        console.log(chalk.green("Match the password"));
                        resolve();
                    }  else if (valid == false) {
                        // password does not match
                        console.log(chalk.red("Unable to match the password"));
                        reject("The Password is worry for user: " + userData.user);
                    }
                });
            }
        }).catch((err) => {
            if (err) { throw (err); };
            console.log(chalk.bgCyan("There is Error"));
            reject("Unable to find user: " + userData.user);
        });
    });
};

module.exports.updatePassword = (userData) => {
    return new Promise((resolve, reject) => {
        Comment.update({ user: userData.user },
        { $set: { password: hash } },
        { multi: false }).exec().then((res) => {
            resolve();
        }).catch((err) => {
            reject("There was an error updating the password for " + userData.user);
        });
    });
};