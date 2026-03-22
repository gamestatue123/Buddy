const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('dpp', {
        title: 'DPP Logger | Buddy',
        page: 'dpp'
    });
});

module.exports = router;