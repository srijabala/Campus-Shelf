/* profile.js — updated
   - robust: reads loggedInUser live
   - auto-copies libraryCardRequest -> libraryCard_<email> when safe (matches email or no email)
   - renders header, stats, borrowed, wishlist, badges
   - exposes updateProfileDashboard() and updateProfileBorrowedList() for compatibility
   - light polling for changes (1s)
*/

(function () {
  // ---------- safe JSON parse ----------
  function safeParse(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }

  // ---------- helpers ----------
  function getLoggedUser() { return safeParse(localStorage.getItem("loggedInUser")) || null; }
  function libCardKeyFor(user) { return user && user.email ? `libraryCard_${user.email}` : null; }
  function borrowedKeyFor(user) { return user && user.email ? `borrowedBooks_${user.email}` : null; }
  function bookmarksKeyFor(user) { return user && user.email ? `bookmarks_${user.email}` : null; }
  function badgesKeyFor(user) { return user && user.email ? `badges_${user.email}` : null; }

  function ensureArrayFromKey(key) {
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = safeParse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }

  function parseDateLoose(s) {
    if (!s) return null;
    const d = new Date(s);
    if (!isNaN(d)) return d;
    const cleaned = String(s).replace(/,/g, '');
    const d2 = new Date(cleaned);
    return isNaN(d2) ? null : d2;
  }

  function $(id) { return document.getElementById(id); }
  function createLi(html) { const li = document.createElement('li'); li.innerHTML = html; return li; }
  function escapeHtml(s){ if (s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // ---------- Data getters ----------
  function getLibraryCardRawGlobal() {
    // try older global keys in case older flows used them
    return safeParse(localStorage.getItem("libraryCardRequest")) || safeParse(localStorage.getItem("libraryCard")) || null;
  }

  function getLibraryCardPerUser(user) {
    if (!user) return null;
    const k = libCardKeyFor(user);
    if (!k) return null;
    return safeParse(localStorage.getItem(k)) || null;
  }

  // Auto-copy global library card to per-user key if safe:
  // - if per-user key already exists, do nothing
  // - if global card exists and (global.email absent OR global.email === user.email) then copy to libraryCard_<email>
  function copyGlobalLibraryCardIfMatches(user) {
    if (!user || !user.email) return false;
    const perKey = libCardKeyFor(user);
    if (localStorage.getItem(perKey)) return false; // already present, nothing to do

    const globalCard = getLibraryCardRawGlobal();
    if (!globalCard) return false;

    // If global has email, only copy when it matches current user
    if (globalCard.email) {
      if (globalCard.email === user.email) {
        localStorage.setItem(perKey, JSON.stringify(globalCard));
        return true;
      } else {
        // don't copy someone else's card
        return false;
      }
    } else {
      // globalCard has no email — assume it's safe to tag to current user
      localStorage.setItem(perKey, JSON.stringify(globalCard));
      return true;
    }
  }

  function getLibraryCard(user) {
    if (!user) return {};
    const per = getLibraryCardPerUser(user);
    if (per) return per;
    // if per-user missing, try to safely copy the global -> per (if allowed) then re-read
    const copied = copyGlobalLibraryCardIfMatches(user);
    if (copied) {
      return getLibraryCardPerUser(user) || {};
    }
    // fallback: if global exists and has no email AND we don't want to copy, we can still
    // consider it as fallback only if it doesn't contain an email (but we prefer not to show other user's card)
    const globalCard = getLibraryCardRawGlobal();
    if (globalCard && (!globalCard.email || globalCard.email === user.email)) return globalCard;
    return {};
  }

  function getBorrowedBooks(user) {
    if (!user) return [];
    const k = borrowedKeyFor(user);
    if (k && localStorage.getItem(k)) return ensureArrayFromKey(k);
    if (Array.isArray(user.borrowedBooks)) return user.borrowedBooks;
    return [];
  }

  function getWishlist(user) {
    if (!user) return [];
    const k = bookmarksKeyFor(user);
    if (k && localStorage.getItem(k)) return ensureArrayFromKey(k);
    const alt1 = `wishlistBooks_${user.email}`;
    if (localStorage.getItem(alt1)) return ensureArrayFromKey(alt1);
    const alt2 = `wishlist_${user.email}`;
    if (localStorage.getItem(alt2)) return ensureArrayFromKey(alt2);
    if (Array.isArray(user.wishlistBooks)) return user.wishlistBooks;
    if (Array.isArray(user.bookmarks)) return user.bookmarks;
    return [];
  }

  function getBadges(user) {
    if (!user) return [];
    const k = badgesKeyFor(user);
    if (k && localStorage.getItem(k)) return ensureArrayFromKey(k);
    const alt = `userBadges_${user.email}`;
    if (localStorage.getItem(alt)) return ensureArrayFromKey(alt);
    if (Array.isArray(user.badges)) return user.badges;
    return [];
  }

  // ---------- Rendering ----------
  function renderHeader(user) {
    // prefer logged-in username, then per-user library card fields
    const lib = getLibraryCard(user) || {};
    // extra safety: if lib.email exists and doesn't match user, ignore lib fields
    if (lib && lib.email && user && lib.email !== user.email) {
      // ignore fields from lib
      Object.keys(lib).forEach(k => { delete lib[k]; });
    }

    const name = (user && user.username) || lib.fullName || "N/A";
    const branch = lib.branch || lib.department || "N/A";
    const reg = lib.regNo || lib.registrationNumber || lib.reg || "N/A";
    const avatar = lib.profilePic || lib.profilePicUrl || lib.avatar || "profile.jpg";

    const nameEl = $('user-name');
    const branchEl = $('user-branch');
    const regElVal = $('user-regno-val');
    const avatarEl = $('profile-avatar');

    if (nameEl) nameEl.textContent = name;
    if (branchEl) branchEl.textContent = branch;
    if (regElVal) regElVal.textContent = reg;
    if (avatarEl) avatarEl.src = avatar;
  }

  function renderBorrowedList(user) {
    const container = $('borrowed-list');
    if (!container) return;
    container.innerHTML = '';
    const list = getBorrowedBooks(user);
    if (!list || list.length === 0) {
      container.appendChild(createLi('<span class="empty">No borrowed books yet</span>'));
      return;
    }
    const now = new Date();
    list.forEach((b, i) => {
      const borrowedOnRaw = b.borrowedOn || b.date || b.borrowed_at || '';
      const parsed = parseDateLoose(borrowedOnRaw);
      const dateText = parsed ? parsed.toLocaleDateString() : (borrowedOnRaw || 'N/A');
      let diff = parsed ? Math.floor((now - parsed)/(1000*60*60*24)) : 0;
      if (diff < 0) diff = 0;
      const dueLeft = 15 - diff;
      const rightHtml = (diff > 15)
        ? '<span class="return-note">OVERDUE</span>'
        : `<span class="borrow-date">Return in ${dueLeft} day${dueLeft===1?'':'s'}</span>`;
      const html = `
        <div class="borrow-info"><strong>${i+1}.</strong> ${escapeHtml(b.title)} <small style="color:var(--muted)">- ${escapeHtml(b.author || '')}</small></div>
        <div class="borrow-meta"><div class="borrow-date small">📅 ${escapeHtml(dateText)}</div>${rightHtml}</div>
      `;
      container.appendChild(createLi(html));
    });
  }


  function renderWishlist(user) {
    const container = $('wishlist-list');
    if (!container) return;
    container.innerHTML = '';
    const list = getWishlist(user);
    if (!list || list.length === 0) {
      container.appendChild(createLi('<span class="empty">No wishlist books yet</span>'));
      return;
    }
    list.forEach((b, i) => {
      const authors = Array.isArray(b.authors) ? b.authors.map(a => a.name).join(', ') : '';
      const html = `<div class="borrow-info"><strong>${i+1}.</strong> ${escapeHtml(b.title)} <small style="color:var(--muted)">- ${escapeHtml(authors)}</small></div>`;
      container.appendChild(createLi(html));
    });
}


  function renderBadges(user) {
    const container = $('badges-container');
    if (!container) return;
    container.innerHTML = '';
    const arr = getBadges(user);
    if (!arr || arr.length === 0) {
      container.innerHTML = `<p class="empty" style="color:var(--muted)">No badges yet</p>`;
      return;
    }
    arr.forEach(b => {
      const d = document.createElement('div');
      d.className = 'badge';
      d.textContent = b;
      container.appendChild(d);
    });
  }

  function ensureStatH2(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return null;
    let h2 = card.querySelector('h2');
    if (!h2) {
      const valueWrap = card.querySelector('.stat-value') || card;
      h2 = document.createElement('h2');
      h2.textContent = '0';
      valueWrap.appendChild(h2);
    }
    return h2;
  }

  function renderStatsAndProgress(user, limit=10) {
    const borrowed = getBorrowedBooks(user).length;
    const wishlist = getWishlist(user).length;
    const badges = getBadges(user).length;

    const totalBorrowedH2 = ensureStatH2('total-borrowed');
    const currentBorrowedH2 = ensureStatH2('currently-borrowed');
    const wishlistH2 = ensureStatH2('wishlist-count');
    const badgesH2 = ensureStatH2('badges-count');

    if (totalBorrowedH2) totalBorrowedH2.textContent = borrowed;
    if (currentBorrowedH2) currentBorrowedH2.textContent = borrowed;
    if (wishlistH2) wishlistH2.textContent = wishlist;
    if (badgesH2) badgesH2.textContent = badges;

    const percent = Math.min(Math.round((borrowed/limit)*100), 100);
    const fill = $('borrowed-progress');
    if (fill) fill.style.width = percent + '%';
    const meta = $('progress-meta');
    if (meta) meta.textContent = `${borrowed} / ${limit}`;
  }
// compute and persist simple badges
function computeAndSaveBadges(user) {
  if (!user) return;

  const borrowedArr = getBorrowedBooks(user);
  const wishlistArr = getWishlist(user);

  // remove old badges completely
  const set = new Set();

  if (borrowedArr.length >= 1) set.add('🏅 First Borrow');
  if (borrowedArr.length >= 5) set.add('📚 Bookworm');
  if (wishlistArr.length >= 5) set.add('📝 Wishlist Enthusiast');

  // convert to array and save
  const arr = Array.from(set);
  const k = badgesKeyFor(user);
  if (k) localStorage.setItem(k, JSON.stringify(arr));
}

  
  // ---------- main update ----------
  function updateProfileDashboard(opts) {
    const user = getLoggedUser();
    if (!user) {
      // not signed in
      const nameEl = $('user-name'); if (nameEl) nameEl.textContent = 'Not signed in';
      const branchEl = $('user-branch'); if (branchEl) branchEl.textContent = '—';
      const regElVal = $('user-regno-val'); if (regElVal) regElVal.textContent = 'N/A';
      return;
    }

    // attempt to copy global library card into per-user if safe (so header shows branch/reg)
    copyGlobalLibraryCardIfMatches(user);

    const lib = getLibraryCard(user); // now likely per-user
    renderHeader(user);
    renderBorrowedList(user);
    renderWishlist(user);
    computeAndSaveBadges(user);
    renderBadges(user);

    const limit = (lib && (lib.limit || lib.borrowLimit)) ? (lib.limit || lib.borrowLimit) : 10;
    renderStatsAndProgress(user, limit);
  }

  // expose (and keep backward compat)
  window.updateProfileDashboard = updateProfileDashboard;
  window.updateProfileBorrowedList = updateProfileDashboard;

  // ---------- polling snapshot for auto-refresh ----------
  let lastSnapshot = { loggedRaw: null, borrowedRaw: null, bookmarksRaw: null, libRaw: null, badgesRaw: null };

  function snapshotAndCompare() {
    const loggedRaw = localStorage.getItem("loggedInUser");
    let loggedEmail = null;
    try {
      const parsed = loggedRaw ? JSON.parse(loggedRaw) : null;
      loggedEmail = parsed && parsed.email ? parsed.email : null;
    } catch (_) { loggedEmail = null; }

    const borrowedKey = loggedEmail ? `borrowedBooks_${loggedEmail}` : null;
    const bookmarksKey = loggedEmail ? `bookmarks_${loggedEmail}` : null;
    const libKey = loggedEmail ? `libraryCard_${loggedEmail}` : null;
    const badgesKey = loggedEmail ? `badges_${loggedEmail}` : null;

    const borrowedRaw = borrowedKey ? localStorage.getItem(borrowedKey) : null;
    const bookmarksRaw = bookmarksKey ? localStorage.getItem(bookmarksKey) : null;
    const libRaw = libKey ? localStorage.getItem(libKey) : null;
    const badgesRaw = badgesKey ? localStorage.getItem(badgesKey) : null;

    if (lastSnapshot.loggedRaw !== loggedRaw ||
        lastSnapshot.borrowedRaw !== borrowedRaw ||
        lastSnapshot.bookmarksRaw !== bookmarksRaw ||
        lastSnapshot.libRaw !== libRaw ||
        lastSnapshot.badgesRaw !== badgesRaw) {
      lastSnapshot.loggedRaw = loggedRaw;
      lastSnapshot.borrowedRaw = borrowedRaw;
      lastSnapshot.bookmarksRaw = bookmarksRaw;
      lastSnapshot.libRaw = libRaw;
      lastSnapshot.badgesRaw = badgesRaw;
      updateProfileDashboard();
    }
  }

  window.addEventListener('focus', snapshotAndCompare);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') snapshotAndCompare();
  });

  const POLL_MS = 1000;
  const pollHandle = setInterval(snapshotAndCompare, POLL_MS);
  document.addEventListener('DOMContentLoaded', () => snapshotAndCompare());

  // expose stop for debugging
  window._profilePollingStop = function () { clearInterval(pollHandle); };

  // ---------- end IIFE ----------
})(); 
