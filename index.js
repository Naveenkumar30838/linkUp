const express = require('express');
const path = require('path');
const fs = require('fs');
const {v4 : uuidv4} = require('uuid');
const ejs = require('ejs');
const methodOverride = require('method-override');
const app = express();
const port = process.env.PORT || 8080;

// setting for the views directory and serving static files
app.set('view engine' , ejs);
app.set("views" , path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname , "public")));

// setting the middlewares to accept post requests
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const database='database.json';
const userdatabase = 'userDatabase.json';

// to override post and get Request 
app.use(methodOverride('_method'))


// Starting server 
app.listen(port , ()=>{
    console.log(`app is started on the port ${port}`);
}) 

//  reading the Data from the database in synchronous way -> Database Code
function readDatabase (url) {
    const data = fs.readFileSync(url);
    return JSON.parse(data);
}

function writeDatabase (url ,data){
    fs.writeFileSync(url , JSON.stringify(data, null, 2), 'utf8');
}

function addPostToDatabase(url , data){ // to add data of new post to database.json 
    const db = readDatabase(url);
    const userDb = readDatabase('userDatabase.json')
    // verifying Password 
    for (const user of userDb){
        
        if(user.password == data.password && user.username == data.username){
            // password matched and user found 
            for (const dt of db){
                if(dt.username == data.username){// the user if present in the database.json i.e he has already posted something 
                    dt.posts.push({
                        "id":uuidv4(),
                        "likes":0,
                        "content": data.content,
                        "Image":data.Image
                    });
                    writeDatabase(url , db);
                    return -1;
                }
            }   
            // user exists in the userDatabase but not in database.json -> this is first post of user so we need to create this in database.json 
            db.push({
                "username":data.username,
                "posts": [{
                    "id":uuidv4(),
                    "likes":0,
                    "content": data.content,
                    "Image":data.Image
                }]
            })

            writeDatabase(url , db);
            return 0;
        }
    }
    // Either wrong username or password
    return 1;
    
} 
// function updateDatabase(url , newData){
//     writeDatabase(database ,db);
// }
//  Routing and Requesting Code to redirect and get Data
app.get('/' , (req , res)=>{
    res.redirect('/home')
})
app.get('/home',(req , res)=>{
    const db = readDatabase(database);
    res.render('index.ejs' , {db:db})
})
// Rendering Individual post
app.get('/post/:id',(req , res)=>{
    const {id} = req.params;
    // Searching the post with given Id 
    const db = readDatabase(database);
    for (const user of db){
        for (const post of user.posts){
            if(post.id==id){
                res.render('post.ejs' ,{post:post , username:user.username} )
                return;
            }
        }
    }
    res.status(404).send("Post Not Found")
})
// Rendering page to edit a Post 
app.get('/:username/editPost/:id' , (req , res)=>{
    const {username , id} = req.params;
    for (const data of readDatabase(database)){
        if(data.username == username){
            for (const post of data.posts){
                if(post.id==id){
                    res.render('edit.ejs' , {post , username});
                }
            }
        }
    }
})
// Rendering delete Page with the target route as : /post/id for sending delete request 
app.get('/:username/deletePost/:id' , (req ,res)=>{
    // rendered form will send delete request on post/:id
    const {username ,id}=req.params;

    res.render('delete.ejs' , {username , url : `/post/${id}`})
})

// Rendering the page for adding New post 
app.get('/postNew' , (req , res)=>{
    res.render('newPost.ejs')
})

// Rendering Page to create a new Account 
app.get('/signup',(req , res)=>{
    res.render('signUp.ejs')
})

// Rendering Alert Page 
// app.get('/showAlert', (req , res)=>{
//     res.render('alert.ejs' , {message:"Invalid User" , url:"/signup"})
// })
// showing Profile Page with the profile data of require username
app.get('/profile/:username' , (req , res)=>{
    const {username} = req.params;
    const userdb = readDatabase(userdatabase);
    for (const user of userdb){// Searching for user in userDb
        if(user.username == username){
            let similarProfiles = [];
            // Searching for more Relevant users 
            for (const usr of userdb){
                if(usr.profession == user.profession & usr.username!=user.username){
                    similarProfiles.push({"username":usr.username , "name":usr.name , "image":usr.image , "profession":usr.profession})
                }
            }
            // Searching for Posts of Current User
            const db = readDatabase(database)
            for (const dataElement of db) { // Searching for post of Current User in database
                if (dataElement.username == username){
                    res.render('profile.ejs',{user:user , posts:dataElement.posts , similarProfiles});
                    return;
                }
            }
            // There might be a scenario where we have user but he hasn't posted anything so he wouldn't have been created in the database.json 
            res.render('profile.ejs' ,{user:user , posts:null , similarProfiles} )
            return;
        }
    }
    res.status(404).send("User Not Found");
})
// Rendering delete page with the target route as : profile/username for delete request 
// Rendering delete Post Verifying Page 
app.get('/deleteProfile/:username' , (req ,res)=>{
    // rendered form will send delete request on post/:id
    const {username }=req.params;
    console.log("In the delete Profile page : " , username)
    res.render('delete.ejs' , {username , url : `/profile/${username}`})
})
// Responding for Search Page
app.get('/search' , (req , res)=>{
    const {username} = req.query;
    
    const db = readDatabase('userDatabase.json');
    for (user of db){
        if( user.username.toUpperCase() == username.toUpperCase() | user.name.toUpperCase()==username.toUpperCase()){
            res.render('alert.ejs' , {message:"User Found" , url:`/profile/${user.username}`})
            return;
        }
    }
    res.render('alert.ejs' , {message:"No Such User" , url:`/home`})
    
    
})
app.get('*' , (req , res)=>{
    res.render('alert.ejs' , {message:"NO Such Page Exist" , url:"/"})
})

// handling post Request :)
app.post('/home' , (req , res)=>{
    // accepting post request from the new post form -> updating the database and rendering the home page again with the updated Data
    const rt= addPostToDatabase(database , req.body)
    console.log("Return from function is : " , rt)
    if(rt){
        // Either username or password was wrong 
        res.render('alert.ejs' , {message:"Either Wrong UserName or Password" , url:"/postNew"})
    }
    
    res.redirect('/home')
})
app.post('/profile/', (req , res)=>{
    // this request will be given by the sign Up form where we get the data of a new user , this new user will be added to the database and we will redirect to the profile.ejs showing a new user 
    const {username , name , email , password , image , profession , about} = req.body;
    const userdb=readDatabase(userdatabase);
    for (const user of userdb){
        if (user.username == username){
            res.render('alert.ejs' , {message : "UserName Alredy Exists" ,"url":'/signup' })
            return;
        }
        if (user.email == email){
            res.render('alert.ejs' , {message : "Email Alredy Exists" ,"url":'/signup' })
            return;
        }
    }
    userdb.push({username , name , email , password ,"postCount":0,"followers":0  , "following":0 , image , profession , about})
    writeDatabase(userdatabase , userdb);
    res.redirect(`/profile/${username}`);
})
app.patch('/posts/:id' , (req , res)=>{
  
    const {id} = req.params;
    const {username , password , content ,Image } = req.body;
    const userdb = readDatabase(userdatabase);
    for (const user of userdb){
        if (user.username == username){
            if(user.password == password){
                // username and password both matched ,
                // Updating Database 
                const db = readDatabase(database)
                // const db = []
                console.table("Database is : " );
                console.table(db)
                for (const data of db ){// searching for username in the database.json
                    if (data.username == username){
                        for (const post of data.posts){
                            if(post.id== id){// Required Post found in the posts Array 
                                post.content = content;
                                post.Image = Image;
                                writeDatabase(database  , db);
                                res.redirect(`/post/${id}`);
                                return; 
                            }
                        }
                    }
                }
                // rendering the Updated Post 
            }else {
                // username is correct but password is different 
                res.render('alert.ejs' , {message : `Invalid Password for the Username ${username}` , url : `${username}/editPost/${id}`})
            }
        }
    }
})
// Accepting Delete Requests 
app.delete('/post/:id' , (req ,res)=>{
    const {username , password} = req.body;
    const {id} = req.params;
    const userDb = readDatabase(userdatabase);

    for (const user of userDb){
        if(user.username == username){
            if(user.password ==password){
                // Search that post and delete it from Posts Array
                const db = readDatabase(database);
                for (const data of db){
                    if(data.username==username){
                       data.posts = data.posts.filter((e)=> e.id!=id);
                       writeDatabase(database , db);
                       res.redirect(`/profile/${username}`)
                    }
                }
            }else{
                // user has entered wrong password
                res.render('alert.ejs' , {message : "Wrong UserName or Password " , url : `/${username}/deletePost/${id}`})
            }
        }
    }
})
app.delete('/profile/:username' , (req ,res)=>{
    const {password} = req.body;
    const {username} = req.params;
    // checking if username password exists 
    let userdb = readDatabase(userdatabase);
    isuserDeleted = false;
    userdb = userdb.filter((e)=>{
        if(e.username==username&&e.password==password){
            isuserDeleted=true;
            return false;
        }else{
            return true;
        }
    })

    if(isuserDeleted){  
        writeDatabase(userdatabase , userdb);
        const db = readDatabase(database);
        db.filter((e)=>{
            return e.username!=username;
        })
        writeDatabase(database , db);
        res.render('alert.ejs' , {message : "User Deleted Successfully " , url :`/signup`})
    }else{
        res.render('alert.ejs' , {message : "Wrong UserName or Password " , url :`/deleteProfile/${username}`})
    }


})