document.addEventListener("DOMContentLoaded", () => {

  // ====== LIBRARY HOURS ======
  const libraryHours = {
    0: "Closed",
    1: "9 AM - 4 PM",
    2: "9 AM - 4 PM",
    3: "9 AM - 4 PM",
    4: "9 AM - 4 PM",
    5: "9 AM - 4 PM",
    6: "10 AM - 3 PM"
  };
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = new Date().getDay();
  const hoursDiv = document.getElementById("today-hours");
  if(hoursDiv) hoursDiv.textContent = `${weekdays[today]}'s Hours: ${libraryHours[today]}`;

  // ====== QUOTES ======
  const quotes = [
    "Read more, know more.",
    "A library is a treasure of knowledge.",
    "Books open doors to new worlds.",
    "Knowledge grows when shared.",
    "Books changes perspective."
  ];
  let index = 0;
  const quoteElement = document.getElementById("quote");
  const dotsContainer = document.getElementById("dots");

  if(quoteElement && dotsContainer) {
    quotes.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      if(i === 0) dot.classList.add("active");
      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".dot");

    function showQuote() {
      quoteElement.textContent = quotes[index];
      dots.forEach(d => d.classList.remove("active"));
      dots[index].classList.add("active");
      index = (index + 1) % quotes.length;
    }

    showQuote();
    setInterval(showQuote, 5000);
  }

  // ====== CATEGORY CARDS ======
  const categoryCards = document.querySelectorAll(".category-card");
  const categoryMap = {
    "academic-box": "engineering",
    "fiction-box": "fiction",
    "nonfiction-box": "non-fiction"
  };

  function showToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.classList.add("toast", type); // type = academic/fiction/nonfiction
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  categoryCards.forEach(card => {
    card.addEventListener("click", () => {
      // Remove active from all cards
      categoryCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      // Fetch books for this category
      if(window.fetchBooks) fetchBooks(categoryMap[card.id]);

      // Show toast
      let type = "";
      if(card.id === "academic-box") type = "academic";
      else if(card.id === "fiction-box") type = "fiction";
      else if(card.id === "nonfiction-box") type = "nonfiction";

      showToast(`Showing ${card.querySelector("h3").textContent} books`, type);
    });
  });

  // Default active category
  const defaultCard = document.getElementById("academic-box");
  if(defaultCard) {
    defaultCard.classList.add("active");
    if(window.fetchBooks) fetchBooks(categoryMap[defaultCard.id]);
  }

  // ====== GLOBAL VARIABLES ======
  window.carousel = document.getElementById("books-carousel");
  window.searchInput = document.querySelector("#search-input");
  window.masterBooks = [];
  window.allBooks = [];

  // ====== FORMS (Login / Signup / Library) ======
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const libBtn = document.getElementById("lib-btn");
  const formsContainer = document.querySelector(".forms-container");
  const loginForm = document.querySelector(".login-form");
  const signupForm = document.querySelector(".signup-form");
  const libForm = document.querySelector(".library-form");
  const closeBtns = document.querySelectorAll(".close-btn");

  function hideAllForms() {
    if (!formsContainer) return;
    formsContainer.style.display = "none";
    if (loginForm) loginForm.style.display = "none";
    if (signupForm) signupForm.style.display = "none";
    if (libForm) libForm.style.display = "none";
  }

  function openForm(formElem) {
    if (!formsContainer || !formElem) return;
    hideAllForms();
    formsContainer.style.display = "flex";
    formElem.style.display = "flex";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loginBtn) loginBtn.addEventListener("click", e => { e.stopPropagation(); openForm(loginForm); });
  if (signupBtn) signupBtn.addEventListener("click", e => { e.stopPropagation(); openForm(signupForm); });
  if (libBtn) libBtn.addEventListener("click", e => { e.stopPropagation(); openForm(libForm); });

  closeBtns.forEach(btn => btn.addEventListener("click", hideAllForms));
  if (formsContainer) {
    formsContainer.addEventListener("click", e => { if(e.target === formsContainer) hideAllForms(); });
  }

  // ====== HERO ANIMATION ======
  const heroContent = document.querySelector('.hero-content');
  if(heroContent) heroContent.classList.add('show');
});


// -------- CONTACT / FEEDBACK MODAL --------
const contactModal = document.getElementById("contactModal");
const contactBtn = document.getElementById("navContact");
const closeContact = document.getElementById("closeContact");

// Open modal when clicking nav link
contactBtn.addEventListener("click", (e) => {
  e.preventDefault(); // prevents page jump
  contactModal.classList.add("show");
});

// Close modal when clicking 'X'
closeContact.addEventListener("click", () => {
  contactModal.classList.remove("show");
});

// Close modal when clicking outside modal content
window.addEventListener("click", (e) => {
  if (e.target === contactModal) {
    contactModal.classList.remove("show");
  }
  // ---------- FEEDBACK FORM HANDLING ----------
const feedbackForm = document.getElementById("feedbackForm");
const feedbackMsg = document.getElementById("feedbackMsg");

feedbackForm.addEventListener("submit", function(e) {
  e.preventDefault(); // stop page refresh

  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const message = this.message.value.trim();

  // Store feedback in localStorage
  const allFeedback = JSON.parse(localStorage.getItem("feedbacks")) || [];
  allFeedback.push({ name, email, message, date: new Date().toISOString() });
  localStorage.setItem("feedbacks", JSON.stringify(allFeedback));

  // Show success message inside modal
  feedbackMsg.textContent = "Thank you! Your feedback has been received.";

  // Clear the form fields
  this.reset();

  // Remove the message after 3 seconds
  setTimeout(() => {
    feedbackMsg.textContent = "";
  }, 3000);
});
});

