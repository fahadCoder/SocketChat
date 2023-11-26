const express=require('express')




// for database
const mongoose=require('mongoose')

const app=express()

app.use(express.static('public'))   //middleware

const http=require('http').createServer(app)

// listen io events
const io=require('socket.io')(http)

// mongo URI
// const MONGODB_URI=process.env.MONGODB_URI || "mongodb://localhost:27017/socketapp"
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/socketapp";

// mongoose.connect(MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true})
// .then(()=>console.log("Database Connected Successfully"))
// .catch((err)=>console.log(err))
// Connect to MongoDB using Mongoose
mongoose.connect(MONGODB_URI, {
    // Remove useNewUrlParser and useUnifiedTopology options
  })
    .then(() => console.log("Database Connected Successfully"))
    .catch((err) => console.log(err));
  
// Schema
const MessageSchema=new mongoose.Schema({
    author:String,
    content:String,
    image:String

})
const Message=mongoose.model('Message',MessageSchema)


app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})


//socket connection
io.on('connection',(socket)=>{
    // console.log(socket)
    console.log("A new Client is Connected")

    // load previous messages
    Message.find({})
    .then((messages)=>{
        socket.emit("load messages",messages)
    })


    socket.on('username',(username)=>{
        console.log("the logged username is :: " + username)
        socket.username=username
        io.emit("User Joined",username)
    })

    socket.on('chat message',(msg)=>{
        const message=new Message({
            author:msg.author,
            content:msg.content,
            image:msg.image
        })
        message
        .save()
        .then(()=>{
            io.emit("chat message",msg)
        })
        .catch((err)=>console.log(err))

    })

     


    socket.on('disconnect',()=>{
        console.log("the disconnect username is :: " + socket.username)

        io.emit("user left",socket.username)
    })

})

http.listen(5000,()=>{
    console.log("App is listening on port 5000")
})