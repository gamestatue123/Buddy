// ========== BUDDY AUTH.JS — REWRITTEN ==========
// Replaces the old version that forced a modal on every page load.
// Strategy: pages work immediately with localStorage data.
// Firebase auth enriches the experience but is never a gate.

let currentUser = null;
let syncInProgress = false;

const isCapacitor = !!window.Capacitor;
const isAndroidWebView = /wv|android.*(?:; wv)/i.test(navigator.userAgent) || isCapacitor;

// ── Called once Firebase auth state is known ──
firebase.auth().onAuthStateChanged(async (user) => {
    currentUser = user || null;
    _updateSidebarPill(user);
    if (user) {
        localStorage.setItem('buddy_storage_mode', 'cloud');
        // Background sync — don't block page data
        _syncFromCloud(user).catch(e => console.warn('sync err', e));
    }
    // Handle redirect result for WebView
    if (isAndroidWebView || isCapacitor) {
        try {
            const result = await firebase.auth().getRedirectResult();
            if (result.user) {
                _updateSidebarPill(result.user);
                location.reload();
            }
        } catch (e) {}
    }
});

// ── Email login (called from index.ejs overlay) ──
async function doLogin() {
    const e = document.getElementById('loginEmail')?.value?.trim();
    const p = document.getElementById('loginPassword')?.value;
    const err = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');
    if (!e || !p) { _showAuthErr(err, 'Enter your email and password.'); return; }
    err?.classList.remove('show');
    if (btn) { btn.innerHTML = '<span class="auth-spinner"></span>SIGNING IN...'; btn.disabled = true; }
    try {
        await firebase.auth().signInWithEmailAndPassword(e, p);
    } catch (ex) {
        _showAuthErr(err, _friendlyErr(ex.code));
        if (btn) { btn.innerHTML = 'SIGN IN'; btn.disabled = false; }
    }
}

// ── Google / Microsoft ──
// You'll need to import the plugin at the top of your file if you have a bundler, 
// or use Capacitor.Plugins.FirebaseAuthentication if using globals.

async function signInWithGoogle() {
    try {
        if (isCapacitor) {
            // 1. Native Google Sign In
            const result = await Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle();
            // 2. Create a Firebase credential using the native token
            const credential = firebase.auth.GoogleAuthProvider.credential(result.credential.idToken);
            // 3. Sign into the Web SDK so your UI updates
            await firebase.auth().signInWithCredential(credential);
            localStorage.setItem('buddy_storage_mode', 'cloud');
            location.reload();
        } else {
            // Standard web popup
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            await firebase.auth().signInWithPopup(provider);
            localStorage.setItem('buddy_storage_mode', 'cloud');
        }
    } catch (e) {
        _showToast(_friendlyErr(e.code));
    }
}
}

async function signInWithMicrosoft() {
    try {
        const provider = new firebase.auth.OAuthProvider('microsoft.com');
        provider.setCustomParameters({ prompt: 'select_account' });
        if (isAndroidWebView || isCapacitor) {
            await firebase.auth().signInWithRedirect(provider);
        } else {
            await firebase.auth().signInWithPopup(provider);
            localStorage.setItem('buddy_storage_mode', 'cloud');
        }
    } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') _showToast(_friendlyErr(e.code));
    }
}

// ── Signup (called from index.ejs overlay) ──
async function doSignup() {
    const n = document.getElementById('signupName')?.value?.trim();
    const cls = document.getElementById('signupClass')?.value;
    const targetYear = document.getElementById('signupTargetYear')?.value?.trim();
    const batch = document.getElementById('signupBatch')?.value?.trim();
    const e = document.getElementById('signupEmail')?.value?.trim();
    const p = document.getElementById('signupPassword')?.value;
    const c = document.getElementById('signupConfirm')?.value;
    const err = document.getElementById('signupError');
    const btn = document.getElementById('signupBtn');
    if (!n || !e || !p || !targetYear) { _showAuthErr(err, 'Name, target year, email and password are required.'); return; }
    if (p !== c) { _showAuthErr(err, 'Passwords do not match.'); return; }
    if (p.length < 6) { _showAuthErr(err, 'Password must be at least 6 characters.'); return; }
    err?.classList.remove('show');
    if (btn) { btn.innerHTML = '<span class="auth-spinner"></span>CREATING...'; btn.disabled = true; }
    try {
        const cred = await firebase.auth().createUserWithEmailAndPassword(e, p);
        await cred.user.updateProfile({ displayName: n });
        const profile = { name: n, classLevel: cls, targetYear: Number(targetYear), batch: batch || 'Self-study', email: e, createdAt: new Date().toISOString() };
        localStorage.setItem('buddy_profile', JSON.stringify(profile));
        firebase.firestore().collection('users').doc(cred.user.uid).set(profile).catch(() => {});
        await cred.user.sendEmailVerification();
        const vd = document.getElementById('verifyEmailDisplay');
        if (vd) vd.textContent = e;
        if (typeof showScreen === 'function') showScreen('screenVerify');
    } catch (ex) {
        _showAuthErr(err, _friendlyErr(ex.code));
    } finally {
        if (btn) { btn.innerHTML = 'CREATE ACCOUNT'; btn.disabled = false; }
    }
}

async function checkVerification() {
    const btn = document.getElementById('verifyBtn');
    if (btn) { btn.innerHTML = '<span class="auth-spinner"></span>CHECKING...'; btn.disabled = true; }
    await firebase.auth().currentUser?.reload();
    if (firebase.auth().currentUser?.emailVerified) {
        if (typeof closeOverlay === 'function') closeOverlay();
        if (typeof loadPageData === 'function') loadPageData();
    } else {
        if (btn) { btn.innerHTML = "I'VE VERIFIED — CONTINUE"; btn.disabled = false; }
        _showToast('⚠️ Not verified yet. Check your inbox.');
    }
}

async function resendVerification() {
    try {
        await firebase.auth().currentUser?.sendEmailVerification();
        _showToast('📬 Verification email resent!');
    } catch (e) { _showToast('Too many requests — wait a minute.'); }
}

async function doLogout() {
    try { await firebase.auth().signOut(); } catch (e) {}
    localStorage.removeItem('buddy_storage_mode');
    location.reload();
}

// ── Storage mode selection (from index overlay) ──
function selectStorage(mode) {
    localStorage.setItem('buddy_storage_mode', mode);
    if (mode === 'local') {
        let p = {};
        try { p = JSON.parse(localStorage.getItem('buddy_profile') || '{}'); } catch (e) {}
        if (!p.targetYear) {
            const y = prompt('Enter your target JEE year (e.g. 2027):', '2027');
            if (!y) { _showToast('Target year is required.'); return; }
            p.targetYear = Number(y) || 2027;
            localStorage.setItem('buddy_profile', JSON.stringify(p));
        }
        if (typeof closeOverlay === 'function') closeOverlay();
        if (typeof loadPageData === 'function') loadPageData();
    } else {
        if (!firebase.auth().currentUser && typeof showScreen === 'function') showScreen('screenLogin');
    }
}

// ── Cloud sync ──
async function syncToCloud() {
    if (!currentUser || syncInProgress) return;
    syncInProgress = true;
    const uid = currentUser.uid;
    const el = document.getElementById('syncStatusText');
    if (el) el.textContent = '⟳ SYNCING';
    try {
        const raw = localStorage.getItem('test_analysis_data');
        if (raw) {
            const tests = JSON.parse(raw);
            const ref = firebase.firestore().collection('users').doc(uid).collection('tests');
            const old = await ref.get();
            old.forEach(d => d.ref.delete());
            for (const t of tests) await ref.add(t);
        }
        if (el) el.textContent = 'CLOUD ✓';
    } catch (e) {
        if (el) el.textContent = '⚠ FAILED';
    } finally { syncInProgress = false; }
}

async function _syncFromCloud(user) {
    if (!user) return;
    const uid = user.uid;
    try {
        const snap = await firebase.firestore().collection('users').doc(uid).collection('tests').get();
        const tests = []; snap.forEach(d => tests.push(d.data()));
        if (tests.length) localStorage.setItem('test_analysis_data', JSON.stringify(tests));
        const sylSnap = await firebase.firestore().collection('users').doc(uid).collection('syllabus').get();
        const syl = {}; sylSnap.forEach(d => syl[d.id] = d.data());
        if (Object.keys(syl).length) localStorage.setItem('syllabus_progress', JSON.stringify(syl));
    } catch (e) { console.warn('syncFromCloud', e); }
}
// ========== MISSING FUNCTIONS ==========

function _updateSidebarPill(user) {
    const sidebarPill = document.querySelector('.auth-pill');
    if (!sidebarPill) return;
    
    if (user) {
        const displayName = user.displayName || user.email?.split('@')[0] || 'Buddy';
        sidebarPill.innerHTML = `
            <div class="user-avatar">${displayName.charAt(0).toUpperCase()}</div>
            <span class="user-name">${displayName}</span>
            <button class="logout-btn" onclick="doLogout()">Sign Out</button>
        `;
        sidebarPill.classList.add('signed-in');
    } else {
        sidebarPill.innerHTML = `
            <button class="signin-trigger" onclick="openAuthModal()">SIGN IN</button>
        `;
        sidebarPill.classList.remove('signed-in');
    }
}

async function _syncFromCloud(user) {
    if (syncInProgress) return;
    syncInProgress = true;
    
    try {
        const db = firebase.firestore();
        const userId = user.uid;
        
        // Fetch user's syllabus progress
        const syllabusSnap = await db.collection('users').doc(userId).collection('syllabus').get();
        const syllabusData = {};
        syllabusSnap.forEach(doc => {
            syllabusData[doc.id] = doc.data();
        });
        localStorage.setItem('buddy_syllabus', JSON.stringify(syllabusData));
        
        // Fetch test scores
        const testsSnap = await db.collection('users').doc(userId).collection('tests').orderBy('date', 'desc').limit(10).get();
        const testsData = [];
        testsSnap.forEach(doc => {
            testsData.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('buddy_tests', JSON.stringify(testsData));
        
        // Fetch timetable
        const timetableSnap = await db.collection('users').doc(userId).collection('timetable').get();
        const timetableData = [];
        timetableSnap.forEach(doc => {
            timetableData.push({ id: doc.id, ...doc.data() });
        });
        localStorage.setItem('buddy_timetable', JSON.stringify(timetableData));
        
        // Trigger a page-specific refresh
        if (window.refreshWidgets) window.refreshWidgets();
        
    } catch (err) {
        console.warn('Cloud sync failed, using local data:', err);
    } finally {
        syncInProgress = false;
    }
}

function _showAuthErr(errEl, message) {
    if (errEl) {
        errEl.textContent = message;
        errEl.classList.add('show');
    }
}

function _friendlyErr(code) {
    const errors = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.'
    };
    return errors[code] || 'Sign in failed. Please try again.';
}

// ========== EXPORT GLOBALLY ==========
window.doLogin = doLogin;
window.doLogout = async function() {
    await firebase.auth().signOut();
    localStorage.setItem('buddy_storage_mode', 'local');
    location.reload();
};
window.openAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
};
window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
};

// ── Sidebar pill (used by non-index pages) ──
function _updateSidebarPill(user) {
    const slot = document.getElementById('sidebarUserSlot');
    if (!slot) return;
    if (user) {
        const name = user.displayName || user.email.split('@')[0];
        const av = name.charAt(0).toUpperCase();
        slot.innerHTML =
            '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;cursor:pointer;position:relative;" id="_sbPill">' +
                '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#5b6ef5,#a78bfa);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;color:#fff;flex-shrink:0;">' + av + '</div>' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="font-size:0.78rem;font-weight:600;color:#e8ebf8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + name + '</div>' +
                    '<div style="font-size:0.54rem;color:rgba(255,255,255,0.3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + user.email + '</div>' +
                '</div>' +
                '<div id="_sbDrop" style="display:none;position:absolute;bottom:calc(100%+6px);left:0;right:0;background:#121520;border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:6px;z-index:500;box-shadow:0 -12px 32px rgba(0,0,0,.6);">' +
                    '<div onclick="firebase.auth().signOut().then(function(){localStorage.removeItem(\'buddy_storage_mode\');location.reload();})" style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;font-size:0.68rem;color:#f04444;cursor:pointer;">' +
                        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Sign Out' +
                    '</div>' +
                '</div>' +
            '</div>';
        const pill = document.getElementById('_sbPill'), drop = document.getElementById('_sbDrop');
        pill.addEventListener('click', function(e) {
            if (e.target.closest('#_sbDrop')) return;
            drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
        });
        document.addEventListener('click', function(e) { if (!e.target.closest('#_sbPill')) drop.style.display = 'none'; });
    } else {
        slot.innerHTML = '<a href="/" style="display:block;width:100%;padding:8px 10px;border-radius:12px;background:rgba(91,110,245,0.12);border:1px solid rgba(91,110,245,0.3);color:#7c8ff8;font-family:\'JetBrains Mono\',monospace;font-size:0.62rem;letter-spacing:0.08em;cursor:pointer;text-align:center;text-decoration:none;text-transform:uppercase;">Sign In</a>';
    }
}

// ── Helpers ──
function _showAuthErr(el, msg) { if (el) { el.textContent = msg; el.classList.add('show'); } }
function _showToast(msg) {
    const t = document.getElementById('ttToast') || document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._at); t._at = setTimeout(() => t.classList.remove('show'), 2800);
}
function _friendlyErr(c) {
    return ({'auth/user-not-found':'No account found.','auth/wrong-password':'Wrong password.','auth/invalid-email':'Invalid email.','auth/email-already-in-use':'Email already registered.','auth/too-many-requests':'Too many attempts — wait a moment.','auth/invalid-credential':'Invalid email or password.','auth/popup-blocked':'Allow popups for this site.'})[c] || 'Something went wrong.';
}

// ── Expose globals ──
window.doLogin = doLogin;
window.doSignup = doSignup;
window.doLogout = doLogout;
window.signInWithGoogle = signInWithGoogle;
window.signInWithMicrosoft = signInWithMicrosoft;
window.selectStorage = selectStorage;
window.syncToCloud = syncToCloud;
window.checkVerification = checkVerification;
window.resendVerification = resendVerification;
// Legacy aliases (used in old auth.js consumers)
window.login = doLogin;
window.logout = doLogout;
window.signup = doSignup;
