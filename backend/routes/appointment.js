const express = require('express')
const requireRole = require('../middleware/requireRole')
const requireAuth = require('../middleware/requireAuth')
const {requestAppointment, updateAppointmentStatus, getPendingAppointment, getVisitorAppointments, rescheduleAppointments} = require('../controller/appointmentController')

const appointmentRouter = express.Router()

/**
 * Route:       /api/visitor/
 * Method:      GET
 * Description: getting the pending visitor's appointment
 * Access:      Public
 * Parameters:  None
 */
appointmentRouter.get("/visitor", getVisitorAppointments)

/**
 * Route:       /api/:id/reschedule
 * Method:      PATCH
 * Description: reschedule an appointment
 * Access:      Public
 * Parameters:  id
 */
appointmentRouter.patch("/:id/reschedule", rescheduleAppointments)



/**
 * Route:       /api/appointments/
 * Method:      POST
 * Description: Create or schedule an appointment
 * Access:      Public
 * Parameters:  None
 */
appointmentRouter.post('/', requestAppointment)

// Protected routes for authorized staff
appointmentRouter.use(requireAuth)

/**
 * Route:       /api/appointments/:id
 * Method:      PATCH
 * Description: Update appointment status
 * Access:      Protected 
 * Parameters:  ID
 */
appointmentRouter.patch('/:id', requireRole('Admin', 'Employee'), updateAppointmentStatus)

/**
 * Route:       /api/appointments/pending
 * Method:      GET
 * Description: Get all pending appointment
 * Access:      Protected (Admin/Host)
 * Parameters:  None
 */
appointmentRouter.get('/pending', requireRole('Admin'), getPendingAppointment)

module.exports = appointmentRouter