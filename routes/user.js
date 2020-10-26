const router = require('express').Router();

const { json } = require('body-parser');
//Bringing the userRegister function
const {userRegister, userLogin, userAuth,serializeUser, checkRole} = require('../utils/Auth');
//User registration route
router.post('/register-user', async (req, res) => {
    await userRegister(req.body, 'user', res);
})

//Admin registration route
router.post('/register-admin', async (req, res) => {

    await userRegister(req.body, 'admin', res);
})


//Superadmin registration route
router.post('/register-super-admin', async (req, res) => {
    await userRegister(req.body, 'super-admin', res);
})


//User login route
router.post('/login-user', async (req, res) => {
    await userLogin(req.body, "user", res);
})


//Admin login route
router.post('/login-admin', async (req, res) => {
    await userLogin(req.body, "admin", res);
})


//Superadmin login route
router.post('/login-super-admin', async (req, res) => {
    await userLogin(req.body, "super-admin", res);
})


//Profile route
router.get('/profile',userAuth,async(req, res) => {
    return res.json(serializeUser(req.user));
})

//User protected route
router.get('/user-protected', userAuth,checkRole(['user']), async (req, res) => {
    return res.json('Hello user')
})


//Admin protected route
router.get('/admin-protected', userAuth,checkRole(['admin']), async (req, res) => {
    return res.json('Hello admin')
})


//Superadmin protected route
router.get('/super-admin-protected', userAuth,checkRole(['super-admin']), async (req, res) => {
    return res.json('Hello super-admin')
})



module.exports = router;