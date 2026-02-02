const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// Loading Screen
window.addEventListener('load', () => {
  const loadingScreen = document.querySelector('.loading-screen');
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    document.body.classList.add('loaded');
  }, 1500);
});

// Scroll Animation Observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Parallax effect for starfield
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const starfield = document.querySelector('.starfield');
      const scrolled = window.pageYOffset;
      if (starfield) {
        starfield.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }
});

// Observe sections for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
    observer.observe(section);
  });

  // Observe portfolio items
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  portfolioItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'scale(0.95)';
    item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(item);
  });

  // Observe review cards
  const reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateX(-20px)';
    card.style.transition = `opacity 0.7s ease ${index * 0.15}s, transform 0.7s ease ${index * 0.15}s`;
    observer.observe(card);
  });
});

const audio = document.querySelector(".audio-player");
if (audio) {
  const tryPlay = () => {
    audio.play().then(() => {
      // Unmute after autoplay starts (browsers require muted autoplay)
      audio.muted = false;
    }).catch(() => {
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

// hi