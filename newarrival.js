const arrivalsContainer = document.querySelector('#new-arrivals .arrivals-container');
const leftBtn = document.querySelector('#new-arrivals .scroll-btn.left');
const rightBtn = document.querySelector('#new-arrivals .scroll-btn.right');

leftBtn.addEventListener('click', () => {
  arrivalsContainer.scrollBy({ left: -300, behavior: 'smooth' });
});

rightBtn.addEventListener('click', () => {
  arrivalsContainer.scrollBy({ left: 300, behavior: 'smooth' });
});



// MOBILE BOOKS SCROLL LINE
const booksCarousel = document.getElementById("books-carousel");
const scrollLine = document.querySelector(".books-scroll-line");

function updateScrollLine() {
  if (!booksCarousel || !scrollLine) return;

  const scrollWidth = booksCarousel.scrollWidth - booksCarousel.clientWidth;
  const scrolled = booksCarousel.scrollLeft;
  const widthPercent = (scrolled / scrollWidth) * 100;

  scrollLine.style.width = `${widthPercent}%`;
}

// Update on scroll
booksCarousel.addEventListener("scroll", updateScrollLine);

// Initialize on page load
updateScrollLine();


// BRANCH FILTER LOGIC
const filterButtons = document.querySelectorAll('#new-arrivals .filter-btn');
const arrivalCards = document.querySelectorAll('#new-arrivals .arrival-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const branch = btn.dataset.branch;

    arrivalCards.forEach(card => {
      if (branch === 'all') {
        card.style.display = 'block';
      } else {
        card.style.display = card.classList.contains(`branch-${branch}`) ? 'block' : 'none';
      }
    });

    // Reset scroll to start when filter changes
    arrivalsContainer.scrollLeft = 0;
  });
});