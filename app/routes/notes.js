var express = require('express');
var router = express.Router();
const Note = require('../models/notes');
const withAuth = require('../middlewares/auth');
const { json } = require('express');

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

router.get('/:id', withAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let note = await Note.findById(id);
    if (isOwner(req.user, note)) {
      res.json(note)
    } else {
      res.status(403).json({ error: 'Access denied.' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error while getting a note.' })
  }
})

router.get('/', withAuth, async (req, res) => {
  try {
    let notes = await Note.find({ author: req.user._id })
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error })
  }
})

router.put('/:id', withAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (isOwner(req.user, note)) {
      note.title = req.body.title;
      note.body = req.body.body;
      note.updated_at = Date();
      await Note.findByIdAndUpdate(req.params.id, note)
      res.json(note).status(200)
    } else {
      res.status(403).json({ error: 'Access denied.' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Problem to update a note' })
  }
})

router.delete('/:id', withAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (isOwner(req.user, note)) {
      await note.delete()
      res.json(note).status(204)
    } else {
      res.status(403).json({ error: 'Access denied.' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Problem to delete a note' })
  }
})

const isOwner = (user, note) => {
  if (JSON.stringify(user._id) == JSON.stringify(note.author._id)) {
    return true
  } else {
    return false
  }
}

module.exports = router;