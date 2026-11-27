const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {generatePass, getPasses, preRegisterVisitor} = require('../controller/passController')
const requireRole = require('../middleware/requireRole')
const passRouter = express.Router()
passRouter.use(requireAuth)

/**
 * Route:       /api/passes/
 * Method:      POST
 * Description: Create new passes
 * Access:      Protected 
 * Parameters:  None
 */
passRouter.post('/', requireRole('Admin', 'Employee'), generatePass)


passRouter.post('/pre-register', requireRole('Admin', 'Employee'), preRegisterVisitor)
/**
 * Route:       /api/passes/
 * Method:      GET
 * Description: Get all passes
 * Access:      Protected 
 * Parameters:  None
 */
passRouter.get('/', requireRole('Admin', 'Security'), getPasses)

module.exports = passRouter