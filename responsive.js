

/* --- Query selectors for main buttons & containers --- */
const loginBtn = document.getElementById('login-btn');         // top-bar login
const signupBtn = document.getElementById('signup-btn');       // top-bar signup
const libBtn = document.getElementById('lib-btn');             // library card btn
const formsContainer = document.querySelector('.forms-container');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const libraryForm = document.querySelector('.library-form');
const allCloseBtns = document.querySelectorAll('.auth-form .close-btn'); // close buttons inside forms

const bookmarkFloating = document.querySelector('.bookmark-floating');  // floating bookmark
const bookmarkList = document.getElementById('bookmarkList');

/* Helper: close all auth forms */
function closeAllForms() {
  // hide each form by removing .show
  [loginForm, signupForm, libraryForm].forEach(f => {
    if (f) f.classList.remove('show');
  });
  // remove container pointer-events so clicks pass through when closed
  if (formsContainer) formsContainer.style.pointerEvents = 'none';
  document.body.classList.remove('modal-open'); // unlock body scroll
}

/* Helper: open a single form element */
function openForm(formElement) {
  if (!formElement) return;
  // ensure all closed first
  closeAllForms();
  // center the container and enable pointer events
  if (formsContainer) formsContainer.style.pointerEvents = 'auto';
  formElement.classList.add('show');             // show chosen form
  document.body.classList.add('modal-open');     // lock body scroll
}

/* Attach click listeners to top bar buttons */
if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); openForm(loginForm); });
if (signupBtn) signupBtn.addEventListener('click', (e) => { e.preventDefault(); openForm(signupForm); });
if (libBtn) signupBtn.addEventListener('click', (e) => { /* fallback if libBtn uses same id */ });

if (libBtn) libBtn.addEventListener('click', (e) => { e.preventDefault(); openForm(libraryForm); });

/* Close buttons inside forms */
allCloseBtns.forEach(cb => cb.addEventListener('click', (e) => {
  e.stopPropagation();
  closeAllForms();
}));

/* Click outside forms (on the overlay) should close all forms */
if (formsContainer) {
  formsContainer.addEventListener('click', (e) => {
    // if user clicked directly on the overlay (formsContainer itself) -> close
    if (e.target === formsContainer) closeAllForms();
  });
}

/* Prevent form submit from reloading page while testing (remove if you have real handlers) */
document.querySelectorAll('.auth-form').forEach(form => {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    // You can replace this with your auth logic later
    alert('Form submitted (demo). Replace with real handler.');
    closeAllForms();
  });
});

/* ===== Bookmark toggle & safe click behaviour ===== */
if (bookmarkFloating) {
  // Toggle show/hide of the bookmark list, single click toggles
  bookmarkFloating.addEventListener('click', (e) => {
    // if there are interactive elements inside list, consider e.stopPropagation checks
    bookmarkFloating.classList.toggle('show-list');
  });

  // click outside bookmark list closes it
  document.addEventListener('click', (e) => {
    if (!bookmarkFloating.contains(e.target)) {
      bookmarkFloating.classList.remove('show-list');
    }
  });
}

/* ===== Defensive measure: close modals on Escape key ===== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllForms();
    if (bookmarkFloating) bookmarkFloating.classList.remove('show-list');
  }
});



