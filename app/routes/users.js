var express = require('express');
var router = express.Router();
const User = require('../models/user');
const withAuth = require('../middlewares/auth');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const Notes = require('../models/notes');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  try {
    await user.save()
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error registering new user' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Incorrect email or password' })
    } else {
      user.isCorrectPassword(password, function (err, same) {
        if (!same) {
          res.status(401).json({ error: 'Incorrect email or password' })
        } else {
          const token = jwt.sign({ email }, secret, { expiresIn: '10d' });
          res.json({ user: user, token: token })
        }
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal error, please try again.' })
  }
})
//Delete and Update
router.put('/edit/name', withAuth, async (req, res) => {
  let { name } = req.body;
  try {
    await User.findOneAndUpdate({ _id: req.user._id }, { $set: { name: name } })
    res.status(200).json({ update: 'ok' })
  } catch (error) {
    res.status(500).json({ error: 'Internal error, please try again.' })
  }
})
router.put('/edit/email', withAuth, async (req, res) => {
  let { email } = req.body;
  try {
    await User.findOneAndUpdate({ _id: req.user._id }, { $set: { email: email } })
    const token = jwt.sign({ email }, secret, { expiresIn: '10d' });
    res.json({ token: token }).status(200)
  } catch (error) {
    res.status(500).json({ error: 'Internal error, please try again.' })
  }
})
router.put('/edit/password', withAuth, async (req, res) => {
  let { password } = req.body;
  try {
    req.user.password = password;
    await req.user.save();
    let user = await User.findOneAndUpdate({ _id: req.user._id }, { $set: { password: req.user.password } })
    res.status(200).json({ user: user })
  } catch (error) {
    res.status(500).json({ error: 'Internal error, please try again.' })
  }
})

router.delete('/delete/:id', withAuth, async (req, res) => {
  try {
    await req.user.delete()
    let notes = await Notes.find({ author: req.user._id })
    for (let i = 0; i < notes.length; i++) {
      await Notes.findByIdAndDelete(notes[i]._id)
    }
    res.status(200).json({ delete: 'ok' })
  } catch (error) {
    res.status(500).json({ error: 'Internal error, please try again.' })
  }
})

module.exports = router;
