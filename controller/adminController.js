const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
};

const loadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.error('Error loading login page:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

const verifyAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.render('login', { message: 'Invalid User' });
        }

        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.render('login', { message: 'Invalid Password' });
        }

        if (userData.is_admin !== 1) {
            return res.render('login', { message: 'Invalid admin' });
        }

        req.session.user_id = userData._id;
        console.log('Admin authenticated, redirecting to home...');
        return res.redirect('/admin/home');
    } catch (error) {
        console.error('Error verifying admin:', error.message);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
};

const searchUser = async (req, res) => {
    try {
        const search = req.body.search.trim().replace(/[^a-zA-Z0-9]/g, "");
        const searchData = await User.find({
            $and: [
                { name: { $regex: new RegExp(search, "i") } },
                { is_admin: 0 }
            ]
        }).sort({ name: 1 });

        if (searchData.length > 0) {
            return res.render('search-user', { user: searchData });
        } else {
            return res.render('search-user', { message: 'No user found' });
        }
    } catch (error) {
        console.error('Error searching users:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

const loadAdminHome = async (req, res) => {
    try {
        const userData = await User.findById(req.session.user_id);

        if (!userData) {
            return res.redirect('/admin');
        }

        return res.render('home', { user: userData });
    } catch (error) {
        console.error('Error loading admin home:', error.message);
        if (!res.headersSent) {
            return res.status(500).send('Internal Server Error');
        }
    }
};

const adminLogout = async (req, res) => {
    try {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err.message);
                    return res.status(500).send('Internal Server Error');
                }
                return res.redirect('/admin');
            });
        } else {
            return res.redirect('/admin');
        }
    } catch (error) {
        console.error('Error logging out:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

const loadDashboard = async (req, res) => {
    try {
        const usersData = await User.find({is_admin: 0}).sort({name: 1})
        res.render('dashboard', {user: usersData})
    } catch (error) {
        console.error(error.message);
        
    }
}

const userAddpage = async (req, res) => {
    try {
        res.render('new-user')
    } catch (error) {
        console.error(error.message)
    }
};

const addNewUser = async (req, res) => {
    try {
        const hashedPassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            contact: req.body.contact,
            password: hashedPassword,
            is_admin: 0
        });

        const userData = await user.save();

        if (userData) {
            return res.redirect('/admin/dashboard');
        } else {
            return res.render('new-user', { message: "Registration failed. Please try again." });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.render('new-user', { message: 'Email already exists! Please use a different email.' });
        } else {
            console.error('Error adding new user:', error.message);
            return res.render('new-user', { message: 'An error occurred while processing your request.' });
        }
    }
};

const editUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findByIdAndUpdate(id);

        if (userData) {
            return res.render('user-edit', { user: userData });
        } else {
            return res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.error('Error loading user edit page:', error.message);
        return res.status(500).send('Internal Server Error');
    }
};

const modifyUser = async (req, res) => {
    try {
        const { email, name, contact, id } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: { email, name, contact } },
            { new: true }
        );

        if (user) {
            return res.redirect('/admin/dashboard');
        } else {
            return res.render('user-edit', { message: 'Error occurred during the update.' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.render('user-edit', { message: 'Email already exists! Please use a different email.' ,user: req.body});
        } else {
            console.error('Error modifying user:', error.message);
            return res.render('user-edit', { message: 'An error occurred during the update.', user: req.body });
        }
    }
};

const deleteUser = async (req, res) =>{
    try {
        const id = await req.query.id ;
        await User.deleteOne({_id: id})

        res.redirect('/admin/dashboard')
    } catch (error) {
        console.error(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyAdmin,
    loadAdminHome,
    adminLogout,
    loadDashboard,
    userAddpage,
    addNewUser,
    editUser,
    modifyUser,
    deleteUser,
    searchUser
};