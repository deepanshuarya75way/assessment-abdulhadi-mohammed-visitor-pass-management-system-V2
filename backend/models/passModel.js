const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passSchema = new Schema({
    appointmentId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Appointment'
    },
    visitorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    },
    hostName:{
        type: String,
    },
    purpose:{
        type: String,
    },
    // unique code to lookup 
    reservationCode:{
        type: String,
        unique: true,
        sparse: true
    },
    meetingRoom:{
        type: String,
    },
    isPreApproved:{
        type: Boolean,
        default: false
    },

    qrCode:{
        type: String,
        required: true,
    },
    pdfUrl:{
        type: String,
        required: true,
    },
    validUntil:{
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Issued', 'Checked In', 'Checked Out', 'Rejected'],
        default: 'Issued'
    }
},{timestamps: true}) 

module.exports = mongoose.model("Pass", passSchema)