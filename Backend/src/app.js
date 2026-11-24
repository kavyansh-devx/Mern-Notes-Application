
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const noteRouter = require('./routes/notes.route');
const userRouter = require('./routes/auth.route');

const allowedOrigins = (
    process.env.CLIENT_ORIGINS || 'http://localhost:5173'
)
    .split(',')
    .map(origin => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running'
    });
});

app.use('/api/notes', noteRouter);
app.use('/api/auth', userRouter);

module.exports = app;
