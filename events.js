document.addEventListener("DOMContentLoaded", () => {

  console.log("EVENTS JS LOADED");

  // =========================
  // EVENT 1 — Hackathon
  // =========================
  const hackathon = {
    title: "24-Hour College Hackathon 2025",
    date: "2 APR 2026",
    venue: "Main Lab Hall",
    desc: "Form teams, build prototypes, pitch to judges. Prizes for best product, best UI and best presentation.",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    highlights: [
      "Team of 4",
      "24 hours nonstop coding",
      "Snacks & refreshments",
      "Grand Prize ₹10,000"
    ]
  };

  // =========================
  // EVENT 2 — Coding Contest
  // =========================
  const codingContest = {
    title: "Inter-College Coding Contest",
    date: "12 MAY 2026",
    venue: "Online + Onsite",
    desc: "Competitive coding contest focusing on arrays, trees, graphs, dynamic programming and problem solving.",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    highlights: [
      "Individual + Team rounds",
      "Data Structures & Algorithms",
      "Leaderboard scoring",
      "Certificates for all participants"
    ]
  };

  // =========================
  // EVENT 3 — Research Workshop
  // =========================
const researchWorkshop = {
  title: "Research Paper Writing Workshop",
  date: "25 MAY 2026",
  venue: "Library Seminar Room",
  desc: "Learn paper structure, citation formats, literature survey, and publication strategy.",
  img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80",
  highlights: [
    "Hands-on writing tasks",
    "Understanding research structure",
    "Proper referencing styles",
    "Guidance for publication"
  ]
};



  // =========================
  // SHARED POSTER MODAL ELEMENTS
  // =========================
  const modal = document.getElementById("eventModal");
  const bg = document.getElementById("eventPosterBg");
  const closeBtn = document.querySelector(".event-poster-close");

  const title = document.getElementById("eventPosterTitle");
  const meta = document.getElementById("eventPosterMeta");
  const desc = document.getElementById("eventPosterDesc");
  const highlightsList = document.getElementById("eventPosterHighlights");

  // =========================
  // CONNECT BUTTONS TO EVENTS
  // =========================
  const buttons = document.querySelectorAll(".event-btn");

  // Event 1
  buttons[0].onclick = () => {
    console.log("Event 1 clicked");
    openEvent(hackathon);
  };

  // Event 2
  buttons[1].onclick = () => {
    console.log("Event 2 clicked");
    openEvent(codingContest);
  };

  // Event 3
  buttons[2].onclick = () => {
    console.log("Event 3 clicked");
    openEvent(researchWorkshop);
  };

  // =========================
  // OPEN EVENT FUNCTION
  // =========================
  function openEvent(eventData) {
    bg.style.backgroundImage = `url(${eventData.img})`;

    title.textContent = eventData.title;
    meta.textContent = `Date: ${eventData.date} • Venue: ${eventData.venue}`;
    desc.textContent = eventData.desc;

    highlightsList.innerHTML = "";
    eventData.highlights.forEach(h => {
      highlightsList.innerHTML += `<li>${h}</li>`;
    });

    modal.style.display = "block";
  }

  // CLOSE MODAL
  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

});
