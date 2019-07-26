
//modules imports
const mongoose=require('mongoose');


const {mongourl}=require('../urls/links');


mongoose.connect(mongourl,{useNewUrlParser:true,useCreateIndex:true},(err,db)=>{
    if(err)
        console.log("db.js 11"+err);
    else
        console.log("database connected");
})

 

const Order_Schema=new mongoose.Schema({
    User_id:String,
    Name:String,
    Phone:String,
    Email:String,
    Order_id:{type:String,unique:true},
    Driver_id:String,
    Commodity:String,
    Receving_Address:String,
    Delivery_Address:String,
    Giver_Name:String,
    Giver_Phone:String,
    Giver_Email:String,
    Recevier_Phone:String,
    Recevier_Name:String,
    Recevier_Email:String,
    Price:String,
    Earning:String,
    CurrentStatus:{type:Number,default:1},
    Sender_Otp:String,
    Recevier_Otp:String,
    Weight:String,
    Date:String,
    Pickup_Date:String,
    Landmark:String,
    Height:String,
    Length:String,
    Width:String,
    Order_Stamp:String,
    Delivered_On:String,
    Delivery_Date_User:String,
    photo_id:String,
    isPaid:{type:Boolean,default:false},
    G_Latitude:String,
    G_Longitude:String,
    R_Latitude:String,
    R_Longitude:String,
    Charge_id:String,
    Pickup_Time:String,
    Delivery_Time:String,
    refund:String,
    refund_fine:String,
    show:String,
    rating:String,
    comment:String
})

const temp_schema=new mongoose.Schema({
    device_id:String,
    Name:String,
    Password:String,
    MobileNo:{type:String},
    Email:{type:String,unique:true},
    IMEI:{type:String},
    Flag:{type:Number,default:0},
    Date:{type:Date},
    Account_Id:String,
    response:{type:String},
})
const perma_schema=new mongoose.Schema({
    device_id:String,
    Name:String,
    Password:String,
    MobileNo:{type:String},
    Email:{type:String,unique:true},
    IMEI:{type:String},
    Flag:{type:Number,default:0},
    Date:{type:Date},
    Account_Id:String,
    response:{type:String},
    History:[{Order_id:String,CurrentStatus:{type:Number,default:0}}],
    image:{type:String}
})

const temp_model=mongoose.model('temp',temp_schema);
const perma_model=mongoose.model('perma',perma_schema);
const Order=mongoose.model('Order',Order_Schema);

module.exports={
    temp:temp_model,
    perma:perma_model,
    Order,
}
