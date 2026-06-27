window.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.querySelector(".search-btn");
  const carousel = document.getElementById("books-carousel");

  // Create dropdown container
  const dropdown = document.createElement("div");
  dropdown.className = "search-dropdown";
  document.querySelector(".input-group").appendChild(dropdown);

  // Handle typing(live suggestion)
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    dropdown.innerHTML = "";
    if (query.length === 0) return;

    const matches = masterBooks.filter(book =>
      book.title.toLowerCase().includes(query) ||
      (book.authors && book.authors[0].name.toLowerCase().includes(query))
    );

    matches.slice(0,5).forEach(book => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = `${book.title} - ${book.authors ? book.authors[0].name : "Unknown Author"}`;
      item.addEventListener("click", () => {
        searchInput.value = book.title;
        dropdown.innerHTML = "";
        renderBooks([book]); // render the clicked book
        scrollToCarousel(); // scroll smoothly
      });
      dropdown.appendChild(item);
    });
  });

  // Scroll helper function
  function scrollToCarousel() {
    const yOffset = -80; // adjust for sticky header if any
    const carouselPosition = carousel.getBoundingClientRect().top + window.pageYOffset + yOffset;
     window.scrollTo({ top: carouselPosition, behavior: "smooth" });
  }

  // Search button click
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.toLowerCase().trim();
    if(query.length === 0) return;

    const filtered = masterBooks.filter(book =>
      book.title.toLowerCase().includes(query) ||
      (book.authors && book.authors[0].name.toLowerCase().includes(query))
    );

    carousel.innerHTML = ""; // clear previous results

    if(filtered.length === 0) {
      // Show "Oops!" card
      const noCard = document.createElement("div");
      noCard.className = "no-books-card";
      noCard.innerHTML = `<h4>Oops!</h4><p>No books matched your search.</p><i class="bi bi-emoji-frown"></i>`;
      carousel.appendChild(noCard);
    } else {
      renderBooks(filtered); // render found books
    }

    // Scroll to carousel in ALL cases
    scrollToCarousel();
  });

  // Hide dropdown on clicking outside
  document.addEventListener("click", (e) => {
    if(!document.querySelector(".input-group").contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
});
