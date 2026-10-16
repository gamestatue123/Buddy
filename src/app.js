const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Import routes
const timetableRoutes = require('./routes/timetable');
const dppRoutes = require('./routes/dpp');
const syllabusRoutes = require('./routes/syllabus');
const testAnalysisRoutes = require('./routes/test-analysis');


// Set view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.get('/api/gifs/config', (req, res) => {
    // GIPHY's search API is designed for client-side requests, so use a dedicated web key.
    const apiKey = process.env.GIPHY_API_KEY || '';
    res.set('Cache-Control', 'no-store');
    res.json({ provider: 'giphy', enabled: Boolean(apiKey), apiKey });
});
// Add this middleware to serve mobile-optimized content
app.use((req, res, next) => {
    // Check if request is from Android app
    const isAndroidApp = req.headers['user-agent']?.includes('com.buddy.app') ||
                         req.headers['x-capacitor'] === 'true';
    
    if (isAndroidApp) {
        res.set('X-Frame-Options', 'SAMEORIGIN');
        res.set('Cache-Control', 'no-cache');
    }
    next();
});

// Routes
app.use('/timetable', timetableRoutes);
app.use('/dpp', dppRoutes);
app.use('/syllabus', syllabusRoutes);
app.use('/test-analysis', testAnalysisRoutes);


app.get('/', (req, res) => {
    res.render('index', {
        title: 'Buddy | JEE Study Assistant',
        user: 'Student'
    });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Buddy is running at http://localhost:${port}`);
    });
}

module.exports = app;
