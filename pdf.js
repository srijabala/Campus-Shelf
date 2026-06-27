// ---------------- PDF BOOKS ARRAY ----------------
const pdfBooks = [
  {
    title: "Electromagnetic Field Theory And Transmission Lines",
    author: "G.S.N.Raju",
    cover: "images/books_cover/emtls2.jpg",
    file: "pdfs/emtl.pdf"
  },
  {
    title: "Internet Of Things",
    author: "Raj Kamal",
    cover: "images/books_cover/iot2.jpg",
    file: "pdfs/iot.pdf"
  },
  {
    title: "Digital Communications",
    author: "Sanjay Sharma",
    cover: "images/books_cover/dc2.jpg",
    file: "pdfs/dc.pdf"
  },
  {
    title: "Signal And Systems",
    author: "P.Ramesh Babu",
    cover: "images/books_cover/ss2.jpg",
    file: "pdfs/ss.pdf"
  },
  {
    title: "Control Systems",
    author: "A.Nagoor Kani",
    cover: "images/books_cover/cs2.jpg",
    file: "pdfs/cs.pdf"
  },
  {
    title: "Computer Networks",
    author: "Tanenbaum",
    cover: "images/books_cover/cn2.jpg",
    file: "pdfs/cn.pdf"
  }
];


//---------------- FUNCTION TO OPEN PDF ----------------
function openPdf(file) {
  const pdfWindow = window.open();
  pdfWindow.document.write(`
    <html>
      <head>
        <title>PDF Viewer</title>
        <style>body{margin:0;}</style>
      </head>
      <body>
        <embed src="${file}" type="application/pdf" width="100%" height="100%">
        <p style="text-align:center;">If PDF does not open, <a href="${file}" target="_blank">click here to download</a>.</p>
      </body>
    </html>
  `);
}

// ---------------- FUNCTION TO RENDER PDF BOOKS ----------------
function renderPdfBooks() {
  const container = document.getElementById("pdf-books");
  container.innerHTML = ""; // Clear previous content if any

  pdfBooks.forEach(book => {
    const card = document.createElement("div");
    card.className = "pdf-card";

    
//insert html inside the card
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title} Cover">
      <div class="pdf-card-details">
        <h4>${book.title}</h4>
        <p>${book.author}</p>
        <button onclick="openPdf('${book.file}')">
          <i class="bi bi-file-earmark-pdf"></i> View PDF
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render on page load
renderPdfBooks();   