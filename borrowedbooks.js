// ---------- Array of all books ----------
const borrowedBooks = [
  { title: "Analog Communication", author: "Katsuri Vasudevan", cover: "images/ac.jpg" },
  { title: "Artificial Intelligence", author: "Stuart Russell", cover: "images/artificial.jpg" },
  { title: "Control System", author: "I.J Nagrath", cover: "images/cs.jpg" },
  { title: "Database System Concepts", author: "Silberschatz", cover: "images/dbms.jpg" },
  { title: "Digital Logic Design", author: "M. Morris Mano", cover: "images/dld.jpg" },
  { title: "Data Structures", author: "Seymour Lipschutz", cover: "images/ds.png" },
  { title: "Fluid Mechanics", author: "Carl J.Schaschke", cover: "images/fluid_mechanics.jpg" },
  { title: "Microprocessor Architecture", author: "Ramesh Gaonkar", cover: "images/mpmc.jpg" },
  { title: "Operating Systems", author: "Abraham Silberschatz", cover: "images/os.jpg" },
  { title: "Signals and Systems", author: "Alan V. Oppenheim", cover: "images/ss.jpg" },
  { title: "Theory of Computation", author: "Michael Sipser", cover: "images/theory.jpg" },
  { title: "VLSI", author: "DebaPrasad Das", cover: "images/vlsi.jpg" },
];

// ---------- Helpers ----------
function getLoggedUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

function getUserBorrowedBooks() {
  const user = getLoggedUser();
  if (!user) return [];
  return JSON.parse(localStorage.getItem(`borrowedBooks_${user.email}`) || "[]");
}

function saveUserBorrowedBooks(arr) {
  const user = getLoggedUser();
  if (!user) return;
  localStorage.setItem(`borrowedBooks_${user.email}`, JSON.stringify(arr));
}

// ---------- Render borrowed books with images ----------
function renderBorrowedBooks() {
  const container = document.getElementById("borrowed-books");
  if (!container) return;
  container.innerHTML = "";

  const userBorrowedBooks = getUserBorrowedBooks();

  borrowedBooks.forEach(book => {
    const isBorrowed = userBorrowedBooks.some(b => b.title === book.title);

    const card = document.createElement("div");
    card.className = "borrowed-card";
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}" class="book-cover">
      <div class="book-details">
        <h4>${book.title}</h4>
        <p>${book.author}</p>
        ${isBorrowed ? `<span class="status">Borrowed on: ${userBorrowedBooks.find(b => b.title === book.title).borrowedOn}</span>` : ''}
        ${!isBorrowed ? `<button class="borrow-btn">Borrow</button>` : `<button class="return-btn">Return</button>`}
      </div>
    `;
    container.appendChild(card);

    // ---------- Borrow ----------
    if (!isBorrowed) {
      card.querySelector(".borrow-btn").addEventListener("click", () => {
        const updated = [
          ...userBorrowedBooks,
          {
            title: book.title,
            author: book.author,
            borrowedOn: new Date().toLocaleString()
          }
        ];
        saveUserBorrowedBooks(updated);
        renderBorrowedBooks();
        if (window.updateProfileBorrowedList) window.updateProfileBorrowedList();
      });
    }

    // ---------- Return ----------
    if (isBorrowed) {
      card.querySelector(".return-btn").addEventListener("click", () => {
        const updated = userBorrowedBooks.filter(b => b.title !== book.title);
        saveUserBorrowedBooks(updated);
        renderBorrowedBooks();
        if (window.updateProfileBorrowedList) window.updateProfileBorrowedList();
      });
    }
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", renderBorrowedBooks);
