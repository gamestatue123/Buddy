const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Data file paths
const dataDir = path.join(__dirname, '../../data');
const tasksFile = path.join(dataDir, 'tasks.json');
const scheduleFile = path.join(dataDir, 'schedule.json');
const testsFile = path.join(dataDir, 'tests.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files if they don't exist
function initDataFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

// Default data structures
initDataFile(tasksFile, {
    daily: [], // { id, text, completed, date, createdAt }
    recurring: [] // { id, text, completed, lastCompleted, streak }
});

initDataFile(scheduleFile, {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
});

initDataFile(testsFile, []); // { id, name, date, syllabus, chapters, completedChapters, preparationNotes, createdAt }

// Helper functions
function readData(filePath) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

function writeData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Get today's date string
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// ========== TASKS ROUTES ==========
// Get all tasks for today
router.get('/api/tasks', (req, res) => {
    const tasksData = readData(tasksFile);
    const today = getTodayDate();
    
    // Filter tasks for today
    const todayTasks = tasksData.daily.filter(task => task.date === today);
    
    res.json({
        success: true,
        tasks: todayTasks,
        streak: tasksData.recurring.filter(t => t.completed).length
    });
});

// Add new task
router.post('/api/tasks', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ success: false, error: 'Task text required' });
    }
    
    const tasksData = readData(tasksFile);
    const today = getTodayDate();
    
    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        date: today,
        createdAt: new Date().toISOString()
    };
    
    tasksData.daily.push(newTask);
    writeData(tasksFile, tasksData);
    
    res.json({ success: true, task: newTask });
});

// Toggle task completion
router.put('/api/tasks/:id/toggle', (req, res) => {
    const { id } = req.params;
    const tasksData = readData(tasksFile);
    
    const task = tasksData.daily.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        writeData(tasksFile, tasksData);
        
        // Update streak
        const todayTasks = tasksData.daily.filter(t => t.date === getTodayDate());
        const allCompleted = todayTasks.length > 0 && todayTasks.every(t => t.completed);
        
        if (allCompleted) {
            const today = getTodayDate();
            let streakTask = tasksData.recurring.find(t => t.date === today);
            if (!streakTask) {
                streakTask = { id: Date.now().toString(), text: 'Daily Streak', completed: true, date: today, streak: 1 };
                tasksData.recurring.push(streakTask);
            } else {
                streakTask.completed = true;
                streakTask.streak = (streakTask.streak || 0) + 1;
            }
            writeData(tasksFile, tasksData);
        }
        
        res.json({ success: true, task });
    } else {
        res.status(404).json({ success: false, error: 'Task not found' });
    }
});

// Delete task
router.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const tasksData = readData(tasksFile);
    
    const taskIndex = tasksData.daily.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasksData.daily.splice(taskIndex, 1);
        writeData(tasksFile, tasksData);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'Task not found' });
    }
});

// ========== SCHEDULE ROUTES ==========
// Get weekly schedule
router.get('/api/schedule', (req, res) => {
    const schedule = readData(scheduleFile);
    res.json({ success: true, schedule });
});

// Add or update class
router.post('/api/schedule', (req, res) => {
    const { day, time, subject, teacher, location } = req.body;
    if (!day || !time || !subject) {
        return res.status(400).json({ success: false, error: 'Day, time, and subject required' });
    }
    
    const schedule = readData(scheduleFile);
    const newClass = {
        id: Date.now().toString(),
        time,
        subject,
        teacher: teacher || '',
        location: location || ''
    };
    
    if (!schedule[day.toLowerCase()]) {
        schedule[day.toLowerCase()] = [];
    }
    schedule[day.toLowerCase()].push(newClass);
    // Sort by time
    schedule[day.toLowerCase()].sort((a, b) => a.time.localeCompare(b.time));
    writeData(scheduleFile, schedule);
    
    res.json({ success: true, class: newClass });
});

// Delete class
router.delete('/api/schedule/:day/:id', (req, res) => {
    const { day, id } = req.params;
    const schedule = readData(scheduleFile);
    
    const dayKey = day.toLowerCase();
    if (schedule[dayKey]) {
        const classIndex = schedule[dayKey].findIndex(c => c.id === id);
        if (classIndex !== -1) {
            schedule[dayKey].splice(classIndex, 1);
            writeData(scheduleFile, schedule);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Class not found' });
        }
    } else {
        res.status(404).json({ success: false, error: 'Day not found' });
    }
});

// ========== TESTS ROUTES ==========
// Get all tests
router.get('/api/tests', (req, res) => {
    const tests = readData(testsFile);
    res.json({ success: true, tests });
});

// Add new test
router.post('/api/tests', (req, res) => {
    const { name, date, syllabus, chapters, preparationNotes } = req.body;
    if (!name || !date) {
        return res.status(400).json({ success: false, error: 'Test name and date required' });
    }
    
    const tests = readData(testsFile);
    
    // FIX: Handle chapters properly - check if it's a string before splitting
    let chaptersArray = [];
    if (chapters) {
        if (typeof chapters === 'string') {
            chaptersArray = chapters.split(',').map(c => c.trim()).filter(c => c);
        } else if (Array.isArray(chapters)) {
            chaptersArray = chapters;
        }
    }
    
    const newTest = {
        id: Date.now().toString(),
        name,
        date,
        syllabus: syllabus || '',
        chapters: chaptersArray,
        completedChapters: [],
        preparationNotes: preparationNotes || '',
        createdAt: new Date().toISOString()
    };
    
    tests.push(newTest);
    writeData(testsFile, tests);
    
    res.json({ success: true, test: newTest });
});

// Update test preparation
router.put('/api/tests/:id', (req, res) => {
    const { id } = req.params;
    const { completedChapters, preparationNotes, syllabus } = req.body;
    
    const tests = readData(testsFile);
    const testIndex = tests.findIndex(t => t.id === id);
    
    if (testIndex !== -1) {
        if (completedChapters !== undefined) tests[testIndex].completedChapters = completedChapters;
        if (preparationNotes !== undefined) tests[testIndex].preparationNotes = preparationNotes;
        if (syllabus !== undefined) tests[testIndex].syllabus = syllabus;
        writeData(testsFile, tests);
        res.json({ success: true, test: tests[testIndex] });
    } else {
        res.status(404).json({ success: false, error: 'Test not found' });
    }
});

// Delete test
router.delete('/api/tests/:id', (req, res) => {
    const { id } = req.params;
    const tests = readData(testsFile);
    
    const testIndex = tests.findIndex(t => t.id === id);
    if (testIndex !== -1) {
        tests.splice(testIndex, 1);
        writeData(testsFile, tests);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, error: 'Test not found' });
    }
});

// ========== RENDER TIMETABLE PAGE ==========
router.get('/', (req, res) => {
    res.render('timetable', {
        title: 'Timetable Manager | Buddy',
        page: 'timetable'
    });
});

module.exports = router;