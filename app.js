// require('dotenv').config();
// const { PORT } = process.env;
var {Mongo_Url} = require('./key')
var mongoose = require('mongoose');
mongoose.set('strictQuery', true)
const express = require('express');
const path = require('path')
mongoose.connect(Mongo_Url).then( () => console.log("Mongodb is connected!"))
const app= require('express')();
const http = require('http').Server(app)
let port = process.env.port || 5500;
const User = require('./models/userModels')
const bcrypt = require('bcrypt');

const userRoute = require('./routes/uswrRoute');
const session = require('express-session');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use('/',userRoute)
function randomString(length) {
    const result = Math.random().toString(length).substring(2, 7);

    return result;
}
const googlesignup = async (profile) => {

    const passwordhash = await bcrypt.hash(profile._json.sub, 10);
  const getdata = await User.findOne({ name: profile._json.name })
        if (getdata) {
            let random = profile._json.name + randomString(36);



            const user = new User({
                name: random,
                email: profile._json.email,
                image: profile._json.picture,
                password: passwordhash

            })
            const userdatas = user.save();
            return userdatas
        }
        const user = new User({
            name: profile._json.name,
            email: profile._json.email,
            image: profile._json.picture,
            password: passwordhash

        })
        const userdatas = user.save();
         return userdatas

    


}
passport.use(new GoogleStrategy({
    clientID: '718607221666-3hba4ke9t5p5rtalfvv0pj10nonoe3qs.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: '/auth/google/callback'
}, async function(accessToken, refreshToken, profile, done) {
    // This function is called when the authentication is successful
    // You can handle the user profile data here or save it to a database
    try {
        const email = profile._json.email;
        const password = profile._json.sub;
    
        const userData = await User.findOne({ email: email });
        // agar email correct hai toh password check karo varna else ka message chala do 
        if (userData) {
          // agar Password correct hai toh dashboard namak function par redirect kar do varna else ka message chala do
          const passwordMatch = await bcrypt.compare(password, userData.password);
          if (passwordMatch) {
            var user = userData
            return done(null, user);


          } else {
            googlesignup(profile).then(user => {
              console.log(user);
                console.log(user.name)
               return done(null, user)
                
  
  
            })
            .catch(error => {
              console.log(error);
            });
  
            // console.log(user)
            // console.log(user.name)
            // let variable = false;
            // while (!variable) {
            //   if(user.name === undefined){
            //     console.log(variable)
            //   }
            //   else{
            //     variable = true;
            //     return done(null, user)
            //   }
            // }
                       
          }
        }
        else {

          googlesignup(profile).then(user => {
            console.log(user);
              console.log(user.name)
             return done(null, user)
              


          })
          .catch(error => {
            console.log(error);
          });

          // console.log(user)
          // console.log(user.name)
          // let variable = false;
          // while (!variable) {
          //   if(user.name === undefined){
          //     console.log(variable)
          //   }
          //   else{
          //     variable = true;
          //     return done(null, user)
          //   }
          // }
        }
      } catch (error) {
        console.log(error);
      }
    
    


}

));
app.use(
    session({
      secret: 'YOUR_SESSION_SECRET',
      resave: false,
      saveUninitialized: false,
    })
  );
  

app.use(passport.initialize());
// app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Redirect the user after successful authentication
        res.redirect('/testauth');
    }
);
passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    // Here, you should retrieve the user data from a database
    // using the provided id and attach it to the request object
      done(null, user);
  });
  






// send file frontend
app.use(express.static(path.join(__dirname,"./build")))
app.get('*',(req, res) => {
    res.sendFile(path.join(__dirname,"./build/index.html"),
    function(err){
        res.status(500).send(err)
    }
    )
})
// app.get("/login", (req, res) => {
//     res.json({status: "sucess"})
// })
// const server = http.createServer(app)
// const io = new Server(http, {
//     cors:{
//         origin:"http://localhost:3000",
//         methods:["GET","POST"],
//     }
// })
// // var usp = io.of('/user-namespace');

// io.on("connection", (socket) => {
//     console.log("user is connected")
//     // var useridd = socket.handshake.auth.token;
//     // console.log(useridd)
//     // const connected = await User.findByIdAndUpdate({_id: useridd}, {$set: {is_online: '1'}})

//     // socket.on("join_room", (data)=>{
//     //     socket.join(data)
//     //     console.log(data)
//     // })
//     // socket.on('setup', (userData) =>{
//     //     socket.join(userData)
//     //     socket.emit("connected")
//     // })
//     // socket.on('join_user', (room) =>{
//     //     socket.join(room)
//     //     console.log("connected room on " + room)
//     //     io.sockets.in(room).emit('joined', "conected socket");

//     // })
//     socket.on("send_message",(data) =>{
//         // console.log(data.room + " r")
//         io.sockets.emit('receive_message', data);
//         console.log(data)
//         // io.sockets.in(data.room).emit('receive_message', data);

//     })
//     socket.on('disconnect', function(){
//         console.log("user disconnected")
//         // yeh code handsake undar se token ko get karega phir usse userid mil jayega
//       // yeh code mein userid ki help se [is_online] ko 1 se 0 mein update karega.
//         // const disconnected = await User.findByIdAndUpdate({_id: useridd}, {$set: {is_online: '0'}})
//         //boardcast status
//         // socket.broadcast.emit('getOfflineUser',{user_id: userid})

//     })

// })
http.listen(port, function (){
    console.log('server started', port)
})