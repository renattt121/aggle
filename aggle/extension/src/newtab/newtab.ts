// Custom new tab page

const q = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

function updateTime(): void {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  q<HTMLDivElement>("#clock-time").textContent = `${h}:${mins} ${ampm}`;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  q<HTMLDivElement>("#clock-date").textContent = dateStr;
}

function getDefaultLinks(): { label: string; url: string }[] {
  return [
    { label: "GitHub", url: "https://github.com" },
    { label: "Google", url: "https://google.com" },
    { label: "YouTube", url: "https://youtube.com" },
    { label: "Reddit", url: "https://reddit.com" },
    { label: "Aggle", url: "about:addons" },
  ];
}

function renderLinks(): void {
  const wrap = q<HTMLDivElement>("#quick-links");
  wrap.innerHTML = "";
  const links = JSON.parse(localStorage.getItem("aggle-quick-links") ?? JSON.stringify(getDefaultLinks())) as { label: string; url: string }[];
  for (const link of links) {
    const a = document.createElement("a");
    a.className = "link";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = link.label;
    wrap.appendChild(a);
  }
}

function setGreeting(): void {
  const h = new Date().getHours();
  const greet = h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  q<HTMLParagraphElement>("#greeting").textContent = greet;
}

function bindSearch(): void {
  const form = q<HTMLFormElement>("#search-form");
  const input = q<HTMLInputElement>("#search-input");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    browser.tabs.create({ url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}` });
  });
}

(async () => {
  setGreeting();
  updateTime();
  setInterval(updateTime, 10000);
  renderLinks();
  bindSearch();
})();
