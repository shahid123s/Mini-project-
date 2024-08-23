const mongoose = require('mongoose');
const express = require('express');
const path = require('path')

const mongoUrl = 'mongodb+srv://shahidnoushad04:ShahidN%4012@cluster0.ruygf.mongodb.net/'

async function connect() {
    try {
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
}

connect();
const app = express();
const port =4000;

app.use(express.static('./public'))

const adminRoute = require('./routes/adminRoutes')
app.use('/admin', adminRoute)

const userRoute = require('./routes/userRoutes')
app.use('/',userRoute )

app.listen(port, () => console.log(`Server listening on port ${port}`));