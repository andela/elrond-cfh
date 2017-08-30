/**
 * Module dependencies.
 */
 require('dotenv').config();
// var express = require('express'),
//     fs = require('fs'),
//     passport = require('passport'),
//     logger = require('mean-logger'),
//     io = require('socket.io');
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const app = express();
const fs = require('fs');
const passport = require('passport');
const logger = require('mean-logger');
const io = require('socket.io');

//  var express = require('express'),
//     cookieParser = require('cookie-parser'),
//     expressSession = require('express-session'),
//     MongoStore = require('connect-mongo')(expressSession),
//     app = express();


/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Load configurations
//if test env, load example file
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('./config/config'),
    auth = require('./config/middlewares/authorization'),
    mongoose = require('mongoose');

//Bootstrap db connection
const db = mongoose.connect(config.db, (err) => {
    if (err)
        throw err
});

//Bootstrap models
const models_path = __dirname + '/app/models';
const walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        const newPath = path + '/' + file;
        const stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

//bootstrap passport config
require('./config/passport')(passport);

var app = express();

app.use(function(req, res, next){
// store: new MongoStore({
//     mongooseConnection: mongoose.connection
// });
// const app = express();
app.use(cookieParser());
app.use(expressSession({
    secret: 'secret',
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: true
}));

app.use(function(req, res, next) {
    next();
});

//express settings
require('./config/express')(app, passport, mongoose);

//Bootstrap routes
require('./config/routes')(app, passport, auth);

//Start the app by listening on <port>
const port = config.port;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
//game logic handled here
require('./config/socket/socket')(ioObj);
console.log('Express app started on port ' + port);

//Initializing logger
logger.init(app, passport, mongoose);

//expose app
exports = module.exports = app;
