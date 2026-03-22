const express = require('express');
const router = express.Router();

// GET /syllabus - Render syllabus tracker page
router.get('/', (req, res) => {
    res.render('syllabus', {
        title: 'Syllabus Tracker | Buddy',
        page: 'syllabus'
    });
});

module.exports = router;