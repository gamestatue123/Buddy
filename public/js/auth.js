// ════════════════════════════════════════════════
//  auth.js — Buddy JEE
//  User block lives in sidebar footer only.
//  No floating top-right block anywhere.
// ════════════════════════════════════════════════
let currentUser = null;
let syncMode = null;
let syncInProgress = false;

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        showUserMenu(user);

        const syncPref = localStorage.getItem(`${user.uid}_sync_mode`)
                      || localStorage.getItem('buddy_storage_mode');
        if (syncPref && syncPref !== 'cloud') {
            syncMode = 'local';
        } else if (syncPref === 'cloud' || syncPref === 'online') {
            syncMode = 'online';
        } else {
            // First time with this account — default to online
            syncMode = 'online';
            localStorage.setItem(`${user.uid}_sync_mode`, 'online');
            localStorage.setItem('buddy_storage_mode', 'cloud');
        }

        await loadAllData();
    } else {
        currentUser = null;
        hideUserMenu();
        // Only show the old authModal if it exists (legacy pages)
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('show');
            const lf = document.getElementById('loginForm');
            const sf = document.getElementById('signupForm');
            const smf = document.getElementById('syncModeForm');
            if (lf) lf.style.display = 'block';
            if (sf) sf.style.display = 'none';
            if (smf) smf.style.display = 'none';
        }
    }
});

// ── Auth actions ──
async function login() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) { showToast('Enter email and password'); return; }
    showLoading(true);
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Signed in!');
    } catch (e) {
        showToast(friendlyError(e.code));
    } finally { showLoading(false); }
}

async function signup() {
    const name     = document.getElementById('signupName')?.value;
    const email    = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const confirm  = document.getElementById('signupConfirmPassword')?.value;
    if (!name || !email || !password) { showToast('Fill all fields'); return; }
    if (password !== confirm) { showToast('Passwords do not match'); return; }
    if (password.length < 6)  { showToast('Password min 6 chars'); return; }
    showLoading(true);
    try {
        const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name });
        firebase.firestore().collection('users').doc(cred.user.uid)
            .set({ name, email, createdAt: new Date().toISOString() }).catch(() => {});
        showToast('Account created!');
    } catch (e) {
        showToast(friendlyError(e.code));
    } finally { showLoading(false); }
}

async function logout() {
    try { await firebase.auth().signOut(); } catch (e) {}
    localStorage.removeItem('buddy_storage_mode');
    location.reload();
}

function setSyncMode(mode) {
    syncMode = mode === 'online' ? 'online' : 'local';
    if (currentUser) localStorage.setItem(`${currentUser.uid}_sync_mode`, mode);
    localStorage.setItem('buddy_storage_mode', mode === 'online' ? 'cloud' : 'local');
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('show');
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

// ── Data sync ──
async function loadAllData() {
    if (!currentUser) return;
    if (syncMode === 'online') { await syncFromCloud(); }
    else { loadFromLocal(); }
}

async function syncFromCloud() {
    if (!currentUser) return;
    const uid = currentUser.uid;
    try {
        const testsSnap = await firebase.firestore().collection('users').doc(uid).collection('tests').get();
        const tests = []; testsSnap.forEach(d => tests.push(d.data()));
        if (tests.length) localStorage.setItem('test_analysis_data', JSON.stringify(tests));

        const tasksSnap = await firebase.firestore().collection('users').doc(uid).collection('tasks').get();
        const tasks = []; tasksSnap.forEach(d => tasks.push(d.data()));
        if (tasks.length) localStorage.setItem('dpp_questions', JSON.stringify({ '11': tasks, '12': [] }));

        const schedSnap = await firebase.firestore().collection('users').doc(uid).collection('schedule').get();
        const sched = {}; schedSnap.forEach(d => sched[d.id] = d.data());
        if (Object.keys(sched).length) localStorage.setItem('schedule_data', JSON.stringify(sched));

        const sylSnap = await firebase.firestore().collection('users').doc(uid).collection('syllabus').get();
        const syl = {}; sylSnap.forEach(d => syl[d.id] = d.data());
        if (Object.keys(syl).length) localStorage.setItem('syllabus_progress', JSON.stringify(syl));

        showToast && showToast('Synced ✓');
    } catch (e) {
        console.warn('syncFromCloud failed', e);
        loadFromLocal();
    }
}

async function syncToCloud() {
    if (!currentUser || syncMode !== 'online' || syncInProgress) return;
    syncInProgress = true;
    const uid = currentUser.uid;
    const statusEl = document.getElementById('syncStatus');
    if (statusEl) statusEl.innerHTML = '<span>⟳ Syncing…</span>';
    try {
        const raw = localStorage.getItem('test_analysis_data');
        if (raw) {
            const tests = JSON.parse(raw);
            const ref = firebase.firestore().collection('users').doc(uid).collection('tests');
            const old = await ref.get(); old.forEach(d => d.ref.delete());
            for (const t of tests) await ref.add(t);
        }
        const schedRaw = localStorage.getItem('schedule_data');
        if (schedRaw) {
            const sched = JSON.parse(schedRaw);
            const ref = firebase.firestore().collection('users').doc(uid).collection('schedule');
            for (const [day, cls] of Object.entries(sched)) await ref.doc(day).set(cls);
        }
        if (statusEl) { statusEl.innerHTML = '<span>✓ Synced</span>'; }
    } catch (e) {
        if (statusEl) statusEl.innerHTML = '<span>⚠ Failed</span>';
    } finally { syncInProgress = false; }
}

function loadFromLocal() {
    if (typeof loadTasks === 'function')           loadTasks();
    if (typeof loadSchedule === 'function')        loadSchedule();
    if (typeof loadTests === 'function')           loadTests();
    if (typeof loadSyllabusProgress === 'function') loadSyllabusProgress();
}

setInterval(() => {
    if (currentUser && syncMode === 'online') syncToCloud();
}, 30000);

// ── UI: sidebar pill ──
function showUserMenu(user) {
    // Hide old floating block if it somehow exists
    const old = document.getElementById('userMenu');
    if (old) old.style.display = 'none';

    const slot = document.getElementById('sidebarUserSlot');
    if (!slot) return;

    const name = user.displayName || user.email.split('@')[0];
    const av   = name.charAt(0).toUpperCase();

    slot.innerHTML = `
<div id="_buddyPill" style="
    display:flex;align-items:center;gap:8px;
    padding:8px 10px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:14px;
    cursor:pointer;
    margin-bottom:8px;
    position:relative;
">
    <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#5b6ef5,#a78bfa);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.92rem;color:#fff;flex-shrink:0;">${av}</div>
    <div style="flex:1;min-width:0;">
        <div style="font-size:0.78rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#e8ebf8;">${name}</div>
        <div style="font-size:0.54rem;color:rgba(255,255,255,0.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.email}</div>
    </div>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style="color:rgba(255,255,255,0.3);flex-shrink:0;"><path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    <div id="_buddyDrop" style="
        display:none;
        position:absolute;bottom:calc(100% + 6px);left:0;right:0;
        background:#121520;border:1px solid rgba(255,255,255,0.12);
        border-radius:14px;padding:6px;z-index:500;
        box-shadow:0 -12px 32px rgba(0,0,0,0.6);
    ">
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.58rem;color:rgba(255,255,255,0.3);padding:6px 10px;letter-spacing:0.06em;text-transform:uppercase;">
            ${syncMode === 'online' ? '☁ Cloud Sync' : '💾 Local Only'}
        </div>
        <div style="height:1px;background:rgba(255,255,255,0.07);margin:4px 0;"></div>
        <div onclick="logout()" style="
            display:flex;align-items:center;gap:8px;
            padding:7px 10px;border-radius:8px;
            font-family:'JetBrains Mono',monospace;font-size:0.67rem;
            color:#f04444;cursor:pointer;
        " onmouseover="this.style.background='rgba(240,68,68,0.1)'" onmouseout="this.style.background=''">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Sign Out
        </div>
    </div>
</div>`;

    const pill = document.getElementById('_buddyPill');
    const drop = document.getElementById('_buddyDrop');
    pill.addEventListener('click', e => {
        if (e.target.closest('#_buddyDrop')) return;
        drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('#_buddyPill')) drop.style.display = 'none';
    }, { capture: false });
}

function hideUserMenu() {
    const slot = document.getElementById('sidebarUserSlot');
    if (slot) slot.innerHTML = '';
    const old = document.getElementById('userMenu');
    if (old) old.style.display = 'none';
}

// ── Helpers ──
function showLoading(show) {
    const el = document.getElementById('loadingState');
    if (!el) return;
    el.style.display = show ? 'block' : 'none';
    if (show) {
        ['loginForm','signupForm','syncModeForm'].forEach(id => {
            const e = document.getElementById(id);
            if (e) e.style.display = 'none';
        });
    }
}

function friendlyError(code) {
    return ({
        'auth/user-not-found':      'No account found.',
        'auth/wrong-password':      'Wrong password.',
        'auth/invalid-email':       'Invalid email address.',
        'auth/email-already-in-use':'Email already registered.',
        'auth/too-many-requests':   'Too many attempts — wait a moment.',
        'auth/invalid-credential':  'Invalid email or password.',
    })[code] || 'Something went wrong.';
}