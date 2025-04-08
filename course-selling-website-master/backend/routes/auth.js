const express = require('express');
const router = express.Router();

// Sample register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // store user in DB (add encryption for production)
  res.json({ msg: 'User registered' });
});

module.exports = router;
