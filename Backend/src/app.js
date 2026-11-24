const express = require('express')
const app = express()
const cors = require('cors')

const noteRouter = require('./routes/notes.route')
const userRouter = require('./routes/auth.route')
const cookieParser = require('cookie-parser')


app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}))

app.use(express.json());
app.use(cookieParser());

app.use('/api/notes' , noteRouter)
app.use('/api/auth' , userRouter)


module.exports = app;
