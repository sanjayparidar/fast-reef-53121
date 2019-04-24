const FCM=require('fcm-push');
const axios=require('axios');
const serverKey="AIzaSyCgJqVv7yZ97gcOoADX8uaCTFEeuiqbK2Y";

var fcm=new FCM(serverKey);

//importing user made modules//
const {user_server_link}=require('../urls/links')

//function to send notification to //
function notify_user(user,body){
    axios.get(`${user_server_link}/authentication/get_user`,{id:user.User_id}).then(res=>{
        var message={
            to:res.data[0].device_id,
            notification:{
                title:"Stowaway",
                body:body
            }
        }
        fcm.send(menubar,(err,success)=>{
            if(err)
                console.log(err);
            else
                console.log(success);
        })
    })
}
//function ends//

module.exports={
    notify_user
}