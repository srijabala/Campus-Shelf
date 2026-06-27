const books = [
  {
    img: "images/popular/atomic_habits.jpg",
    title: "Atomic Habits",
    author: "James Clear",
    points: [
      "Learn how tiny changes create massive results",
      "Break bad habits effectively",
      "Perfect for productivity and personal growth",
      "Most borrowed book of 2024"
    ]
  },
  {
    img: "images/popular/fluid_mechanics.jpg",
    title: "Fluid Mechanics",
    author: "Carl J.",
    points: [
      "Covers fluid statics & dynamics",
      "Used in mechanical core subjects",
      "Best for gate & semester exams",
      "Highly rated by senior students"
    ]
  },
  {
    img: "images/popular/harry_potter1.jpg",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    points: [
      "A magical fantasy classic",
      "Easy and fun for beginners",
      "New readers love this series"
    ]
  },
  {
    img: "images/popular/mano_digital_design.jpg",
    title: "Digital Logic Design",
    author: "M. Morris Mano",
    points: [
      "Standard book for logic circuits",
      "Clear diagrams and examples",
      "Very useful for ECE & CSE students"
    ]
  },
  {
    img: "images/popular/mpmc.jpg",
    title: "Microprocessor",
    author: "Ramesh Gaonkar",
    points: [
      "Microprocessor basics explained clearly",
      "8086 instructions made simple",
      "Best book for VIVA & lab exams"
    ]
  },
  {
    img: "images/popular/signals_opppenheim.jpg",
    title: "Signals & Systems",
    author: "Oppenheim",
    points: [
      "Core book for ECE students",
      "Covers LTI systems, transforms",
      "Highly recommended for GATE"
    ]
  },
  {
    img: "images/popular/the_alchemist.jpg",
    title: "The Alchemist",
    author: "Paulo Coelho",
    points: [
      "A story about following your dreams",
      "Beautiful motivational message",
      "Short and easy-to-read"
    ]
  }
];

function showBook(id) {
  const book = books[id - 1];

  document.getElementById("modalImg").src = book.img;
  document.getElementById("modalTitle").textContent = book.title;
  document.getElementById("modalAuthor").innerHTML = "<strong>Author:</strong> " + book.author;

  let list = "";
  book.points.forEach(p => (list += `<li>${p}</li>`));
  document.getElementById("modalPoints").innerHTML = list;
  document.getElementById("modal").style.display = "flex";
}


function closeModal() {
  document.getElementById("modal").style.display = "none";
}


/* ========== Book of the Week open/close (Glow + Spotlight + Zoom) ========== */

function openBookWeek() {
  const overlay = document.getElementById('bookWeekModal');
  if (!overlay) return;

  overlay.style.display = 'flex';

  createBalloons();   // 🎉 IMPORTANT — Balloons appear ON OPEN

  setTimeout(() => {
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }, 30);
}

/* close the Book of the Week modal */
function closeBookWeek() {
  const overlay = document.getElementById('bookWeekModal');
  if (!overlay) return;

  // remove show class to reverse animations
  overlay.classList.remove('show');

  // allow the CSS transitions to finish before hiding (match transitions ~360ms)
  setTimeout(() => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';                          // restore scroll
  }, 360);
}

/* close on ESC key for accessibility */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('bookWeekModal');
    if (overlay && overlay.classList.contains('show')) closeBookWeek();
  }
});


// ================= BALLOONS FOR BOOK OF THE WEEK =================
function createBalloons() {
  const container = document.querySelector(".balloon-container");
  container.innerHTML = ""; // clear old balloons

  for (let i = 0; i < 12; i++) {
    let balloon = document.createElement("div");
    balloon.classList.add("balloon");

    // random starting position
    balloon.style.left = Math.random() * 90 + "%";

    // random delay for natural floating
    balloon.style.animationDelay = (Math.random() * 1.5) + "s";

    // random pastel color
    const colors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(255, 184, 108, 0.6)",
      "rgba(120, 180, 255, 0.6)",
      "rgba(150, 255, 170, 0.6)"
    ];
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(balloon);
  }
}
