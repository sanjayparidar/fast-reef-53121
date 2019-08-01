
//importing node modules
const router=require('express').Router();
const axios=require('axios');

const secretKey="sk_test_Wae1JVypvlaoK5pLIFPsrexC0060Ik7P4F";
const publicKey="pk_test_mNSmGjYqswUKp1NnrGGuNk8f004q3h4DWh";

const stripe=require('stripe')(secretKey);

//importing user made module
const {Order,perma,temp}=require('../database/db');
const {generateToken,decodeToken}=require('../jwt/jwt');
const {user_server_link,admin_link}=require('../urls/links');
const {notify_user}=require('../FCM/Noti')

const get_token=(req,res,next)=>{
    if(req.headers.authorization !== undefined){
        const token=req.headers.authorization.split(' ')[1];
        req.token=token;
        next();
    }
    else
        res.status(401).json({err:"0"});
}


//checking sender otp
router.post('/check_sender_otp',get_token,(req,res)=>{
    const user_id=decodeToken(req.token).user;
    console.log(req.body.otp);
    console.log(req.body.Order_id)
    if(user_id){
        Order.find({Order_id:req.body.Order_id}).then(user=>{
            // console.log(user)
            if(user){
                if(user[0].Sender_Otp === req.body.otp){
                    Order.findOneAndUpdate({Order_id:req.body.Order_id},{CurrentStatus:2,show:"true",},{new:true}).then(user=>{
                        notify_user(user,`Your order has been pickup by Driver ${user.Name} which is ${user.Commodity} and will be delivered to ${user.Recevier_Name}`);
                        axios.get(`${user_server_link}/authentication/order_status_update/${req.body.Order_id}/2`).then(resp1=>{
                            res.status(200).json({res:"0"});
                        }).catch(err=>{
                            res.status(400).json({response:"error updating your status",response:"0"});
                        })
                    })
                }
                else{
                    if(req.body.show=="false"){
                        //  not show
                        var control;
                        axios.get(`${admin_link}/authentication/get_controls/1`).then(user=>{
                        control=user.data;
                        
                        
                                  Order.findOne({Order_id:req.body.Order_id}).then(user=>{
                                      
                                  if(user.CurrentStatus<2){
                                axios.get(`${admin_link}/authentication/refund/cencel/charge`).then(result=>{
                                    var refund=user.Price*(100-result.data[0].Refund_fine)/100
                                    
                                axios.post(`${user_server_link}/payment/delete_order`,{Order_id:req.body.Order_id,CurrentStatus:5,refund:refund,refund_fine:result.data[0].Refund_fine,show:"false"}).then(user=>{
                                    }).catch(err=>{
                                        // res.send(err)
                                        res.status(200).json({msg:"error updatin in driver side"});
                                    })
                                  

                                 var refund=user.Price*(100-result.data[0].Refund_fine)/100
                                           
                                    const resp1=user;
                                    console.log("YYYYYYYYYYYYYYY",resp1.Charge_id,resp1.refund,"TTTTTTTTTTTTTTT")
                                    stripe.refunds.create({
                                    charge:resp1.Charge_id,
                                    amount:parseInt(refund)
                                  }).then(refundsuccess=>{
                                    console.log("++++++++ssssss+++++++++",refundsuccess,"+++++ssssss+++++++");
                                    console.log("++++++++++++success+++++++++++++++++++++")
                                    Order.findOneAndUpdate({Order_id:req.body.Order_id},{CurrentStatus:5,refund:refund,refund_fine:result.data[0].Refund_fine,show:"false"}).then(user=>{
                                    res.status(200).json({res:"1",msg:"successfully cancelled orer"});
                                }).catch(err=>{
                                    console.log(err);
                                    res.status(400).json({res:"2",msg:"error in refunding"});
                                   })  
                                }).catch(err=>{
                                    console.log(err);
                                    res.status(400).json({res:"2",msg:"error in stripe refunding"});
                                   
                                  
                                  }).catch(err=>{
                                    console.log(err)
                                    res.status(400).json({res:"3",msg:"Error updating on user side"});
                                  })
                                }).catch(err=>{
                                    console.log(err)
                                    res.status(400).json({res:"3",msg:"Error updating on on admin side"});
                                  })
                                }
                                else{
                                  res.status(400).json({res:"4",msg:"unable to complete order at this stage"});
                                }
                                }).catch(err=>{
                                    console.log("+++++++++++++++++++++++",err,"+++++++++++++++++++++++++++++")
                                    // res.send(err)
                                    res.status(200).json({msg:"error updatin in driver side"});
                                })
                                
                              
                      }).catch(err=>{console.log("error in stripejs line 69 "+err)});


                        // not show
                    }else{
                         res.status(401).json({msg:"OTP did not match try again",response:"2"});
                       }
                  
                }
            }
        }).catch(err=>{
            // console.log("31 Services.js "+err);
            res.status(400).json({msg:"We cant evaluate your order",err:"3"});
        })
    }
    else
        res.status(401).json({err:"4"});
})
//ended route checking sender otp//


//checking receviers otp
router.post('/check_recevier_otp',get_token,(req,res)=>{
    const user_id=decodeToken(req.token).user;
    if(user_id){
        Order.find({Order_id:req.body.Order_id}).then(user=>{
            if(user){
                if(user[0].Recevier_Otp === req.body.otp){
                    Order.findOneAndUpdate({Order_id:req.body.Order_id},{CurrentStatus:3,Delivered_On:new Date()},{new:true}).then(user=>{
                        notify_user(user,`Your order has been recevied by ${user.Recevier_Name} which was ${user.Commodity} and was delivered by Driver ${user.Name}`);
                        order_complete(req.body.Order_id);
                        console.log(generateToken(user_id));
                            const admin_token=req.token;
                            console.log("going to admin for payment");
                            res.status(200).json({response:"1",msg:"order delivered"});
                            // perma.findById({_id:user_id}).then(user=>{
                            // axios.post(`${admin_link}/payment/pay_to_driver`,{Order_id:req.body.Order_id,Account_Id:user.Account_Id},{headers:{Authorization: `Bearer ${admin_token}`}}).then(res1=>{
                            //     res.status(200).json({code:"1",msg:""});
                            // }).catch(err=>{
                            //     res.status(200).json({code:"1",msg:"eror paying the driver"})})
                            // }).catch(err=>{res.status(200).json({code:"1",msg:"Order is complete"})})
                    }).catch(err=>{
                        res.status(200).json({response:"3",msg:"Order is complete"});
                    })
                }
                else
                    res.status(401).json({msg:"OTP did not match try again",response:"2"});
            }
        }).catch(err=>{
            console.log("31 Services.js "+err);
            res.status(400).json({msg:"We cannot evaluate your order",response:"3"});
        })
    }
    else
        res.status(401).json({response:"4"});
})
//ended route checking recevier otp//


//function when the order completes//
const order_complete=(Order_id)=>{
    Order.find({Order_id:Order_id},{CurrentStatus:3},{new:true}).then(user=>{
        axios.get(`${user_server_link}/authentication/order_status_update/${Order_id}/3`,{order_id:Order_id}).then(resp=>{
            if(resp.status === 200 || 304)
                return user;
            else
                return 0;
            })
    }).catch(err=>{
        console.log(err);
        return 0;
    })
}
//ended function when order completes//

//route to delete the order when a user cancels a order//
router.get('/delete_order/:order_id',(req,res)=>{
    Order.findOne({Order_id:req.params.order_id}).then(user1=>{
         console.log("+++++++++++++++++++++++++++++++++",user1,"++++++++++++___________SSSSSSSSSSS")
          if(user1!=null){
         if(user1.CurrentStatus===1){
            Order.findOneAndUpdate({Order_id:req.params.order_id},{CurrentStatus:4}).then(user=>{
                res.status(200).json({response:"1"});
            }).catch(err=>{
                res.status(400).json({response:"0"});
            })
        }
        else{
            res.status(200).json({status:"delivery is already done unable to cancel"});
        }
    }else{
        console.log("else is run")
        res.status(200).json({status:"deliver database not order"});
    }
    }).catch(err=>res.status(400).json({json:"This order is still not accepted y driver"}))
  
})
//route to delete order ended//



//route to get the pending orders list//
router.get('/pending_order',get_token,(req,res)=>{
    const user_id=decodeToken(req.token).user;
    if(user_id){
        perma.findById({_id:user_id}).then(user=>{
            axios.get(`${user_server_link}/authentication/pending_order`).then(res1=>{
                res.status(200).json(res1.data.reverse());
            }).catch(err=>{console.log(err)})
        }).catch(err=>{
            res.status(400).json({msg:"You are not valid user",response:"1"});
        })
    }
    else
        res.status(400).json({msg:"You are not authenticated to use this route",response:"2"});
})
//route to get the pending order list ended//

//route to get the all orders
router.get('/order',(req,res)=>{
    Order.find({}).then(user=>{
        user.reverse();
        res.status(200).json(user);
    })
})
//route ended///


//route to get pending orders
router.get('/pending_order',(req,res)=>{
    Order.find({}).then(user=>{
        user.reverse();
        res.status(200).json(user);
    }).catch(err=>{
        res.status(400).json(err);
    })
})
//route ended


//route to individual orders//
router.post('/get_order',get_token,(req,res)=>{
    const user_id=decodeToken(req.token).user;
    if(user_id){
        perma.findById({_id:user_id}).then(user=>{
            Order.find({Order_id:req.body.Order_id}).then(user=>{
                console.log("170 js"+user);
                res.status(200).json(user);
            }).catch(err=>{
                console.log("173"+err);
                res.status(400).json({msg:"error fetching data",response:"1"});
            })
        }).catch(err=>{
            console.log(err);
            res.status(400).json({msg:"You are not a valid user",response:"2"});
        })
    }
    else
        res.status(400).json({msg:"You are not authenticated to use this route",response:"3"});
})
//route ended///

//route to get pending driver///
router.get('/get_unverified_user',(req,res)=>{
    temp.find({}).then(user=>{
        res.status(200).json(user);
    }).catch(err=>{
        console.log(err);
    })
})
//route ended//

//route to check if user exist with this email address//
router.get('/search_email/:email',(req,res)=>{
    perma.findOne({Email:req.params.email}).then(user=>{
        if(user)
            res.status(400).json({msg:"yes"});
        else
            res.status(200).json({msg:"cant find"});
    }).catch(err=>{
        res.status(200).json({msg:"cant find"})
    })
})
//route ended

router.post("/rating",function(req,res){
    
    Order.findOneAndUpdate({Order_id:req.body.Order_id},{rating:req.body.rating,comment:req.body.comment}).then(res1=>{
            
        res.status(200).json({response:"0",status:"success"});
       
    }).catch(err=>{
        res.status(400).json({response:"1",error:"rating error"});

    })
});



router.get('/order/complete',(req,res)=>{
    Order.find({CurrentStatus:3}).then(user=>{
        user.reverse();
        res.status(200).json(user);
    })
})

// new
router.post('/order',(req,res)=>{
    Option={
        "sort":"-_id",
			"limit": 10,
			"skip": (req.body.page - 1) * 10
    }
    Order.find({CurrentStatus:req.body.CurrentStatus},undefined,Option, function(err, results) { 
        res.status(200).json(results)
     });
})



// new



module.exports={
   service_route:router
}