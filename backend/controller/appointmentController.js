const appointmentModel = require('../models/appointmentModel');
const mongoose = require('mongoose')
const visitorModel = require('../models/visitorModel')

exports.requestAppointment = async(req,res)=>{
    const {visitorId, hostId, hostName, purpose, dateTime} = req.body;

    // checking for empty fields
    const emptyFields = []
    if(!visitorId){emptyFields.push('Visitor_ID')}
    if(!dateTime){emptyFields.push('Time')}
    if(emptyFields.length>0){
        return res.status(400).json({error: 
            'Please fill all the mandatory fields!', emptyFields
        })
    }
    try {
        // If an appointment was already initiated in Pending state for this visitor, update it
        let appointment = await appointmentModel.findOne({ visitorId, status: 'Pending' }).sort({ createdAt: -1 });
        if (appointment) {
            appointment.dateTime = dateTime;
            if (hostId) appointment.hostId = hostId;
            if (hostName) appointment.hostName = hostName;
            if (purpose) appointment.purpose = purpose;
            await appointment.save();
        } else {
            appointment = await appointmentModel.create({
                visitorId,
                hostId: hostId || undefined,
                hostName: hostName || 'Security Desk',
                purpose: purpose || 'Official Visit',
                dateTime,
                status: 'Pending'
            });
        }
        res.status(201).json(appointment)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

exports.updateAppointmentStatus = async (req,res)=>{
    const {id} = req.params;
    const {status} = req.body;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid ID'})
    }
    try{
        const updatedAppointment = await appointmentModel.findByIdAndUpdate(id, {status}, {new: true})
        
        if(!updatedAppointment){
            return res.status(404).json({error: 'Appointment not found'})
        }
        res.status(200).json(updatedAppointment)
        
    }catch(error){
        res.status(404).json({error: error.message})
    }
}

exports.getPendingAppointment = async(req, res)=>{
    try{
        const appointments = await appointmentModel.find({status: 'Pending'})
        .populate('visitorId')
        .populate('hostId', 'name email')
        .sort({createdAt: -1})

        res.status(200).json(appointments)
    }
    catch(error){
        res.status(400).json({ error: error.message })
    }
}


exports.getVisitorAppointments = async(req, res)=>{
    const email = req.query.email?.trim().toLowerCase()
    if(!email){
        return res.status(400).json({error: "Email not available"})
    }
    try{
        const visitor = await visitorModel.findOne({email})
        if(!visitor){
            return res.status(404).json({error: "No visitor found"})
        }

        const appointments = await appointmentModel.find({visitorId: visitor._id})
        .populate("visitorId", "name email phone")
        .sort({dateTime: -1})

        res.status(200).json(appointments)
        
    }
    catch(error){
        res.status(400).json({ error: error.message })
    }
}

exports.rescheduleAppointments = async(req, res) => {
    const {id} = req.params
    const {dateTime, email} = req.body

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid ID'})
    }

    if(!dateTime){
        return res.status(400).json({error: "Date time required"})
    }

    const parsedDate = new Date(dateTime)
    
    if(parsedDate <= new Date()){
        return res.status(400).json({error: "Invalid date"}) // for future date req
    }


    try{
        const appointment = await appointmentModel.findById(id).populate("visitorId", "name email phone")
        if(!appointment){
            return res.status(404).json({error: "Appointment not found"})
        }
        if(appointment.status !== "Pending"){
            return res.status(400).json({error: "Cannot reschedule this appointment"})
        }

        if(!req.user){
            const normalizedEmail = email?.trim().toLowerCase()
            if(!normalizedEmail || appointment.visitorId?.email?.toLowerCase() !== normalizedEmail){
                return res.status(404).json({error: "Email not found"})
            }
        }

        if(new Date(appointment.dateTime).getTime() === parsedDate.getTime()){
            return res.status(400).json({error: "New and old dates can't be same"})
        }

        const duplicateTime = await appointmentModel.findOne({
            _id:{$ne: id}, 
            visitorId: appointment.visitorId._id, 
            dateTime: parsedDate,
            status: "Pending"
        })
        if(duplicateTime){
            return res.status(400).json({error: "Duplicate appointments for same time"})
        }

        appointment.dateTime = parsedDate
        appointment.rescheduleAt = new Date()
        appointment.rescheduleCount = (appointment.rescheduleCount || 0) + 1


        await appointment.save()
        res.status(200).json(appointment)
    }
    catch(error){
        res.status(400).json({ error: error.message })
    }
}