#!/usr/bin/env node
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const fs = require('fs');
const _ = require('lodash');
const db = require('@enzon3/txtdb');
const { default: fetch, Headers } = require("node-fetch-cjs");
require('dotenv').config();

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
    dbFile: `db/db.txt`,
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

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/html/login.html');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/html/dashboard.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/html/register.html');
});

app.post('/api/verifyCaptcha', async (req, res) => {
    //get recaptcha response
    var response = req.query.response;
    //recaptcha site verification
    fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RC_SECRET}&response=${response}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
    }).then(res => res.json())
    .then(json => {
        console.log(json);
        //convert json to javascript object
        var obj = JSON.parse(JSON.stringify(json));
        if(obj.success == true){
            res.send('true');
        }
        else {
            res.send('false');
        }
    });
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

    let pckgTitle = `${username}@${req.body.title}`;

    //check if output dir is empty
    const files = fs.readdirSync(`./public/uploads/${pckgTitle}`);
    if (files.length > 0) {
        return res.status(401).send('Package already exists.');
    }

    //check if package name has been provided
    if (!req.body.packageName) {
        return res.status(400).send('No package name provided.');
    }

    //check if package name is valid
    const packageName = req.body.packageName;
    if (!packageName.match(/^[a-zA-Z0-9_]+$/)) {
        return res.status(400).send('Invalid package name.');
    }

    //get multiple files
    //loop all files
    _.forEach(_.keysIn(req.files.data), (key) => {
        let pckgData = req.files.data[key];
        
        //move package to uploads directory
        pckgData.mv(`./public/uploads/${pckgTitle}/` + pckgData.name);
    });

    //set package owner
    fs.writeFileSync(`./public/uploads/${pckgTitle}/PCKG_OWN.txt`, username);

    res.send('Package uploaded!');
});

app.post('/api/login', async (req, res) => {
    //check if no files were uploaded
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).send('No username or password provided.');
    }

    //check if username exists
    let user = await db.getKey(`${username}`);
    if (!user) {
        return res.status(404).send('Account does not exist.');
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

app.post('/api/register', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).send('No username or password provided.');
    }

    //merge username and password into one token
    let token = crypto.createHash('sha256').update(`${req.body.username},${req.body.password}`).digest('hex');

    //check if username has blacklisted characters
    if (/[^a-zA-Z0-9]/.test(req.body.username)) {
        return res.status(400).send('Username contains invalid characters.');
    }

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
    let packageInfo;
    try {
        packageInfo = await fs.promises.readFile(`./public/uploads/${req.query.title}/pckg.json`, 'utf8');
    }
    catch (err) {
        return res.status(404).send('Package not found');
    }

    //parse package info
    packageInfo = JSON.parse(packageInfo);

    //send package info
    res.send(packageInfo);
});

//search for packages given a search term
app.get('/api/search', async (req, res) => {
    //check if no files were uploaded
    if (!req.query.q) {
        return res.status(400).send('No search term provided.');
    }

    //get all files in the uploads directory
    let files;
    try {
        files = await fs.promises.readdir('./public/uploads/');
    }
    catch (err) {
        return res.status(404).send('No packages found.');
    }

    //filter files by search term
    let searchResults = _.filter(files, (file) => {
        return file.includes(req.query.q);
    }
    );

    //send search results
    res.send(searchResults);
});