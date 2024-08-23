const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');


const securePassword = async(password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
};


const loadRegister = async(req, res) => {
    try {
        res.render('registration');
    } catch (error) {
        console.error(error);
    }
};

const insertUser = async(req, res) => {
    try {
        const hashedPassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            contact: req.body.phoneNumber,
            password: hashedPassword,
            is_admin: 0 
        });

        const userData = await user.save();

        if (userData) {
            res.redirect('/login');
        } else {
            res.render('registration', { message: 'Registration failed. Please try again.' });
        }

    } catch (error) {
        if (error.code === 11000) {
            res.render('registration', { message: 'Email already exists! Please use a different email.' });
        } else {
            console.error('Error during registration:', error.message);
            res.render('registration', { message: 'An error occurred during registration.' });
        }
    }
};


const loginLoad = async(req, res) => {
    try {
        res.render('login');
    } catch (error) {
        
        console.error(error);
    }
};


const verifyUser = async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user_id = userData._id;
                res.redirect('/home');
            } else {
                res.render('login', { message: 'Incorrect password. Please try again.' });
            }
        } else {
            res.render('login', { message: 'No user found with this email address.' });
        }
    } catch (error) {
        console.error('Error verifying user:', error.message);
        res.render('login', { message: 'An error occurred during login.' });
    }
};


const loadHome = async(req, res) => {
    try {
        const userData = await User.findById({_id: req.session.user_id})
        res.render('home', {user: userData});
    } catch (error) {
        console.error(error);
    }
};


const userLogout = async(req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err.message);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error logging out:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

const editUser = async (req, res) => {
    try {
        const id = req.session.user_id;
        const userData = await User.findById({_id: id});

        if(userData){
            res.render('user-edit', {user: userData})
        }else {
            res.redirect('/admin/dashboard')
        }

    } catch (error) {
       
        console.error(error.message);
    }
}

const modifyUser = async (req, res) => {
    try {
        const { email, name, contact, id } = req.body;

        const user = await User.findByIdAndUpdate(
            { _id: id },
            { $set: { email, name, contact } },
            { new: true }  
        );

        if (user) {
            res.redirect('/home');
        } else {
            res.render('user-edit', { message: 'Error occurred during the update.', user: req.body });
        }
    } catch (error) {
        if (error.code === 11000) {
            res.render('user-edit', { message: 'Email already exists! Please use a different email.', user: req.body });
        } else {
            console.error('Error modifying user:', error.message);
            res.render('user-edit', { message: 'An error occurred during the update.', user: req.body });
        }
    }
};

const urlError = async(req, res) => {
    try {
        res.status(404).render('404');
    } catch (error) {
        console.error('Error rendering 404 page:', error.message);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyUser,
    loadHome,
    userLogout,
    editUser,
    modifyUser,
    urlError
};