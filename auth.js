// auth.js - complete
// Handles login, signup, logout, library card (per-user), and UI auth buttons.

///////////////////// SELECT FORMS /////////////////////
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");
const libraryForm = document.querySelector(".library-form");

///////////////////// UTILS /////////////////////
function safeParse(raw) {
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function getUsers() {
  return safeParse(localStorage.getItem("users")) || [];
}
function saveUsers(arr) {
  localStorage.setItem("users", JSON.stringify(arr || []));
}

///////////////////// SHOW/HIDE FORMS /////////////////////
function showForm(type) {
  const formsContainer = document.querySelector(".forms-container");
  if (!formsContainer) return;
  formsContainer.style.display = "flex";
  document.querySelectorAll(".auth-form").forEach(f => f.style.display = "none");

  if (type === "login") loginForm.style.display = "flex";
  if (type === "signup") signupForm.style.display = "flex";
  if (type === "library") libraryForm.style.display = "flex";
}

document.querySelectorAll(".close-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const container = document.querySelector(".forms-container");
    btn.closest(".auth-form").style.display = "none";
    if (container) container.style.display = "none";
  });
});

///////////////////// NAV BUTTONS /////////////////////
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const libBtn = document.getElementById("lib-btn");

if (loginBtn) loginBtn.addEventListener("click", () => showForm("login"));
if (signupBtn) signupBtn.addEventListener("click", () => showForm("signup"));
if (libBtn) libBtn.addEventListener("click", () => showForm("library"));

///////////////////// AUTH UI /////////////////////
function updateAuthButtons(username) {
  const authDiv = document.querySelector(".auth-buttons");
  if (!authDiv) return;
  authDiv.innerHTML = `
    <span style="margin-right:10px;">Hi, ${escapeHtml(username)}</span>
    <button id="profile-btn">Profile</button>
    <button id="lib-btn">Library Card</button>
    <button id="logout-btn">Logout</button>
  `;

  const profileBtn = document.getElementById("profile-btn");
  const libBtnLocal = document.getElementById("lib-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (profileBtn) profileBtn.addEventListener("click", () => window.location.href = "profile.html");
  if (libBtnLocal) libBtnLocal.addEventListener("click", () => showForm("library"));
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

///////////////////// LOGIN /////////////////////
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[placeholder="Email"]').value.trim();
    const password = loginForm.querySelector('input[placeholder="Password"]').value.trim();

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      alert(`Welcome, ${user.username}!`);
      localStorage.setItem("loggedInUser", JSON.stringify(user)); // persist
      loginForm.reset();
      const fc = document.querySelector(".forms-container");
      if (fc) fc.style.display = "none";

      // update auth UI
      updateAuthButtons(user.username);

      // refresh bookmarks and profile
      if (window.bookmarksModule && typeof window.bookmarksModule.renderTopBookmarks === "function") {
        window.bookmarksModule.renderTopBookmarks();
      }
      if (window.updateProfileDashboard) window.updateProfileDashboard();
    } else {
      alert("Invalid email or password!");
    }
  });
}

///////////////////// SIGNUP /////////////////////
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = signupForm.querySelector('input[placeholder="Username"]').value.trim();
    const email = signupForm.querySelector('input[placeholder="Email"]').value.trim();
    const password = signupForm.querySelector('input[placeholder="Password"]').value.trim();

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      alert("User already exists!");
      return;
    }

    const newUser = {
      username,
      email,
      password,
      borrowedBooks: [],
      wishlistBooks: [],
      badges: []
    };

    users.push(newUser);
    saveUsers(users);

    // initialize per-user keys so profile won't break
    localStorage.setItem(`borrowedBooks_${email}`, JSON.stringify([]));
    localStorage.setItem(`bookmarks_${email}`, JSON.stringify([]));
    localStorage.setItem(`wishlistBooks_${email}`, JSON.stringify([]));
    localStorage.setItem(`badges_${email}`, JSON.stringify([]));
    localStorage.setItem(`libraryCard_${email}`, JSON.stringify({})); // safe placeholder

    alert("Signup successful! You can now login.");
    signupForm.reset();
    const fc = document.querySelector(".forms-container");
    if (fc) fc.style.display = "none";
    showForm("login");
  });
}

///////////////////// LOGOUT /////////////////////
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  alert("You have been logged out.");

  // refresh bookmarks
  if (window.bookmarksModule && typeof window.bookmarksModule.renderTopBookmarks === "function") {
    window.bookmarksModule.renderTopBookmarks();
  }

  // refresh profile (if open)
  if (window.updateProfileDashboard) window.updateProfileDashboard();

  location.reload();
}

///////////////////// LIBRARY CARD /////////////////////
if (libraryForm) {
  libraryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const regNo = libraryForm.querySelector('input[placeholder="Registration number"]').value.trim();
    const fullName = libraryForm.querySelector('input[placeholder="Full Name"]').value.trim();
    const email = libraryForm.querySelector('input[placeholder="Email"]').value.trim();
    const branch = libraryForm.querySelector('input[placeholder="Branch"]').value.trim();
    const semester = libraryForm.querySelector('input[placeholder="Your Current semester"]').value.trim();

    if (!regNo || !fullName || !email || !branch || !semester) {
      alert("Please fill all fields before submitting!");
      return;
    }

    const libraryData = {
      regNo,
      fullName,
      email,
      branch,
      semester,
      requestedOn: new Date().toLocaleString(),
      profilePic: "profile.jpg"
    };

    // STORE PER-USER (important)
    localStorage.setItem(`libraryCard_${email}`, JSON.stringify(libraryData));

    // if profile page is open, refresh it immediately
    if (window.updateProfileDashboard) window.updateProfileDashboard();

    alert("Your library card request has been saved!");
    libraryForm.reset();
    const fc = document.querySelector(".forms-container");
    if (fc) fc.style.display = "none";
  });
}

///////////////////// ON PAGE LOAD /////////////////////
window.addEventListener("DOMContentLoaded", () => {
  const loggedUser = safeParse(localStorage.getItem("loggedInUser"));
  if (loggedUser) {
    updateAuthButtons(loggedUser.username);

    if (window.bookmarksModule && typeof window.bookmarksModule.renderTopBookmarks === "function") {
      window.bookmarksModule.renderTopBookmarks();
    }
  } else {
    if (window.bookmarksModule && typeof window.bookmarksModule.renderTopBookmarks === "function") {
      window.bookmarksModule.renderTopBookmarks();
    }
  }
});



