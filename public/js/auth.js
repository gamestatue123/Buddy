// ========== AUTH STATE MANAGEMENT ==========
let currentUser = null;
let syncMode = null;
let syncInProgress = false;

// Detect if running in Capacitor/WebView
const isCapacitor = !!window.Capacitor;
const isAndroidWebView = /wv|android.*(?:; wv)/i.test(navigator.userAgent) || isCapacitor;

// ========== AUTH FUNCTIONS ==========
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('Please enter email and password');
        return;
    }
    
    showLoading(true);
    
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('Login successful:', userCredential.user.email);
        showToast('Logged in successfully!');
        closeModal('authModal');
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. ';
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage += 'User not found. Please sign up first.';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Wrong password.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Invalid email format.';
                break;
            case 'auth/too-many-requests':
                errorMessage += 'Too many attempts. Try again later.';
                break;
            default:
                errorMessage += error.message;
        }
        showToast(errorMessage);
    } finally {
        showLoading(false);
    }
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirmPassword').value;
    
    if (!name || !email || !password) {
        showToast('Please fill all fields');
        return;
    }
    
    if (password !== confirm) {
        showToast('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters');
        return;
    }
    
    showLoading(true);
    
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log('Signup successful:', userCredential.user.email);
        
        await userCredential.user.updateProfile({ displayName: name });
        
        await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });
        
        showToast('Account created successfully!');
        closeModal('authModal');
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Signup failed. ';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += 'Email already in use. Please login.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Invalid email format.';
                break;
            case 'auth/weak-password':
                errorMessage += 'Password is too weak. Use at least 6 characters.';
                break;
            default:
                errorMessage += error.message;
        }
        showToast(errorMessage);
    } finally {
        showLoading(false);
    }
}

// FIXED: Google Sign-In for WebView/Capacitor
async function signInWithGoogle() {
    showLoading(true);
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        if (isAndroidWebView || isCapacitor) {
            // For WebView/Capacitor - Use redirect instead of popup
            console.log('Using redirect auth for WebView');
            await firebase.auth().signInWithRedirect(provider);
            // The page will redirect, no need to do anything else
            return;
        } else {
            // For normal web browsers - Use popup
            console.log('Using popup auth for browser');
            const result = await firebase.auth().signInWithPopup(provider);
            console.log('Google Sign-In success:', result.user.email);
            showToast('Signed in with Google!');
            closeModal('authModal');
        }
    } catch (error) {
        console.error('Google Sign-In error:', error);
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
            showToast('Google Sign-In failed: ' + (error.message || 'Please try again'));
        }
    } finally {
        showLoading(false);
    }
}

async function signInWithMicrosoft() {
    showLoading(true);
    
    try {
        const provider = new firebase.auth.OAuthProvider('microsoft.com');
        provider.setCustomParameters({ prompt: 'select_account' });
        
        if (isAndroidWebView || isCapacitor) {
            // For WebView/Capacitor - Use redirect
            console.log('Using redirect auth for WebView');
            await firebase.auth().signInWithRedirect(provider);
            return;
        } else {
            // For normal web browsers - Use popup
            const result = await firebase.auth().signInWithPopup(provider);
            console.log('Microsoft Sign-In success:', result.user.email);
            showToast('Signed in with Microsoft!');
            closeModal('authModal');
        }
    } catch (error) {
        console.error('Microsoft Sign-In error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            showToast('Microsoft Sign-In failed: ' + (error.message || 'Please try again'));
        }
    } finally {
        showLoading(false);
    }
}

async function logout() {
    try {
        await firebase.auth().signOut();
        showToast('Logged out successfully');
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed: ' + error.message);
    }
}

function setSyncMode(mode) {
    syncMode = mode;
    if (currentUser) {
        localStorage.setItem(`${currentUser.uid}_sync_mode`, mode);
    }
    document.getElementById('syncModeForm').style.display = 'none';
    closeModal('authModal');
    loadAllData();
}

function switchToSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Handle redirect result (for WebView/Capacitor)
async function handleRedirectResult() {
    try {
        const result = await firebase.auth().getRedirectResult();
        if (result.user) {
            console.log('Redirect sign-in successful:', result.user.email);
            showToast('Signed in successfully!');
            closeModal('authModal');
            // Reload to update UI
            setTimeout(() => location.reload(), 500);
        }
    } catch (error) {
        console.error('Redirect sign-in error:', error);
        showToast('Sign-in failed: ' + (error.message || 'Please try again'));
    }
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    // Handle redirect result on page load (important for WebView)
    if (isAndroidWebView || isCapacitor) {
        handleRedirectResult();
    }
    
    // Set up auth state listener
    firebase.auth().onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
        
        if (user) {
            currentUser = user;
            showUserMenu(user);
            
            const syncPref = localStorage.getItem(`${user.uid}_sync_mode`);
            if (syncPref) {
                syncMode = syncPref;
                await loadAllData();
                closeModal('authModal');
            } else {
                document.getElementById('authModal').classList.add('show');
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('signupForm').style.display = 'none';
                document.getElementById('syncModeForm').style.display = 'block';
            }
        } else {
            currentUser = null;
            hideUserMenu();
            document.getElementById('authModal').classList.add('show');
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('signupForm').style.display = 'none';
            document.getElementById('syncModeForm').style.display = 'none';
        }
    });
});

// ========== DATA SYNC (keep existing) ==========
async function loadAllData() {
    if (!currentUser) return;
    
    if (syncMode === 'online') {
        await syncFromCloud();
    } else {
        loadFromLocal();
    }
}

async function syncFromCloud() {
    showLoading(true);
    const userId = currentUser.uid;
    
    try {
        console.log('Syncing from cloud...');
        
        // Sync Tasks
        const tasksRef = firebase.firestore().collection('users').doc(userId).collection('tasks');
        const tasksSnapshot = await tasksRef.get();
        const tasksData = [];
        tasksSnapshot.forEach(doc => tasksData.push({ id: doc.id, ...doc.data() }));
        if (tasksData.length > 0) {
            localStorage.setItem('dpp_questions', JSON.stringify({ '11': tasksData, '12': [] }));
        }
        
        // Sync Schedule
        const scheduleRef = firebase.firestore().collection('users').doc(userId).collection('schedule');
        const scheduleSnapshot = await scheduleRef.get();
        const scheduleData = {};
        scheduleSnapshot.forEach(doc => scheduleData[doc.id] = doc.data());
        if (Object.keys(scheduleData).length > 0) {
            localStorage.setItem('schedule_data', JSON.stringify(scheduleData));
        }
        
        // Sync Tests
        const testsRef = firebase.firestore().collection('users').doc(userId).collection('tests');
        const testsSnapshot = await testsRef.get();
        const testsData = [];
        testsSnapshot.forEach(doc => testsData.push({ id: doc.id, ...doc.data() }));
        if (testsData.length > 0) {
            localStorage.setItem('test_analysis_data', JSON.stringify(testsData));
        }
        
        // Sync Syllabus
        const syllabusRef = firebase.firestore().collection('users').doc(userId).collection('syllabus');
        const syllabusSnapshot = await syllabusRef.get();
        const syllabusData = {};
        syllabusSnapshot.forEach(doc => syllabusData[doc.id] = doc.data());
        if (Object.keys(syllabusData).length > 0) {
            localStorage.setItem('syllabus_progress', JSON.stringify(syllabusData));
        }
        
        console.log('Sync complete');
        showToast('Data synced from cloud');
        
        if (typeof loadTasks === 'function') loadTasks();
        if (typeof loadSchedule === 'function') loadSchedule();
        if (typeof loadTests === 'function') loadTests();
        if (typeof loadSyllabusProgress === 'function') loadSyllabusProgress();
        
    } catch (error) {
        console.error('Sync error:', error);
        showToast('Sync failed: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function syncToCloud() {
    if (!currentUser || syncMode !== 'online' || syncInProgress) return;
    
    syncInProgress = true;
    const userId = currentUser.uid;
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) syncStatus.innerHTML = '<span>🔄 Syncing...</span>';
    
    try {
        console.log('Syncing to cloud...');
        
        // Sync Tasks
        const tasksData = localStorage.getItem('dpp_questions');
        if (tasksData) {
            const tasks = JSON.parse(tasksData);
            const tasksRef = firebase.firestore().collection('users').doc(userId).collection('tasks');
            
            const oldTasks = await tasksRef.get();
            const batch = firebase.firestore().batch();
            oldTasks.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            if (tasks['11']) {
                for (const task of tasks['11']) {
                    await tasksRef.add(task);
                }
            }
        }
        
        // Sync Schedule
        const scheduleData = localStorage.getItem('schedule_data');
        if (scheduleData) {
            const schedule = JSON.parse(scheduleData);
            const scheduleRef = firebase.firestore().collection('users').doc(userId).collection('schedule');
            
            const oldSchedule = await scheduleRef.get();
            const batch = firebase.firestore().batch();
            oldSchedule.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            for (const [day, classes] of Object.entries(schedule)) {
                await scheduleRef.doc(day).set(classes);
            }
        }
        
        // Sync Tests
        const testsData = localStorage.getItem('test_analysis_data');
        if (testsData) {
            const tests = JSON.parse(testsData);
            const testsRef = firebase.firestore().collection('users').doc(userId).collection('tests');
            
            const oldTests = await testsRef.get();
            const batch = firebase.firestore().batch();
            oldTests.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            for (const test of tests) {
                await testsRef.add(test);
            }
        }
        
        // Sync Syllabus
        const syllabusData = localStorage.getItem('syllabus_progress');
        if (syllabusData) {
            const syllabus = JSON.parse(syllabusData);
            const syllabusRef = firebase.firestore().collection('users').doc(userId).collection('syllabus');
            
            const oldSyllabus = await syllabusRef.get();
            const batch = firebase.firestore().batch();
            oldSyllabus.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            for (const [chapterId, progress] of Object.entries(syllabus)) {
                await syllabusRef.doc(chapterId).set(progress);
            }
        }
        
        console.log('Sync to cloud complete');
        if (syncStatus) {
            syncStatus.innerHTML = '<span>✅ Synced</span>';
            setTimeout(() => {
                if (syncStatus) syncStatus.innerHTML = '<span>🔄 Synced</span>';
            }, 2000);
        }
        
    } catch (error) {
        console.error('Sync error:', error);
        if (syncStatus) syncStatus.innerHTML = '<span>⚠️ Sync failed</span>';
    } finally {
        syncInProgress = false;
    }
}

function loadFromLocal() {
    console.log('Using local data');
    showToast('Using local data (offline mode)');
    
    if (typeof loadTasks === 'function') loadTasks();
    if (typeof loadSchedule === 'function') loadSchedule();
    if (typeof loadTests === 'function') loadTests();
    if (typeof loadSyllabusProgress === 'function') loadSyllabusProgress();
}

// Auto-sync every 30 seconds
setInterval(() => {
    if (currentUser && syncMode === 'online' && navigator.onLine) {
        syncToCloud();
    }
}, 30000);

// ========== UI HELPERS ==========
function showUserMenu(user) {
    const menu = document.getElementById('userMenu');
    if (!menu) return;
    
    const name = user.displayName || user.email.split('@')[0];
    const avatar = name.charAt(0).toUpperCase();
    
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = name;
    if (userEmailEl) userEmailEl.textContent = user.email;
    if (userAvatarEl) userAvatarEl.textContent = avatar;
    
    menu.style.display = 'flex';
}

function hideUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.style.display = 'none';
}

function showLoading(show) {
    const loadingDiv = document.getElementById('loadingState');
    if (!loadingDiv) return;
    
    if (show) {
        loadingDiv.style.display = 'block';
        const forms = ['loginForm', 'signupForm', 'syncModeForm'];
        forms.forEach(form => {
            const el = document.getElementById(form);
            if (el) el.style.display = 'none';
        });
    } else {
        loadingDiv.style.display = 'none';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Make functions global
window.login = login;
window.signup = signup;
window.logout = logout;
window.signInWithGoogle = signInWithGoogle;
window.signInWithMicrosoft = signInWithMicrosoft;
window.setSyncMode = setSyncMode;
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
window.closeModal = closeModal;
window.syncToCloud = syncToCloud;
