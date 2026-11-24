const express = require('express')
const noteController = require('../controllers/notes.controller')
const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router();

router.post('/create' , authMiddleware, noteController.CreateNotes)
router.get('/getall' , authMiddleware, noteController.GetAllNotes)
router.get('/get/:id' , authMiddleware, noteController.GetOneNote)
router.patch('/update/:id' , authMiddleware, noteController.UpdateNote)
router.delete('/delete/:id' , authMiddleware, noteController.DeleteNote)


module.exports = router