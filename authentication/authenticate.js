//module imports
const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
const {temp,perma,Order}=require('../database/db');
const {local_link,user_server_link}=require('../urls/links');
const nodemailer=require('nodemailer');
const ejs=require('ejs');
const axios=require('axios');
var path = require('path');
var fs = require('fs');
var changename = require("../helper/changefilename");



//developer made function import
const token=require('../jwt/jwt');




//middleware to extract token from req headers
const get_token=(req,res,next)=>{
    const token=req.headers.authorization;
    if(token !== undefined){
        req.token=token.split(' ')[1];
        next();
    }
    else
        res.status(401).json({err:"0"});
}

const transporter= nodemailer.createTransport({
    service:"gmail",
    auth:{
    type:"OAuth2",
    user:"stowawaysuab123@gmail.com",
    clientId:"197901312379-he0vh5jq4r76if10ahv30ag8ged6f0in.apps.googleusercontent.com",
    clientSecret:"bdZnQ154LMlm-cNxsDVj0NF-",
    refreshToken:"1/XXO2jO_xcSG-TFTc3cToXvC5DlSVJr9mgqE4KroSbms"
    }
})

//verification link after registration
const verfiy=(email,token,Name)=>{
    const mailoption={
        from:"stowawaysuab123@gmail.com",
        to:email,
        subject:"Activate your Stowaway Account by verifying the link",
        text:"Click the below link for verification",
        html:'<h3> Hi '+Name+', </h3><p>Thank you and welcome to Stowaway. To activate your account, please click on the link below.</p><p><a href="https://fast-reef-53121.herokuapp.com/authentication/verification/'+token+'">'+token+'</a></p><p>If you are having trouble clicking the link, copy and paste the URL above in your web browser.</p><p>Thanks,<br>Team Stowaway</p>'
    }

    transporter.sendMail(mailoption,(err,res)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log(res);
        }
    })
}

//verification link sending for resetting password
const resetpass=(email,token,Name)=>{
    const mailoption={
        from:'test29051571833@gmail.com',
        to:email,
        subject:"Reset your Stowaway Account Password by verifying the link",
        text:"Click the link for restting password",
        html:'<h3>Hi '+Name+', </h3><p>You recently requested to reset your password for your Stowaway account. Click on the link below to reset your password.</p><p><a href="https://fast-reef-53121.herokuapp.com/authentication/reseting/'+token+'">'+token+'</a></p><p>Or, please copy and paste the above URL in your web browser.</p><br><p>Thanks,<br>Team Stowaway</p>'
    }

    transporter.sendMail(mailoption,(err,res)=>{
        if(err)
            console.log(err)
        else
            console.log(res)
    })
}

//to check that the user is not present on driver side//
const check=(req,res,next)=>{
    axios.get(`${user_server_link}/services/search_email/${req.body.Email}`).then(user=>{
        next();
    }).catch(err=>{
        res.status(400).json({msg:"User already exist in driver account",response:"5"});
    })
}
//function ends//


//registering user route
router.post('/register',(req,res)=>{
    perma.findOne({Email:req.body.Email}).then(user=>{
        if(user){
        res.status(200).json({response:"1"});
        }
        else{
        const db=new temp
        db.device_id=req.body.device_id
        db.Name=req.body.Name
        db.Password=req.body.Password
        db.MobileNo=req.body.MobileNo
        db.Email=req.body.Email
        db.IMEI=req.body.IMEI
        db.Flag=0
        db.Account_Id=req.body.Account_Id
        db.Date=new Date()
        db.response="0"
        db.save().then(user=>{
            if(user){
                    const enc=token.generateToken(user.Email);
                    verfiy(user.Email,enc,user.Name);
                    res.status(200).json({response:"0"});
            }
        }).catch(err=>{
        res.status(200).json({response:"1"});  
    })
        }
    }).catch(err=>{
        console.log(err);
        const db=new temp
        db.device_id=req.body.device_id
        db.Name=req.body.Name
        db.Password=req.body.Password
        db.MobileNo=req.body.MobileNo
        db.Email=req.body.Email
        db.IMEI=req.body.IMEI
        db.Flag=0
        db.Date=new Date()
        db.response="0"
        db.save().then(user=>{
            if(user){
                jwt.sign({user:user.Email},"suab",(err,token)=>{
                    verfiy(user.Email,token,user.Name);
                    res.status(200).json({response:"0"});
                })
            }
        }).catch(err=>{
        res.status(200).json({response:"1"});  
    })
    })
})

//verifying when user clicks on link on gmail
router.get('/verification/:token',(req,res)=>{
        console.log("yes");
        const authdata=token.decodeToken(req.params.token);
        if(!authdata){
            res.status(401).json("Not authorised to acces this link");
        }
         perma.findOne({Email:authdata.user}).then(user=>{
            if(user)
                res.render('thank');
            else{
                temp.findOneAndDelete({Email:authdata.user}).then(user=>{
                    const db=new perma
                    console.log("64"+user.IMEI)
                    db. device_id=user.device_id
                    db. Name=user.Name
                    db. Password=user.Password
                    db. MobileNo=user.MobileNo
                    db. Email=user.Email
                    db. IMEI=user.IMEI
                    db. Flag=user.Flag
                    db.Account_Id=user.Account_Id;
                    db. Date=new Date()
                    db.response="1";
                    db.image="";
                    db. save().then(user=>{
                        res.render("thank");
                    })
                })
            }
        }).catch(err=>{res.status(200).json({response:"2"})})
})

//logging in user
router.post('/login',(req,res)=>{
    console.log("hello")
    perma.findOne({Email:req.body.Email}).then(user=>{
        if(req.body.Password === user.Password)
            {
                perma.findById({_id:user.id},{Password:false}).then(user=>{
                    req.session.user=user._id;
                    const enct=token.generateToken(user._id);
                   res.status(200).json({key:enct,response:"1"});
                   perma.findByIdAndUpdate({_id:user._id},{device_id:req.body.device_id}).then(user=>{}).catch(err=>{console.log(err)});
                })
            }
        else
            res.status(400).json({response:"2"});
    }).catch(err=>{
    temp.findOne({Email:req.body.Email}).then(user=>{
        if(user){
            res.status(400).json({response:"3"})
        }
        else{
            res.status(400).json({response:"4"});
        }
    }).catch(err=>{
        res.status(400).json({response:"4"})
    })
})
})


//updating users profile
router.post('/update/:what/:value',get_token,(req,res)=>{
    const user_id=token.decodeToken(req.token).user;
    if(user_id){
        switch(req.params.what){
            case "1":
            perma.findByIdAndUpdate({_id:user_id},{Name:req.params.value},{new:true}).then(user=>{
                res.status(200).res({response:"1"});
            }).catch(err=>{
                res.status(400).json({response:"2"});
            })
                break;
            case "2":
            perma.findByIdAndUpdate({_id:user_id},{MobileNo:req.params.value},{new:true}).then(user=>{
                res.status(200).res({response:"1"});
            }).catch(err=>{
                res.status(400).json({response:"2"});
            })
                break;
            case "3":
            perma.findByIdAndUpdate({_id:user_id},{Password:req.params.value},{new:true}).then(user=>{
                res.status(200).json(user);
            }).catch(err=>{console.log(err)
                res.status(400).json({msg:"Error updating the field",response:"1"});
            })
                break;
        }
    }
})
//updating users profile ended



//reseting password email sending
router.get('/resetpass/:email',(req,res)=>{
    //console.log(req.params.email);
    perma.findOne({Email:req.params.email}).then(user=>{
        console.log(user)
        if(user){
            jwt.sign({user:user.Email},"suab",(err,token)=>{
                resetpass(user.Email,token,user.Name);
                res.status(200).json({response:"1"});
            })
        }
        else{
            res.status(200).json({response:"4"});
        }
    }).catch(err=>{
        console.log(err);
        res.status(200).json({response:"4"});
    })
})


//link for new password req coming here from frontend ejs
router.post('/ressetingdone/:token',(req,res)=>{
    if(req.body.password !== req.body.cpassword)
        res.render('forgetpassword',{email:req.params.token,err:"Sorry your password does not match"});
    else{
    jwt.verify(req.params.token,"suab",(err,authdata)=>{
        if(!err){
            perma.findOneAndUpdate({Email:authdata.user},{Password:req.body.password},{new:true}).then(user=>{
                res.render('notify');
            }).catch(err=>{res.status(200).json({msg:"Error upadating password"})})
        }
        else{
            res.render('forgetpassword',{email:req.params.token,err:"Password do not match"})
        }
    })
  }
})

//new password frontend after clicking on link on gmail
router.get('/reseting/:token',(req,res)=>{
    res.render('forgetpassword',{email:req.params.token})
})
//route ended//

//loggingOut from mongo session
// router.get('/logout',(req,res)=>{
    // if(req.session.user && req.cookies.user_sid){
        // res.clearCookie('user_sid').json("LoggedOut");
    // }
    // else
        // res.status(401).json("no session is pending!")
// })

//getting_users data based on token recevied in request
router.get('/user_details',get_token,(req,res)=>{
    const user_id=token.decodeToken(req.token).user
    if(user_id){
        perma.findById({_id:user_id},{ Password:false}).then(user=>{
            console.log(user)
            if(user){
                if(user.image!=""){
                    var host = req.get('host');
                    var image="https://"+host+"/userimage/"+user.image;
                    user.image=image;
                    res.status(200).json(user);

                }else{
                 user.image="https://banner2.kisspng.com/20180425/zye/kisspng-computer-icons-avatar-user-login-5ae149b20c8348.1680096815247139060513.jpg"
                    
                res.status(200).json(user);

                }
            
            }
            else
                res.status(200).json({err:"1"});
        }).catch(err=>{
            res.status(400).json({err:"2"});
        })
    }
    else
        res.status(401).json({err:"3"});
})

//getting user's history
router.get('/order_history',get_token,(req,res)=>{
    const user_id=token.decodeToken(req.token).user;
    console.log(user_id)
    if(user_id){
        Order.find({Driver_id:user_id}).then(user=>{
            console.log(user,"++++++++++++++++++++++++++++++++++++++++++++")
            const rev=user.reverse();
            res.status(200).json(rev);
        }).catch(err=>{console.log("261 err authenticate.js "+err)});
    }
    else
        res.status(401).json({err:"1"});
})
//getting order history ended//

//giivng users list users_backend
router.get('/get_driver',(req,res)=>{
    perma.find({}).then(user=>{
        console.log(user)
        res.status(200).json(user)});
})
//route ended//

//Logout
router.get('/logout',get_token,(req,res)=>{
	const user_id=token.decodeToken(req.token).user;
    perma.findByIdAndUpdate({_id:user_id},{device_id:''},{new:true}).then(user=>{
		res.status(200).res({response:"1"});
	}).catch(err=>{
		res.status(400).json({response:"2"});
	})
})

router.post("/profile/update",get_token,function(req,res){

    const user_id=token.decodeToken(req.token).user;
    if(user_id){
        // var img = new Buffer(req.body.image, 'base64');
        
// console.log(img)    

     if(req.body.image!=""){
        const imageNew = Date.now()+".png"; 

        const pathsave = path.resolve("public/userimage/"+imageNew);
         
        const imgdata = req.body.image;
        
        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        
        fs.writeFileSync(pathsave, base64Data,  {encoding: 'base64'});
        req.body.image=imageNew;

     }else{
        delete req.body.image
     }
     console.log(req.body)
     perma.findByIdAndUpdate({_id:user_id},req.body,{new:true}).then(user=>{
                // res.redirect("/admin_viewproduct");
                res.status(200).json({response:"1"});
            }).catch(err=>{
                console.log(err)
                res.status(400).json({response:"2"});
            })
          }else{
              res.status(200).json({response:3})
          }
          

    //  
   
})
router.get("/driver_total",function(req,res){
    const user_id=token.decodeToken(req.token).user;
    console.log(user_id)
    if(user_id){
        Order.find({Driver_id:user_id}).then(user=>{
            if(user!=null){
             function count(array, key) {
                return array.reduce(function (r, a) {
                    return parseInt(r) + parseInt(a[key]);
                }, 0);
            }
         total_driver_earning= count(user,'Earning');
         total_driver_order=user.length
         var obj={ }
         obj.total_driver_earning=total_driver_earning;
         obj.total_driver_order=total_driver_order;
         res.status(200).json({response:0,data:obj})
        }else{
            var obj={ }
         obj.total_driver_earning=0;
         obj.total_driver_order=0;
         res.status(200).json({response:0,data:obj})
        }     
        }).catch(err=>{console.log("261 err authenticate.js "+err)});
        
    }
    else
        res.status(401).json({err:"1"});



})


module.exports={
    auth_route:router
}