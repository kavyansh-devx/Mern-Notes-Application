const userModel = require('../model/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config();

const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
};

async function registerUser(req, res) {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({
                error: "Both username and password is required!"
            })
        }
        if (await userModel.findOne({ username: username })) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            password: hashedPassword,
        })

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, { expiresIn: '1d' })


        res.cookie('token', token, {
            ...authCookieOptions,
            maxAge: 24 * 60 * 60 * 1000
        });


        res.status(201).json({
            message: "User Created",
            user: {
                id: user._id,
                username: user.username
            }
        })
    } catch (err) {
        return res.status(500).json({
            error: "Internal Server Error",
            err
        })
    }
}


async function loginUser(req, res) {
    try {

        const { username, password } = req.body;


        if (!username || !password) {
            return res.status(400).json({
                message: "Both username and password are required!"
            })
        }
        const user = await userModel.findOne({
            username: username
        })

        if (!user) {
            return res.status(401).json({
                error: "User not Found!"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: "Password You entered is incorrect"
            })
        }

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.cookie('token', token, {
            ...authCookieOptions,
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successfully",
            token,
            user: {
                id: user._id,
                username: user.username
            }
        })


    } catch (err) {
        return res.status(500).json({
            error: "Internal Server Error",
            err
        })
    }
}

async function logOutUser(req, res) {
    res.clearCookie('token', authCookieOptions);

    return res.status(200).json({
        message: "User LoggedOut Successfully"
    });
}

async function getCurrentUser(req, res) {
    try {
        const userId = req.user.id

        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: "User dosen't Exist!"
            })
        }

        res.status(200).json({
            message: "User Fetched",
            user: {
                id: user._id,
                username: user.username
            }
        })
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            err
        })
    }
}

module.exports = { registerUser, loginUser, logOutUser, getCurrentUser }
