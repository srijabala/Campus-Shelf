// ---------- Load Logged-in User & Show Fine ----------
function calculateLateFine() {
  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const fineOutput = document.getElementById("fineOutput");

  if (!loggedUser) {
    fineOutput.textContent = "Login to check your fine!";
    return;
  }

  const fines = JSON.parse(localStorage.getItem("lateFines")) || {};
  const userFine = fines[loggedUser.email] || 0;

  if (userFine > 0) {
    fineOutput.textContent = `Your fine as of now is ₹${userFine}`;
  } else {
    fineOutput.textContent = "You have no fines yet!";
  }
}

// Run on page load
window.addEventListener("DOMContentLoaded", calculateLateFine);

// ---------- Late Fine Form ----------
document.getElementById("lateFineForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const daysLate = parseInt(document.getElementById("daysLate").value);
  const fineRate = 5; // ₹5 per day
  const fineOutput = document.getElementById("fineOutput");

  if (isNaN(daysLate) || daysLate < 0) {
    alert("Please enter a valid number of days.");
    return;
  }

  const totalFine = daysLate * fineRate;
  fineOutput.textContent = `Your fine as of now is ₹${totalFine}`;

  // Save to localStorage for logged-in user
  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedUser) {
    const fines = JSON.parse(localStorage.getItem("lateFines")) || {};
    fines[loggedUser.email] = totalFine;
    localStorage.setItem("lateFines", JSON.stringify(fines));
  }
});
