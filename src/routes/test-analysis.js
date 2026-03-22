const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('test-analysis', {
        title: 'Test Analysis Pro | Buddy',
        page: 'test-analysis'
    });
});

module.exports = router;