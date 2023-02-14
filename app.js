const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

mongoose.set('strictQuery', true);
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
    extended : true
}));

mongoose.connect("mongodb://localhost:27017/word_weaver");
const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    username : String,
    password : String,
    headings : [String],
    contents : [String]
});
const USER = mongoose.model("User",userSchema);

app.get("/",function(req,res) {
    res.render("homepage");
});

app.get("/register",function(req,res) {
    res.render("register");
});

app.get("/login",function(req,res) {
    res.render("login");
});

app.get("/main-blog",function(req,res) {
    res.render("main-blog",{
        NAME : "Temp User",
        headings : ["Temp heading"],
        contents : ["Temp content"]
    });
});

app.post("/register",function(req,res) {
    console.log(req.body);
    const tempUser = new USER({
        name : req.body.newName,
        email : req.body.newEmail,
        username : req.body.newUsername,
        password : md5(req.body.newPassword),
        headings : [],
        contents : []
    });
    tempUser.save(function(err) {
        if(err) {
            res.send(err);
        }
        else {
            res.render("main-blog",{
                NAME : tempUser.name.toUpperCase(),
                headingsArray : tempUser.headings,
                contentsArray : tempUser.contents
            });
        }
    });
});

var loggedinUserEmail = "";

app.post("/login",function(req,res) {
    USER.findOne({email : req.body.userEmail},function(err,foundUser) {
        if(err) {
            res.send(err);
        }
        else if(foundUser.password === md5(req.body.userPassword)) {
            loggedinUserEmail = foundUser.email;
            res.render("main-blog",{
                NAME : foundUser.name.toUpperCase(),
                headingsArray : foundUser.headings,
                contentsArray : foundUser.contents
            });
        }
    });
});

app.post("/main-blog", async function(req, res) {
    console.log(req.body, loggedinUserEmail);
    await USER.updateOne(
        {email: loggedinUserEmail},
        {$push: {headings: req.body.blogHeading, contents: req.body.blogContent}}
    );
    const temporary_user = await USER.findOne({email: loggedinUserEmail}).exec();
    res.render("main-blog", {
        NAME: temporary_user.name,
        headingsArray: temporary_user.headings,
        contentsArray: temporary_user.contents
    });
});

app.listen(3000,function() {
    console.log("Server is running on port 3000.");
});