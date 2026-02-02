// Prevent code inspection and source viewing
(() => {
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable developer tools keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // F12 - Open Dev Tools
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I - Inspect Element
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J - Console
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C - Inspect Element (alternate)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    // Ctrl+U - View Source
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
  });

  // Disable selection of text
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Detect if developer tools are open
  let devtools = { open: false };
  const threshold = 160;

  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // Prevent console access
  const disabledFunc = () => {
    throw new Error('Debugging is not allowed');
  };

  console.log = disabledFunc;
  console.debug = disabledFunc;
  console.info = disabledFunc;
  console.warn = disabledFunc;
  console.error = disabledFunc;

  // Block debugger statement
  if (window.devtoolsDetected) {
    window.location.href = 'about:blank';
  }
})();

const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// Particle System
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particleCanvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.maxParticles = 80;
    
    this.resize();
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle(x = null, y = null) {
    return {
      x: x !== null ? x : Math.random() * this.canvas.width,
      y: y !== null ? y : Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: `rgba(255, ${Math.random() * 100 + 50}, ${Math.random() * 100 + 100}, `
    };
  }

  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    
    // Create particles near mouse
    if (Math.random() > 0.8) {
      this.particles.push({
        ...this.createParticle(e.clientX, e.clientY),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 60
      });
      
      if (this.particles.length > this.maxParticles * 2) {
        this.particles.shift();
      }
    }
  }

  update() {
    this.particles.forEach((particle, index) => {
      // Move particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Mouse interaction
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx -= (dx / distance) * force * 0.2;
        particle.vy -= (dy / distance) * force * 0.2;
      }
      
      // Boundary check
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
      
      // Apply friction
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Life countdown for mouse-created particles
      if (particle.life !== undefined) {
        particle.life--;
        particle.opacity = particle.life / 60 * 0.5;
        if (particle.life <= 0) {
          this.particles.splice(index, 1);
        }
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw connections
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          this.ctx.strokeStyle = `rgba(255, 62, 92, ${(1 - distance / 120) * 0.15})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      });
    });
    
    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.fillStyle = particle.color + particle.opacity + ')';
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize particle system after loading screen
window.addEventListener('load', () => {
  setTimeout(() => {
    new ParticleSystem();
  }, 1500);
});

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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          discord: discord,
          message: message
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