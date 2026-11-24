const noteModel = require('../model/notes.model');
const mongoose = require('mongoose');

async function CreateNotes(req, res) {
    try {
        const { title, description } = req.body;
        const id = req.user.id

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Title is Required"
            });
        }

        const note = await noteModel.create({
            title,
            description,
            user: id,
        });

        res.status(201).json({
            message: "Note Created",
            note
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function GetAllNotes(req, res) {
    try {
        const id = req.user.id
        const notes = await noteModel.find({ user: id });

        res.status(200).json({
            message: "All Notes Fetched",
            notes
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function GetOneNote(req, res) {
    try {
        const _id = req.params.id;
        const id = req.user.id

        if (!mongoose.isValidObjectId(_id)) {
            return res.status(400).json({
                message: "Invalid Note ID"
            });
        }

        const note = await noteModel.findOne({ _id: _id, user: id });

        if (!note) {
            return res.status(404).json({
                message: "Note Not Found"
            });
        }

        res.status(200).json({
            message: "Note Fetched",
            note
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function UpdateNote(req, res) {
    try {
        const { title, description } = req.body;
        const _id = req.params.id;
        const id = req.user.id;

        if (!mongoose.isValidObjectId(_id)) {
            return res.status(400).json({
                message: "Invalid Note ID"
            });
        }

        const updateData = {};

        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({
                    message: "Title cannot be empty"
                });
            }
            updateData.title = title.trim();
        }

        if (description !== undefined) {
            if (typeof description !== 'string') {
                return res.status(400).json({
                    message: "Description must be a string"
                });
            }
            updateData.description = description;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No fields provided for update"
            });
        }

        const note = await noteModel.findOneAndUpdate(
            { _id, user: id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({
                message: "Note Not Found"
            });
        }

        return res.status(200).json({
            message: "Note Updated Successfully",
            note
        });

    } catch (err) {
        console.error("UpdateNote Error:", err);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function DeleteNote(req, res) {
    try {
        const _id = req.params.id;
        const id = req.user.id

        if (!mongoose.isValidObjectId(_id)) {
            return res.status(400).json({
                message: "Invalid Note ID"
            });
        }

        const note = await noteModel.findOneAndDelete({_id : _id , user : id});

        if (!note) {
            return res.status(404).json({
                message: "Note Not Found"
            });
        }

        res.status(200).json({
            message: "Note Deleted Successfully",
            note
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    CreateNotes,
    GetAllNotes,
    GetOneNote,
    UpdateNote,
    DeleteNote
};
