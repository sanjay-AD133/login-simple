if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}


const express = require("express")
const app=express()
const bycrpt = require("bcrypt")
const passport = require("passport")
const initializePassport = require("./passport-config")

const flash=require("express-flash")
const session=require("express-session")
const methodOverride=require("method-override")

initializePassport(
    passport,
    name => users.find(user => user.name === name),
    id =>users.find(user =>user.id ===id)
    )
const users =[]

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

//config login post
app.post("/login",chechNotAuthenticated,passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash:true
}))





//config register post
app.post("/register",chechNotAuthenticated,async(req,res)=>{

    try{
        const HashedPassword=await bycrpt.hash(req.body.password,10)
        users.push({
            id:Date.now().toString(),
            name:req.body.name,
            password:HashedPassword,
        })
        console.log(users);
        res.redirect("/login")
    }
    catch(e){
         console.log(e); 
         res.redirect("/register")
    }
})



//routes
app.get('/',chechAuthenticated,(req,res)=>{
    res.render("index.ejs",{name: req.user.name});
})

app.get('/login',chechNotAuthenticated,(req,res)=>{
    res.render("login.ejs");
})

app.get('/register',chechNotAuthenticated,(req,res)=>{
    res.render("register.ejs");
})
//end routes

app.delete("/logout",(req,res)=>{
    req.logout(req.user,err =>{
        if(err) return next(err)
        res.redirect("/")
    })
})

function chechAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function chechNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/")    
    }
    next()
    
}

app.listen(5000);   
