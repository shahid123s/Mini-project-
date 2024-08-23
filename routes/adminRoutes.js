const express = require('express')
const admin_routes = express()
const adminController = require('../controller/adminController')
const session = require('express-session')
const config = require('../config/config')
const auth = require('../middleware/adminAuth');
const bodyParser = require('body-parser')

admin_routes.use(auth.nocache)

admin_routes.use(session({
    secret: config.sessionSecret,
    resave:false,
    saveUninitialized:true,
}))

admin_routes.use(bodyParser.json())
admin_routes.use(bodyParser.urlencoded({extended: true}))

admin_routes.set('view engine', 'ejs')
admin_routes.set('views', './view/admin')

admin_routes.get('/', auth.isLogout, adminController.loadLogin)
admin_routes.post('/',adminController.verifyAdmin)

admin_routes.get('/home', auth.isLogin, adminController.loadAdminHome)

admin_routes.get('/logout', auth.isLogin, adminController.adminLogout)

admin_routes.get('/dashboard', auth.isLogin, adminController.loadDashboard)
admin_routes.post('/dashboard', auth.isLogin, adminController.searchUser)

admin_routes.get('/new-user', auth.isLogin, adminController.userAddpage)
admin_routes.post('/new-user', auth.isLogin, adminController.addNewUser)

admin_routes.get('/user-edit', auth.isLogin, adminController.editUser)
admin_routes.post('/user-edit', auth.isLogin, adminController.modifyUser)

admin_routes.get('/user-delete', auth.isLogin, adminController.deleteUser)

admin_routes.get('/login', (req, res) => {
    res.redirect('/admin');
})

module.exports =  admin_routes
