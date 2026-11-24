const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: false,
    },


    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    }

}, {
    timestamps: true
})

const notesModel = mongoose.model('note' , notesSchema)
module.exports = notesModel