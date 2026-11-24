const dns = require('dns');

dns.setServers([
    '8.8.8.8',
    '8.8.4.4'
]);

require('dotenv').config();
const mongoose = require('mongoose');

async function ConnectDB(){
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected To DB")
}

module.exports = ConnectDB;
