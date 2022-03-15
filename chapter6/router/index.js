const express = require('express');

const router = express.Router();

//GET router
router.get('/', (req, res) => {
    res.send('Hello user');
});

module.exports = router;