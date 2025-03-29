<h1>LinkUp</h1>
<p>Created For Learning tech stacks like Express , Node.js , EJS and to Learn about CRUD Operations</p>
<h3>Commands to Use</h3>
<p>
  <span>npm install </span>
  <br>
  <span>nodemon Index.js</span>
</p>
<h3>Database Structure : </h3>
<p>gives an array of object where each object contains a username and posts array which shows posts created by the user . Creating a new user won't add a new object in the database.json (might be the user just want to have a profile and don't want to post anything , so as to reduce that complexity every new user isn't automatically added to the database.json file ) , once a user creates a new post and if there is no post from that user in the past automatically a new object will be added with the username(after doing necessary validations) and posts array . <b>Imp : </b> once we delete all posts from a user it won't remove that user's object from the database i.e we still have that object with that username and an empty posts array and it won't create any conflict because to add a new post we are checking whether that user exists in the userdatabase if yes we check if user exists in the database.json if yes we simply add a post object (with the new post data ) in the posts array (that is still after deleting all posts) and if the user don't exist in the database.json means he is posting for the very first time and we are to create a new object the username and posts array and add it in the database , if user is not in the userdatabase.json then we can't create post for that user(First create that user or add a valid user)  </p>
<h3>userDatabase Structure : </h3>
<p>gives an array of object where each object shows an user's information : username , name , email  ,password etc. Once a user is deleted(afte doing required validation) we are remove that userObject from the userdatabase.json and remove the user's data (of posts ) from the database.json </p>
<h3>Routes </h3>

<h3>Important Dependencies </h3>
<p>Express : For server side programming</p>
<p>uuid : for creating a unique Id </p>
<p>fs : to read , write data from a file </p>
<p?>method-override : to override get / post request methods and to serve them as</p>
<p>Patch or delete request Methods</p>
<p>path : built in node.js package to create paths</p>

<h3>Font </h3>
<p> 'ubuntu' , 'sans-serif'</p>

<h3>Routes </h3>
<h4> Get Request Routes</h4>
<p>/ , /home -> Serves the Home Page (index.ejs)</p>
<p>/post/:id ->Serves a post with Specific id page (post.ejs)</p>
<p>/:username/edit.ejs/:id ->Serves a Edit post Page with Specific id for a Specific Username (edit.ejs)</p>
<p>/:username/delete.ejs/:id ->Serves a delete post Page with Specific id for a Specific Username (edit.ejs)</p>
<p>/postNew ->Serves a page to add a new Post (newPost.ejs)</p>
<p>/signup ->Serves a page to signUp (signup.ejs)</p>
<p>/deleteProfile/:username ->Serves a page to delete a profile with specific username (delete.ejs)  </p>
<p>/search -> Serves a page to respond for search query in the search box (searches for the usernaem in the database and if user exists then the show a userfound message and redirects to that userprofile page , else show no user found message and directs to the homepage) </p>
<p>* -> Responds to the all other route requests received on the server i.e show a Page not found message and redirects to the Home page </p>

<h4>Post Request Routes</h4>
<p>/home -> receives post request from newPost page , adds the post data to the database.json (if valid (using add PostToDatabase Function) ) and then redirects to the home page </p>
<p>/profile ->  receives post request from signUp page , adds the new User data to the userdatabase.json (if valid  and then redirects to the Profile page of the new user Created ),else redirect to the signUp form </p>

<h4>Patch Request Routes </h4>
<p>/posts/:id -> Receives patch request from the edit Post page and updates the post data in the database.json file if the editing user is a valid user (enters correct username and password ) and renders the updated post , else shows Invalid  username or password and redirect to same edit post page with the unedited content  </p>

<h4>DELETE Request Route</h4>
<p>/post/:id -> receives delete post from the delete post page , checks if the entered username and password for the delete request are correct or not , if correct then deletes the post form the database.json file else renders deletePost page again after showing a notification of wrong username or password </p>
<p>/profile/:username -> receives delete profile from the delete profile page , checks if the entered username and password for the delete request are correct or not , if correct then deletes the profile form the userdatabase.json and redirects to the signup form ,  else renders deleteprofile page again after showing a notification of wrong username or password </p>

<h3>Alert.ejs page : </h3>
<p>Receives two keys one the message that is to be shown and the other is the url on to which the page will redirect automatically after three seconds</p>