/* Beef Roasters site script.
 * Edit SITE below to change the opening hours and the email address the
 * contact form sends to. Days: 0 = Sunday ... 6 = Saturday. Times are 24h,
 * Melbourne time. Use null for a closed day.
 */
const SITE = {
  email: "hello@example.com", // PLACEHOLDER: real email address
  timeZone: "Australia/Melbourne",
  hours: {
    1: ["07:00", "15:00"], // Monday
    2: ["07:00", "15:00"],
    3: ["07:00", "15:00"],
    4: ["07:00", "15:00"],
    5: ["07:00", "15:00"],
    6: ["08:00", "16:00"], // Saturday
    0: ["08:00", "16:00"], // Sunday
  },
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ---------- Mobile nav ---------- */
(function nav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("site-nav");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("open", !open);
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
    }
  });
})();

/* ---------- Footer year ---------- */
document.querySelectorAll("#year").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- Opening hours + open now ---------- */
function melbourneNow() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: SITE.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function prettyTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}

(function hours() {
  const now = melbourneNow();

  const tbody = document.querySelector("#hours-table tbody");
  if (tbody) {
    [1, 2, 3, 4, 5, 6, 0].forEach((d) => {
      const h = SITE.hours[d];
      const tr = document.createElement("tr");
      if (d === now.day) tr.className = "today";
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = DAY_NAMES[d];
      const td = document.createElement("td");
      td.textContent = h ? `${prettyTime(h[0])} – ${prettyTime(h[1])}` : "Closed";
      tr.append(th, td);
      tbody.append(tr);
    });
  }

  const pill = document.getElementById("open-status");
  if (!pill) return;
  const today = SITE.hours[now.day];
  if (today && now.minutes >= toMinutes(today[0]) && now.minutes < toMinutes(today[1])) {
    const left = toMinutes(today[1]) - now.minutes;
    pill.classList.add("is-open");
    pill.textContent = left <= 60
      ? `Open now · closing soon (${prettyTime(today[1])})`
      : `Open now · until ${prettyTime(today[1])}`;
    return;
  }
  // Find the next opening time
  pill.classList.add("is-closed");
  for (let i = 0; i < 8; i++) {
    const d = (now.day + i) % 7;
    const h = SITE.hours[d];
    if (!h) continue;
    if (i === 0 && now.minutes >= toMinutes(h[0])) continue;
    const when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAY_NAMES[d];
    pill.textContent = `Closed · opens ${when} at ${prettyTime(h[0])}`;
    return;
  }
  pill.textContent = "Closed";
})();

/* ---------- The beef button ---------- */
(function beef() {
  const btn = document.getElementById("beef-btn");
  const out = document.getElementById("beef-response");
  if (!btn || !out) return;
  const replies = [
    "Sorry, we're all out of beef. We have been since we opened.",
    "Still no beef. Can we interest you in a flat white?",
    "The kitchen has been informed. The kitchen does not exist.",
    "We asked the roaster. The roaster said no.",
    "You're persistent. Here's a free tip: the house blend is great with oat milk.",
    "Beef count remains at zero.",
  ];
  let i = 0;
  btn.addEventListener("click", () => {
    out.textContent = replies[i % replies.length];
    i++;
  });
})();

/* ---------- Contact form -> mailto ---------- */
(function contact() {
  document.querySelectorAll(".js-email").forEach((a) => {
    a.href = `mailto:${SITE.email}`;
    a.textContent = SITE.email;
  });

  const form = document.getElementById("contact-form");
  if (!form) return;
  const err = document.getElementById("form-error");
  const topic = form.elements.topic;
  const hint = document.getElementById("beef-hint");

  topic.addEventListener("change", () => {
    hint.hidden = topic.value !== "Beef-related complaint";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    err.textContent = "";
    const fields = ["name", "email", "message"].map((n) => form.elements[n]);
    fields.forEach((f) => f.removeAttribute("aria-invalid"));

    const missing = fields.filter((f) => !f.value.trim());
    if (missing.length) {
      missing.forEach((f) => f.setAttribute("aria-invalid", "true"));
      err.textContent = "Please fill in your name, email and a message.";
      missing[0].focus();
      return;
    }
    const email = form.elements.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.setAttribute("aria-invalid", "true");
      err.textContent = "That email address doesn't look right.";
      email.focus();
      return;
    }

    const name = form.elements.name.value.trim();
    const subject = `[Website] ${topic.value} from ${name}`;
    const body = `${form.elements.message.value.trim()}\n\n${name}\n${email.value.trim()}`;
    window.location.href =
      `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
