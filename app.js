const express   = require('express'),
    mongoose    = require('mongoose'),
    bodyParser  = require('body-parser'),
    passport    = require('passport'),
    LocalStrategy = require('passport-local'),
    FacebookStrategy = require('passport-facebook'),
    ObjectID = require('mongodb').ObjectID,
    //{ObjectID} = require('mongodb'),
    User          = require('./models/users'),
    passportLocalMongoose   = require('passport-local-mongoose'),
    app         = express();

    const PORT  = 3000;

    mongoose.connect("mongodb://localhost:27017/auth",{ useNewUrlParser : true }); 

    app.set("view engine","ejs");
    app.use(bodyParser.urlencoded({ extended: true })); 

    app.use(require("express-session")({
        secret: "El Psy Congroo",
        resave: false,
        saveUninitialized: false
    }));

    
app.use(passport.initialize());
app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    // passport.serializeUser(User.serializeUser());
    // passport.deserializeUser(User.deserializeUser());

    passport.serializeUser(function(user, done) {
        done(null, user);
      });
      
      passport.deserializeUser(function(user, done) {
        done(null, user);
      });

      app.use(function(req, res, next){
        res.locals.currentUser = req.user;
        next();
     });
     


    //   passport.use(new LocalStrategy(
    //     function(username, password, done) {
    //       User.findOne({ username: username }, function (err, user) {
    //         if (err) { return done(err); }
    //         if (!user) { return done(null, false); }
    //         if (!user.verifyPassword(password)) { return done(null, false); }
    //         return done(null, user);
    //       });
    //     }
    //   ));
      
      var Profile = {};
    // passport.use(new FacebookStrategy({
    //     clientID: '450859015509137',
    //     clientSecret: '0e074921a15f7afe17eca8dda84900ff',
    //     callbackURL: "http://localhost:3000/auth/facebook/callback"
    //   },
    //   function(accessToken, refreshToken, profile, cb) {
    //       User.find({username: profile.displayName},(err, user)=>
    //       {
    //           console.log(user.username,typeof(profile.displayName));
    //            var obid = mongoose.Types.ObjectId('000000000'+profile.id);           // FIND AND STORE FB PROFILE WITH ID = '000000000'+profile_id
    //            console.log(obid);
    //             if(!err && user.username==null)
    //             {
    //                 User.create({ _id: obid ,username:profile.displayName}, function (err, user) {
    //                     Profile = {accessToken:accessToken,refreshToken:refreshToken,profile:profile};
    //                     console.log(user,profile);
    //                     return cb(err, user);
    //                 });    
    //             }
    //             else{
    //                 Profile = {accessToken:accessToken,refreshToken:refreshToken,profile:profile};
    //       //          res.locals.currentUser = Profile.profile.displayName;
    //                 console.log(`hello ${profile.displayName}`);
    //                 return cb(err, user);
    //             }
                    
    //       });
        
    //   }
    // ));
    
// Check for exsisting user or else create one
    passport.use(new FacebookStrategy({
        clientID: '450859015509137',
        clientSecret: '0e074921a15f7afe17eca8dda84900ff',
        callbackURL: "http://localhost:3000/auth/facebook/callback"
      },
      function(accessToken, refreshToken, profile, cb) {
        var obid = mongoose.Types.ObjectId('000000000'+profile.id); 
                  console.log(obid);       
          User.findById(obid,(err, user)=>
          {
                  // FIND AND STORE FB PROFILE WITH ID = '000000000'+profile_id
                  if(!err && user==null)
                  {
                      User.create({ _id: obid ,username:profile.displayName}, function (err, user) {
                          Profile = {accessToken:accessToken,refreshToken:refreshToken,profile:profile};
                          console.log(`Stored a new user ${user}`);
                          console.log(profile);
                          return cb(err, user);
                      });    
                  }
                else{
                    Profile = {accessToken:accessToken,refreshToken:refreshToken,profile:profile};
          //          res.locals.currentUser = Profile.profile.displayName;
                    console.log(`Hello existing user ${user.username}`);
                    return cb(err, user);
                }     
          });
        
      }
    ));


    app.get('/auth/facebook',
  passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/signin',successRedirect:'/' }),
    function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });




    app.get('/',(req,res)=>{
    if(res.locals.currentUser.username!=null)
    res.send(`Hello ${res.locals.currentUser.username}`); // works for local
    else
    res.send(`Hello ${Profile.profile.displayName}`);   // works for facebook
    });


    
    // show signup form
    app.get("/signup", (req, res)=>{
        res.render("signup"); 
     });
     //handle sign up logic
     app.post("/signup", function(req, res){
         var newUser = new User({username: req.body.username});
         User.register(newUser, req.body.password, function(err, user){
             if(err){
                 console.log(err);
                 return res.render("signup");
             }
             passport.authenticate("local")(req, res, function(){
                res.redirect("/"); 
             });
         });
     });
     
     // show signin form
     app.get("/signin", (req, res)=>{
        res.render("signin"); 
     });
     // handling signin logic
     app.post("/signin", passport.authenticate("local", 
         {
             successRedirect: "/",
             failureRedirect: "/signin"
         }), (req, res)=>{
             console.log(`successfully signed in`);
     });
     
     // logout route
        app.get("/logout", (req, res)=>{
        req.logout();
        console.log(`Bye!! `);
        res.redirect("/signin");
     });





    // app.get("*",(req,res)=>{
    //     res.redirect("/signin");
    // });
    app.listen(PORT,process.env.IP,()=>{
        console.log(`server has started on port ${PORT}`);
    });
      