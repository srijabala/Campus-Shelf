// borrow.js
const BORROW_PREFIX = "borrowed_";

function getLoggedUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

function userBorrowKey(email) {
  return `${BORROW_PREFIX}${email}`;
}

function getUserBorrowed() {
  const user = getLoggedUser();
  if (!user) return [];
  return JSON.parse(localStorage.getItem(userBorrowKey(user.email)) || "[]");
}

function saveUserBorrowed(arr) {
  const user = getLoggedUser();
  if (!user) return;
  localStorage.setItem(userBorrowKey(user.email), JSON.stringify(arr));
}

function borrowBook(book) {
  const arr = getUserBorrowed();
  if (!arr.some(b => b.title === book.title)) {
    arr.push({ title: book.title, author: book.author });
    saveUserBorrowed(arr);
  }
}

function returnBook(book) {
  let arr = getUserBorrowed();
  arr = arr.filter(b => b.title !== book.title);
  saveUserBorrowed(arr);
}

// Expose globally so we can use it elsewhere
window.borrowModule = {
  getUserBorrowed,
  borrowBook,
  returnBook
};
