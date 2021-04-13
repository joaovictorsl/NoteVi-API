var express = require('express');
var router = express.Router();
const Note = require('../models/notes');
const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async (req, res) => {
  const { title, body } = req.body;

  try {
    let note = new Note({ title: title, body: body, author: req.user._id });
    await note.save();
    res.status(200).json(note)
  } catch (error) {
    res.status(500).json({ error: 'Error while creating a new note.' })
  }
})
module.exports = router;