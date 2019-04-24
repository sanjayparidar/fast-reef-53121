const socket=require('socket.io');
const axios=require('axios');



const {Order}=require('../database/db'); 
const {user_server_link}=require('../urls/links');
const {notify_user}=require('../FCM/Noti')


var io;
var connected_socket;

function connection(port){
    io=socket(port);
    io.on('connection',(socket)=>{
        connected_socket=socket
        console.log("made connection");
        //console.log(connected_socket);
        connected_socket.on("request",(data)=>{
            console.log("17 socket_func"+data.Name);
            console.log("Order _id is "+data.Order_id);
            var sender_unique=Math.floor(Math.random()*100000);
            var recevier_unique=Math.floor(Math.random()*100000);
            // axios.get(`${user_server_link}/socket/connected_users_list`).then(res=>{
            //     res.data.map(i=>{
            //         if(i.user_id === data.User_id)
            //             io.to(`${i.socket_id}`).emit("request_accepted_driver",({data,sender_unique,recevier_unique}));
            //     })
            // })
            axios.post(`${user_server_link}/socket/order_accepted`,{data,sender_unique,recevier_unique}).then(res=>{
                console.log(res.data);
            })
            //io.sockets.emit("request_accepted_driver",({data,sender_unique,recevier_unique}));
            const db=new Order
            db.User_id=data.User_id;
            db.Driver_id=data.Driver_id;
            db.Order_id=data.Order_id;
            db.Name=data.Name;
            db.Phone=data.Phone;
            db.Email=data.Email;
            db.Commodity=data.Commodity;
            db.Receving_Address=data.Receving_Address;
            db.Delivery_Address=data.Delivery_Address;
            db.Giver_Name=data.Giver_Name;
            db.Giver_Phone=data.Giver_Phone;
            db.Giver_Email=data.Giver_Email;
            db.Recevier_Phone=data.Recevier_Phone;
            db.Recevier_Name=data.Recevier_Name;
            db.Recevier_Email=data.Recevier_Email;
            db.Price=data.Price;
            db.Earning=data.Price*0.2;
            db.Sender_Otp=sender_unique;
            db.Recevier_Otp=recevier_unique;
            db.Weight=data.Weight
            db.Pickup_Date=data.Pickup_Date;
            db.Height=data.Height;
            db.Length=data.Length;
            db.Width=data.Width;
            db.Date=new Date();
            db.Order_Stamp=Date.now();
            db.save().then(user=>{
                notify_user(user,`Your Order was accepted by ${user.Name} is on his way.Contact him on ${user.Phone}`);
               console.log("40 func"+user);
            }).catch(err=>{console.log("38 socket_fucn"+err)});
        })

        connected_socket.on("driver_from_driver_driver_frontend",data=>{
            console.log(data);
            io.sockets.emit('from_driver_to_user_frontend',data);
        })
    })
}

module.exports={
    connection
}