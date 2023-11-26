const socket=io()

let username

// get refrence of all HTML elements
const form=document.getElementById("chat-form");
const input=form.querySelector('input[type="text"]');
const fileInput=form.querySelector('input[type="file"]');
const messages=document.getElementById("messages");

form.addEventListener('submit',(e)=>{
    e.preventDefault()

    const reader=new FileReader()
    const file=fileInput.files[0]

    if(!file && !input.value){
        alert("Please Enter the message")
        return
    }
    if(file){
        reader.readAsDataURL(file)
        reader.onload=()=>{
            socket.emit("chat message",{
                author:username,
                content:input.value,
                image:reader.result
            })
            input.value=""
            fileInput.value=""
        }
    }
    else{
        socket.emit("chat message",{
            author:username,
            content:input.value,
            image:null
        })
        input.value=""
    }
})


if(localStorage.getItem('username')){
    username=localStorage.getItem('username')
    socket.emit("username",username)
}
else{
    Swal.fire({
        title: "Enter your username",
        input: "text",
        inputLabel: "Username",
        inputPlaceholder:"Enter Your username",
        allowOutsideClick:false,
        inputValidator:(value)=>{
            if(!value){
                return "you need yo enter username...!";
            }
        },
        confirmButtonText:"Enter Chat",
        showLoaderOnConfirm:true,
        preConfirm:(username)=>{},

    }).then((result)=>{
        console.log(result);
        username=result.value;
        socket.emit(username,"username");
        localStorage.setItem("username",username);
    });
}
function scrollToBottom(){
    const messageList=document.getElementById("messages");
    // console.log(
    //     `scrollTop: $${messageList.scrollTop}, scrollHeight: ${messageList.scrollHeight}`

    // );
    messageList.scrollTop=messageList.scrollHeight;
    // console.log(
    //     `new scrollTop: ${messageList.scrollTop}, scrollHeight: ${messageList}`
    // );
}
// for new user
socket.on('User Joined',(username)=>{
    console.log(username)
    const item=document.createElement('li')
    let messages=document.getElementById('messages')
    item.classList.add('chat-message')
    item.innerHTML= `<span class='chat-username'>${username}</span> :: has joined the chat`
    messages.appendChild(item)
    scrollToBottom()

})
// if user left the chat
socket.on('user left',(data)=>{
    console.log("data received from is : ",data)
    const item=document.createElement('li')
    let messages=document.getElementById('messages')
    item.classList.add('chat-message')
    item.innerHTML= `<span class='chat-username'>${data}</span> :: has left the chat`
    messages.appendChild(item)
    scrollToBottom()

})
// get message data and dsiplay
socket.on('chat message',(msg)=>{
    const item=document.createElement('li')
    item.classList.add("chat-message")
    item.innerHTML= `<span class='chat-username'>${msg.author}</span> :: ${msg.content}`;
    if(msg.image){
        const img=document.createElement("img");
        img.src=msg.image;
        img.classList.add("image");
        item.appendChild(img);
    }
    messages.appendChild(item);
    scrollToBottom();
})
// show previous messages to new client
socket.on('load messages',(messages)=>{
   const messageList=document.getElementById("messages");
   messages.forEach((msg)=>{
    const item=document.createElement("li");
    item.classList.add("chat-message");
    item.innerHTML=`<span class="chat-username"> ${msg.author}</span> :: ${msg.content}`;
    if(msg.image){
        const img=document.createElement("img");
        img.src=msg.image;
        img.classList.add("image");
        item.appendChild(img)
    }
    messageList.appendChild(item)
   });
   scrollToBottom();
})