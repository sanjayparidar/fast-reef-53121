const socket=require('socket.io');
const axios=require('axios');
const {admin_link}=require('../urls/links');
var geodist = require('geodist');



const {Order}=require('../database/db'); 
const {user_server_link}=require('../urls/links');
const {notify_user}=require('../FCM/Noti')


var io;
var connected_socket;

function connection(port){
    io=socket(port);
    io.on('connection',(socket)=>{
        connected_socket=socket
        //console.log(connected_socket);
        connected_socket.on("request",(data)=>{
            var sender_unique=Math.floor(Math.random()*10000+10000);
            var recevier_unique=Math.floor(Math.random()*10000+10000);
            // axios.get(`${user_server_link}/socket/connected_users_list`).then(res=>{
            //     res.data.map(i=>{
            //         if(i.user_id === data.User_id)
            //             io.to(`${i.socket_id}`).emit("request_accepted_driver",({data,sender_unique,recevier_unique}));
            //     })
            // })
            Order.find({$and:[{ Driver_id: "5d398754ea115a002480b9c2"}, { CurrentStatus: 3 },{rating:{$gt:0}}]},function(err,result){
                if(err){
                    // {Driver_id:req.body.driver_id,CurrentStatus:3,rating:{ $gt:0}}
                    // [{ color: 'daffodil yellow' }, { color: 'atomic tangerine' }] 
                }else{
                    if(result.length>0){
                        function count(array, key) {
                           return array.reduce(function (r, a) {
                               return parseInt(r) + parseInt(a[key]);
                           }, 0);
                       }
                  var total_rating= count(result,'rating');
                    var total_order=result.length
                    data.avarge_rating=total_rating/total_order
                    console.log("+++++++++++++++++++++++",data.avarge_rating,"++++++++++++++++++++++++")
                    
                   }else{
                       
                    data.avarge_rating="";
                   } 
        
        
                }
               
              console.log("SSSSSSSSSSSSSSSSSSSSSS",data,"+++++++++++++++++++++++++++++++++")
            axios.post(`${user_server_link}/socket/order_accepted`,{data,sender_unique,recevier_unique}).then(res=>{
            });
        });
            axios.get(`${admin_link}/driver/driver_cost/driver`).then(user=>{
            
                
            var deriver_cost=user.data[0].driver_cost;
            var driver_earning=parseFloat(Math.round(data.Price*deriver_cost)/100);
        
            io.sockets.emit("this_order_is_accepted_by_driver",{Driver_Name:data.Name,Order_id:data.Order_id,code:"1"});
        
            const db=new Order
            db.User_id=data.User_id;
            db.Driver_id=data.Driver_id;
            db.Order_id=data.Order_id;
            db.Name=data.Name;
            db.Charge_id=data.Charge_id;
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
            db.Earning=Math.round(data.Price*deriver_cost)/100;
            db.Sender_Otp=sender_unique;
            db.Recevier_Otp=recevier_unique;
            db.Weight=data.Weight
            db.Pickup_Date=data.Pickup_Date;
            db.Height=data.Height;
            db.Length=data.Length;
            db.Width=data.Width;
            db.Date=new Date();
            db.Delivery_Date_User=data.Delivery_Date_User;
            db.Order_Stamp=data.Order_Stamp;
            db.G_Latitude=data.G_Latitude;
            db.G_Longitude=data.G_Longitude;
            db.R_Latitude=data.R_Latitude;
            db.R_Longitude=data.R_Longitude;
            db.Pickup_Time=data.Pickup_Time;
            db.Delivery_Time=data.Delivery_Time;
            db.refund=data.refund;
            db.refund_fine=data.refund_fine;
            db.show="";
            db.rating="";
            db.comment="";
            db.partnercommission=deriver_cost;
            db.farepermile=data.farepermile;
            db.adminearning=data.Price-driver_earning;
            db.distance=data.distance;
            db.box=data.box;
            db.box_name=data.box_name;
        
            db.save().then(user=>{
                notify_user(user,`Your Order was accepted by ${user.Name} is on his way.Contact him on ${user.Phone}`);
               io.sockets.emit("this_order_is_accepted_by_driver",{Driver_Name:data.Name,Order_id:data.Order_id,"res":"1"});
            }).catch(err=>{
                io.sockets.emit("this_order_is_accepted_by_driver",{"res":"0"});
        })
    
    
      
        connected_socket.on("driver_from_driver_driver_frontend",data=>{
            io.sockets.emit('from_driver_to_user_frontend',data);
        })
        }).catch(err=>{
            
    })
    })
    })
}

module.exports={
    connection
}