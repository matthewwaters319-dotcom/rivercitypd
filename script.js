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

// hi