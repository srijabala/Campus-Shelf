// books.js
(function () {
  // expose masterBooks as global so search.js can use it
  window.masterBooks = [];
  window.allBooks = [];

  const carousel = document.getElementById("books-carousel");
  let currentModalBook = null;

// ---------- FETCH BOOKS ----------
function fetchBooks(subject) {
  const url = `https://openlibrary.org/subjects/${subject}.json?limit=75`;

  const badAuthors = ["Simone de Beauvoir","Mark Manson"];
  const badKeywords = ["erotica", "adult", "My sister's keeper", "simon", "architecture", "french", "Hindi", "Russian", "War"];

  // Define academic subjects here
  const academicSubjects = [
    "Engineering",
    "Science",
    "Mathematics",
    "Technology",
    "Research",
    "Electronics and communication",
    "Civil",
    "Electrical",
    "Computer science",
    "Physics",
    "Chemistry",
    "Biology",
    "Mechanical",
    "Environmental Science",
    "Statistics",
    "Artificial Intelligence"
  ];

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.works) {
        console.error("OpenLibrary returned no works for subject:", subject);
        return;
      }

      const books = data.works
        .filter(book => book.title && book.cover_id)
        .filter(book => !badKeywords.some(k => book.title.toLowerCase().includes(k.toLowerCase())))
        .filter(book => !book.authors?.some(a => badAuthors.some(bad => a.name.toLowerCase() === bad.toLowerCase())))
        .map(book => ({
          title: book.title,
          authors: book.authors,
          cover_id: book.cover_id,
          subjects: book.subject || [],
          key: book.key
        }));

      // merge into masterBooks (avoid duplicates by title)
      books.forEach(b => {
        if (!window.masterBooks.some(m => m.title === b.title)) window.masterBooks.push(b);
      });

      // dynamically filter academic books based on the subject
      const isAcademic = academicSubjects.some(sub => sub.toLowerCase() === subject.toLowerCase());

      window.allBooks = isAcademic
        ? books.filter(b => b.subjects.some(s => academicSubjects.includes(s)))
        : books;

      renderBooks(window.allBooks);
    })
    .catch(err => console.error("Error fetching books:", err));
}

  

  // ---------- RENDER BOOKS ----------
  function renderBooks(books) {
    carousel.innerHTML = "";

    if (!books || books.length === 0) {
      const noCard = document.createElement("div");
      noCard.className = "no-books-card";
      noCard.innerHTML = `<h4>Oops!</h4><p>No books found.</p><i class="bi bi-emoji-frown"></i>`;
      carousel.appendChild(noCard);
      // scroll to carousel so user sees no results
      // setTimeout(() => { carousel.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
      return;
    }

    books.forEach(book => {
      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <img src="https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg" 
             alt="${book.title}" 
             onerror="this.src='https://via.placeholder.com/180x250?text=No+Cover'">
        <h4>${book.title}</h4>
        <p>${book.authors ? book.authors[0].name : "Unknown Author"}</p>
      `;
      card.addEventListener("click", () => openBookModal(book));
      carousel.appendChild(card);
    });

  
  }

  // ---------- OPEN BOOK MODAL ----------
  function openBookModal(book) {
    currentModalBook = book;

    const modal = document.getElementById("bookModal");
    const modalCover = document.getElementById("modalCover");
    const modalTitle = document.getElementById("modalTitle");
    const modalAuthor = document.getElementById("modalAuthor");
    const modalDesc = document.getElementById("modalDesc");
    const bookmarkBtn = document.getElementById("bookmarkBtn");

    modalCover.src = `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`;
    modalTitle.textContent = book.title;
    modalAuthor.textContent = book.authors ? book.authors[0].name : "Unknown Author";
    modalDesc.textContent = "Fetching description...";
    modal.style.display = "block";

    // hook close behaviour
    modal.querySelector(".close-btn").onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

    // update bookmark icon in modal (reads current user bookmarks)
    if (window.bookmarksModule && typeof window.bookmarksModule.updateBookmarkBtnInModal === "function") {
      window.bookmarksModule.updateBookmarkBtnInModal(book.key);
    }

    // attach bookmark click (calls module)
    bookmarkBtn.onclick = () => {
      if (!window.bookmarksModule) {
        alert("Bookmark module not loaded.");
        return;
      }
      const result = window.bookmarksModule.toggleBookmark(book);
      // after toggle, update modal icon
      window.bookmarksModule.updateBookmarkBtnInModal(book.key);
    };

    // fetch description from OpenLibrary work object
    fetch(`https://openlibrary.org${book.key}.json`)
      .then(res => res.json())
      .then(data => {
        if (data.description) {
          modalDesc.textContent = typeof data.description === "string" ? data.description : data.description.value;
        } else {
          modalDesc.textContent = "No description available.";
        }
      })
      .catch(() => {
        modalDesc.textContent = "No description available.";
      });
  }

  // ---------- SCROLL CAROUSEL ----------
  function scrollBooks(direction) {
    const scrollAmount = 320;
    if (direction === "left") carousel.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    else carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
    // ---------- INITIAL LOAD ----------
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.masterBooks || window.masterBooks.length === 0) {
      const engineeringSubjects = [
        "engineering",
        "computer-science",
        "electrical-engineering",
        "civil-engineering",
        "mechanical-engineering",
        "electronics",
        "technology"
      ];
      engineeringSubjects.forEach(sub => fetchBooks(sub));

      // optional: other categories
      fetchBooks("fiction");
      fetchBooks("non-fiction");
    }
  });

  // expose global functions other scripts use
  window.fetchBooks = fetchBooks;
  window.renderBooks = renderBooks;
  window.openBookModal = openBookModal;
  window.scrollBooks = scrollBooks;

  // initial load: we DON'T auto-fetch from here if you prefer fetching in main script.
  // but fetch defaults to some categories to populate masterBooks:
  document.addEventListener("DOMContentLoaded", () => {
    // only fetch if masterBooks is empty (avoid double-fetch)
    if (!window.masterBooks || window.masterBooks.length === 0) {
      fetchBooks("engineering");
      fetchBooks("fiction");
      fetchBooks("non-fiction");
    }
  });
})();
