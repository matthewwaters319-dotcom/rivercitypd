const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const audio = document.querySelector(".audio-player");
if (audio) {
  const tryPlay = () => {
    audio.play().catch(() => {
      audio.classList.add("needs-play");
    });
  };
  if (document.readyState === "complete") {
    tryPlay();
  } else {
    window.addEventListener("load", tryPlay, { once: true });
  }
  audio.addEventListener("play", () => audio.classList.remove("needs-play"));
}

const membersEl = document.querySelector("#discord-members");
if (membersEl) {
  fetch("https://discord.com/api/v9/invites/95Xures5Bh?with_counts=true")
    .then((res) => (res.ok ? res.json() : Promise.reject(res)))
    .then((data) => {
      const count = data.approximate_member_count;
      membersEl.textContent = typeof count === "number" ? count.toLocaleString() : "--";
    })
    .catch(() => {
      membersEl.textContent = "--";
    });
}

const membersEl2 = document.querySelector("#discord-members-2");
if (membersEl2) {
  fetch("https://discord.com/api/v9/invites/f52U3sFTw3?with_counts=true")
    .then((res) => (res.ok ? res.json() : Promise.reject(res)))
    .then((data) => {
      const count = data.approximate_member_count;
      membersEl2.textContent = typeof count === "number" ? count.toLocaleString() : "--";
    })
    .catch(() => {
      membersEl2.textContent = "--";
    });
}

const contactForm = document.querySelector("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector("button[type=submit]");
    const formData = new FormData(contactForm);
    const name = formData.get("name");
    const discord = formData.get("discord");
    const message = formData.get("message");

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const res = await fetch("https://discord.com/api/webhooks/1467580910525223254/_RSiDZB51xkKDWpybdRMoOVtU1UeWX-SjweqgZaQt8TSPSqLGExSS85ADlCsHLcjZOiv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "New Contact Request",
            color: 0xff2a55,
            fields: [
              { name: "Name", value: name, inline: true },
              { name: "Discord", value: discord, inline: true },
              { name: "Message", value: message }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      });

      if (res.ok) {
        submitBtn.textContent = "Sent!";
        contactForm.reset();
        setTimeout(() => {
          submitBtn.textContent = "Send Message";
          submitBtn.disabled = false;
        }, 3000);
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      submitBtn.textContent = "Failed - Try Again";
      setTimeout(() => {
        submitBtn.textContent = "Send Message";
        submitBtn.disabled = false;
      }, 3000);
    }
  });
}

// Review System
const profanityList = ['fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap', 'bastard', 'asshole', 'dick', 'pussy', 'cock', 'slut', 'whore'];

function filterProfanity(text) {
  let filtered = text;
  profanityList.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}

function loadReviews() {
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  return reviews;
}

function saveReviews(reviews) {
  localStorage.setItem('reviews', JSON.stringify(reviews));
}

function renderReviews() {
  const reviewsScroll = document.querySelector('.reviews-scroll');
  if (!reviewsScroll) return;

  const reviews = loadReviews();
  const reviewCount = document.querySelector('.review-count');
  
  // Calculate total reviews (existing + new)
  const existingReviews = reviewsScroll.querySelectorAll('.review-card').length;
  const totalCount = existingReviews + reviews.length;
  
  if (reviewCount) {
    reviewCount.textContent = totalCount;
  }

  // Add new reviews to the scroll
  reviews.forEach(review => {
    const reviewCard = document.createElement('article');
    reviewCard.className = 'review-card';
    
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const reviewText = review.text ? `<p class="review-text">"${review.text}"</p>` : '';
    
    reviewCard.innerHTML = `
      <div class="review-top">
        <div class="review-avatar"></div>
        <div>
          <h3>${review.username}</h3>
          <div class="stars">
            ${Array.from(stars).map(star => `<span>${star}</span>`).join('')}
          </div>
        </div>
      </div>
      ${reviewText}
      <div class="review-footer">
        <span class="verified">USER REVIEW</span>
        <span class="review-date">${review.date}</span>
      </div>
    `;
    
    reviewsScroll.appendChild(reviewCard);
  });
}

// Modal functionality
const modal = document.getElementById('reviewModal');
const addReviewBtn = document.getElementById('addReviewBtn');
const closeModal = document.getElementById('closeModal');
const reviewForm = document.getElementById('reviewForm');
const starRating = document.getElementById('starRating');
const ratingInput = document.getElementById('rating');

if (addReviewBtn && modal) {
  addReviewBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });
}

if (closeModal && modal) {
  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
    reviewForm.reset();
    ratingInput.value = '0';
    starRating.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
  });
}

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      reviewForm.reset();
      ratingInput.value = '0';
      starRating.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    }
  });
}

// Star rating functionality
if (starRating) {
  const stars = starRating.querySelectorAll('.star');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      ratingInput.value = rating;
      
      stars.forEach((s, index) => {
        if (index < rating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
    
    star.addEventListener('mouseenter', () => {
      const rating = parseInt(star.dataset.rating);
      stars.forEach((s, index) => {
        if (index < rating) {
          s.style.color = '#fbbf24';
        } else {
          s.style.color = 'rgba(255, 255, 255, 0.2)';
        }
      });
    });
  });
  
  starRating.addEventListener('mouseleave', () => {
    const currentRating = parseInt(ratingInput.value);
    stars.forEach((s, index) => {
      if (index < currentRating) {
        s.style.color = '#fbbf24';
      } else {
        s.style.color = 'rgba(255, 255, 255, 0.2)';
      }
    });
  });
}

// Review form submission
if (reviewForm) {
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = filterProfanity(document.getElementById('username').value.trim());
    const rating = parseInt(ratingInput.value);
    const reviewText = filterProfanity(document.getElementById('reviewText').value.trim());
    
    if (!username) {
      alert('Please enter a username');
      return;
    }
    
    if (rating === 0) {
      alert('Please select a star rating');
      return;
    }
    
    const reviews = loadReviews();
    const newReview = {
      username: username,
      rating: rating,
      text: reviewText,
      date: new Date().toLocaleDateString('en-US')
    };
    
    reviews.push(newReview);
    saveReviews(reviews);
    
    // Clear the existing dynamic reviews and re-render
    const reviewsScroll = document.querySelector('.reviews-scroll');
    const dynamicReviews = reviewsScroll.querySelectorAll('.review-card:not([data-static])');
    dynamicReviews.forEach(card => card.remove());
    
    // Mark static reviews
    reviewsScroll.querySelectorAll('.review-card').forEach(card => {
      card.setAttribute('data-static', 'true');
    });
    
    renderReviews();
    
    // Close modal and reset form
    modal.classList.remove('active');
    reviewForm.reset();
    ratingInput.value = '0';
    starRating.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    
    // Scroll to the new review
    setTimeout(() => {
      const allReviews = reviewsScroll.querySelectorAll('.review-card');
      const lastReview = allReviews[allReviews.length - 1];
      if (lastReview) {
        lastReview.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
    }, 100);
  });
}

// Load reviews on page load
window.addEventListener('DOMContentLoaded', () => {
  renderReviews();
});

// hi