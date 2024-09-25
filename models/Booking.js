const mongoose=require('mongoose')
const BookingSchema=new mongoose.Schema({
    registration_num:{
        type:String
    },
    vehicle:{
        type:String,
    },
    arrival_date:{
        type: Date,
    },
    arrival_time:{
        type:String
    },
    departure_date:{
        type:Date
    },
    departure_time:{
        type:String
    },
    city:{
        type:String
    },
    slotNumber:{
        type: Number
    },
    
})
const Booking=new mongoose.model("Booking",BookingSchema)
module.exports=Booking