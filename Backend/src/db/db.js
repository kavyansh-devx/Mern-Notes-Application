const dns = require('dns');

dns.setServers([
    '8.8.8.8',
    '8.8.4.4'
]);

require('dotenv').config();

const mongoose = require('mongoose');

async function ConnectDB() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB');
}

module.exports = ConnectDB;

