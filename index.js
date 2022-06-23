#!/usr/bin/env node
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const fs = require('fs');
const _ = require('lodash');
const db = require('@enzon3/txtdb');

//listen on port 8080
app.listen(8080, () => {
    console.log('listening on port 8080');
});


//middleware
app.use(express.static('public/'));
app.use(cors());
//static files unrelated to html
app.use(express.static('public/uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//set up db
const settings = {
    dbFile: './db/db.txt',
    allowOverwrite: false,
    delimiter: '|',
    enableCache: true
};
db.setup(settings);

app.use(fileUpload({
    createParentPath: true
}));


//routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

//upload multiple files, each going to its own folder inside public/uploads
app.post('/api/upload', async (req, res) => {
    //check if no files were uploaded
    if (!req.files) {
        return res.status(400).send('No files were provided.');
    }

    //check token
    if (!req.body.token) {
        return res.status(401).send('No token provided.');
    }
    const token = req.body.token;
    const username = req.body.username;
    const user = await db.getKey(username);
    if (!user || user !== token) {
        return res.status(401).send('Invalid token.');
    }

    //get multiple files
    //loop all files
    _.forEach(_.keysIn(req.files.data), (key) => {
        let pckgData = req.files.data[key];
        
        //move photo to uploads directory
        pckgData.mv(`./public/uploads/${req.body.title}/` + pckgData.name);
    });

    res.send('Package uploaded!');
});

app.get('/api/login', async (req, res) => {
    //check if no files were uploaded
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).send('No username or password provided.');
    }

    //check if username exists
    let user = await db.getKey(`${username}`);
    if (!user) {
        return res.status(400).send('Username does not exist.');
    }

    //create token from username and password
    let token = crypto.createHash('sha256').update(`${username},${password}`).digest('hex');

    //check if token matches
    if (token !== user) {
        return res.status(401).send('Invalid username or password.');
    }

    //login successful
    return res.send(user);
});

app.post('/api/createAccount', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send('No username or password provided.');
    }

    //merge username and password into one token
    let token = crypto.createHash('sha256').update(`${req.body.username},${req.body.password}`).digest('hex');

    //set token in db
    try {
        db.setKey(req.body.username, token);
    }
    catch (err) {
        res.status(400).send('Username already exists.');
    }

    //create account successful
    res.send('Account created!');
});

//get package info
app.get('/api/getPackageInfo', async (req, res) => {
    //check if no files were uploaded
    if (!req.query.title) {
        return res.status(400).send('No title provided.');
    }

    //get package info using fs in the uploads directory
    try {
        let packageInfo = await fs.promises.readFile(`./public/uploads/${req.query.title}/pckg.json`, 'utf8');
    }
    catch (err) {
        return res.status(404).send('Package not found');
    }

    //parse package info
    packageInfo = JSON.parse(packageInfo);

    //send package info
    res.send(packageInfo);
});