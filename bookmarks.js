// bookmark.js
(function () {
  const bookmarkList = document.getElementById("bookmarkList");
  const topBookmarkIcon = document.getElementById("topBookmarkIcon");
  const BOOKMARK_PREFIX = "bookmarks_";

  function getLoggedUser() {
    return JSON.parse(localStorage.getItem("loggedInUser"));
  }

  function userKey(email) {
    return `${BOOKMARK_PREFIX}${email}`;
  }

  function getUserBookmarks() {
    const user = getLoggedUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem(userKey(user.email)) || "[]");
  }

  function saveUserBookmarks(arr) {
    const user = getLoggedUser();
    if (!user) return;
    localStorage.setItem(userKey(user.email), JSON.stringify(arr));
  }

  function isBookBookmarked(bookKey) {
    const arr = getUserBookmarks();
    return arr.some(b => b.key === bookKey);
  }

  function renderTopBookmarks() {
    // called when page loads and after login/logout/bookmark toggle
    const user = getLoggedUser();
    bookmarkList.innerHTML = "";

    if (!user) {
      bookmarkList.innerHTML = "<p style='text-align:center;color:#555;'>Login to see bookmarks</p>";
      return;
    }

    const arr = getUserBookmarks();
    if (arr.length === 0) {
      bookmarkList.innerHTML = "<p style='text-align:center;color:#555;'>No bookmarks yet</p>";
      return;
    }

    arr.forEach(book => {
      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <img src="https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg" alt="${book.title}">
        <span>${book.title}</span>
      `;
      card.addEventListener("click", () => {
        // open the book modal (books.js exposes openBookModal)
        if (window.openBookModal) window.openBookModal(book);
      });
      bookmarkList.appendChild(card);
    });
  }

  function toggleBookmark(book) {
    const user = getLoggedUser();
    if (!user) {
      alert("Please log in to bookmark.");
      return null; // indicates not toggled because no user
    }

    const arr = getUserBookmarks();
    const idx = arr.findIndex(b => b.key === book.key);
    let added = false;

    if (idx > -1) {
      arr.splice(idx, 1); // removes the bookmark
      added = false;
    } else {
      // store minimal data necessary to render bookmark list
      const entry = {
        key: book.key,
        title: book.title,
        cover_id: book.cover_id,
        authors: book.authors || []
      };
      arr.push(entry); // adds the book mark
      added = true;
    }
    saveUserBookmarks(arr);
    renderTopBookmarks();
    return added;
  }

  function updateBookmarkBtnInModal(bookKey) {
    // Called by books.js to reflect state in the modal
    const btn = document.getElementById("bookmarkBtn");
    if (!btn) return;
    if (isBookBookmarked(bookKey)) {
      btn.classList.remove("bi-bookmark");
      btn.classList.add("bi-bookmark-fill");
    } else {
      btn.classList.remove("bi-bookmark-fill");
      btn.classList.add("bi-bookmark");
    }
  }

  // top floating bookmark icon behaviour (toggle dropdown)
  if (topBookmarkIcon) {
    topBookmarkIcon.addEventListener("click", e => {
      e.stopPropagation();
      bookmarkList.style.display = (bookmarkList.style.display === "block") ? "none" : "block";
    });
  }

  document.addEventListener("click", () => { if (bookmarkList) bookmarkList.style.display = "none"; });
  if (bookmarkList) bookmarkList.addEventListener("click", e => e.stopPropagation());

  // Expose functions globally so books.js / auth.js can call them
  window.bookmarksModule = {
    renderTopBookmarks,
    toggleBookmark,
    updateBookmarkBtnInModal,
    isBookBookmarked,
    getUserBookmarks
  };

  // init on load
  document.addEventListener("DOMContentLoaded", renderTopBookmarks);
})();
