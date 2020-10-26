const User = require('../models/User');
const {SECRET} = require('../config/index');

//Bcrypt
const bcrypt = require('bcrypt');

//Passport
const passport = require('passport');

//JWT
const jwt = require('jsonwebtoken');
const { session } = require('passport');

const router = require('express').Router();

/**
 * @DESC To register the user (USER, ADMIN, SUPERADMIN)
 */

const userRegister = async(userDets, role, res) => {
    
    try {
        //Vaildate the user
        const usernameTaken = await validateUsername(userDets.username);
        if (usernameTaken){
            res.status(400).json({
                message: `Username is already taken`,
                success: false
            })
        }
        //Vaildate the email
        const emailRegistered = await validateEmail(userDets.email);
        if (emailRegistered){
            res.status(400).json({
                message: `Email is already registered`,
                success: false
            })
        }

        //Hashing the password
        const hashedPassword = await bcrypt.hash(userDets.password, 14);

        //Create a new user
        const newUser = new User({
            ...userDets,
            password: hashedPassword,
            role
        });

        await newUser.save();

        return res.status(201).json({
            message: 'User created successfully',
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Unable to create the user',
            success: false,
            error
        })
    }

}


//Users Validation
const validateUsername =  async(username) => {
    let usernameExists = await User.findOne({username});
    return usernameExists ? true : false;
}
const validateEmail =  async(email) => {
    let emailExists = await User.findOne({email});
    return emailExists ? true : false;
}
//End users validation


/**
 * @DESC To log the user (USER, ADMIN, SUPERADMIN)
 */


const userLogin = async(userCreds, userRole,res) => {
    let {username, password} = userCreds;
    //Find if the username exists in DB
    const user = await User.findOne({username});
    if(!user){
        return res.status(404).json({
            message: 'Username was not found',
            success: false
        })
    }
    //Verifying the role
    if(user.role !== userRole){
        return res.status(403).json({
            message: 'Make sure you are loggin in from the right portal',
            success: false
        })
    }
    //Verifying the password
    let isMatch = await bcrypt.compare(password,user.password);
    if(isMatch){
        const token = jwt.sign({
            user_id : user._id,
            role: user.role,
            username: user.username,
            email: user.email
        }, SECRET, {expiresIn: '3 hours'});
    
        let result = {
            role: user.role,
            username: user.username,
            email: user.email,
            token: `Bearer ${token}`,
            expiresIn: 168 
        }
        return res.status(200).json({
            ...result,
            message: 'Logged in',
            success: true
        })
    }
    else{
        return res.status(403).json({
            message: 'Incorrect credentials',
            success: false
        })
    }
    
}

/**
 * @DESC Passport middlware
 */

const userAuth = passport.authenticate('jwt', {session: false});

/**
 * @DESC Check role middleware
 */

const checkRole = roles => (req, res, next) => !roles.includes(req.user.role) ? res.status(401).json('Unauthorized') : next();

const serializeUser = user => {
    return {
        username: user.username,
        email: user.email,
        role: user.role,
        _id: user._id,
        name: user.name,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
    };
}


module.exports = {userRegister, userLogin, userAuth, serializeUser, checkRole};