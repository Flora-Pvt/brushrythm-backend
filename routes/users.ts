const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/users.ts')

const limiter = require('../middlewares/rate-limiter.ts')
const auth = require('../middlewares/auth.ts')

router.post('/signup', limiter, userCtrl.signup)
router.post('/login', limiter, userCtrl.login)

router.get('/:id', auth, userCtrl.getUserById)
router.patch('/:id', auth, userCtrl.updateUser)

module.exports = router
