const selected = new Set();
const chips = [...document.querySelectorAll(".chip")];
const sampleButton = document.querySelector("#sampleButton");
const form = document.querySelector("#careForm");
const emptyState = document.querySelector("#emptyState");
const results = document.querySelector("#results");

chips.forEach((chip) => chip.addEventListener("click", () => {
  const value = chip.dataset.value;
  selected.has(value) ? selected.delete(value) : selected.add(value);
  chip.classList.toggle("active", selected.has(value));
}));

sampleButton.addEventListener("click", () => {
  ["fever", "cough", "fatigue"].forEach((value) => {
    selected.add(value);
    document.querySelector(`[data-value="${value}"]`).classList.add("active");
  });
  document.querySelector("#duration").value = "days";
  document.querySelector("#age").value = "adult";
  document.querySelector('input[value="cost"]').checked = true;
  document.querySelector('input[value="transport"]').checked = true;
  buildPath();
});

form.addEventListener("submit", (event) => { event.preventDefault(); buildPath(); });

function buildPath() {
  const constraints = [...document.querySelectorAll(".check input:checked")].map((input) => input.value);
  const emergencySignals = selected.has("breathing") || (selected.has("pain") && selected.has("dehydration"));
  const soonSignals = selected.has("fever") || selected.has("dehydration") || selected.has("rash") || selected.has("pain");
  const status = emergencySignals ? "now" : soonSignals ? "soon" : "routine";
  const statusText = emergencySignals ? "Act now" : soonSignals ? "Get support soon" : "Monitor + plan";
  const title = emergencySignals ? "Please get urgent help now." : soonSignals ? "A same-day check-in may help." : "A low-pressure next step is okay.";
  const summary = emergencySignals
    ? "Some of the signals you selected can be time-sensitive. Use local emergency services or an emergency department now—do not wait for this tool."
    : soonSignals
      ? "Your answers include signals that are worth discussing with a qualified professional soon, especially if they are worsening or new."
      : "Nothing you selected automatically points to an emergency. Keep observing, write down changes, and choose care if symptoms persist or worsen.";
  const routes = emergencySignals
    ? [{ title: "Emergency services", text: "Call your local emergency number or go to the nearest emergency department. If possible, ask someone to stay with you.", tags: ["Immediate", "Professional care"] }]
    : [
      { title: constraints.includes("cost") ? "Community health center" : "Primary care or walk-in clinic", text: constraints.includes("transport") ? "Ask about telehealth, mobile clinics, or a ride program when you call." : "Bring a short timeline of symptoms, medications, and changes you have noticed.", tags: [constraints.includes("cost") ? "Lower-cost option" : "Often available", constraints.includes("language") ? "Ask for an interpreter" : "Call ahead"] },
      { title: "What you can do now", text: "Rest, drink fluids if you can, and track temperature or symptom changes. Avoid starting new medication without professional advice.", tags: ["Low risk", "Track changes"] }
    ];
  emptyState.classList.add("hidden");
  results.classList.remove("hidden");
  results.innerHTML = `<div class="result-kicker"><p class="eyebrow">Your care path</p><span class="status ${status}">${statusText}</span></div>
    <h2 class="result-title">${title}</h2><p class="result-summary">${summary}</p>
    ${emergencySignals ? '<div class="alert-box"><b>Safety boundary:</b> CarePath cannot assess emergencies. If you have severe trouble breathing, sudden confusion, fainting, or feel unsafe, contact emergency services immediately.</div>' : ""}
    ${routes.map((route) => `<article class="route-card"><h3>${route.title}</h3><p>${route.text}</p><div class="route-meta">${route.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div></article>`).join("")}
    <div class="why"><h3>Why this appeared</h3><ul><li>${selected.size ? `${selected.size} signal${selected.size === 1 ? "" : "s"} selected` : "No symptom signal selected"}</li><li>${document.querySelector("#duration").selectedOptions[0].text} timeline</li><li>${constraints.length ? `${constraints.length} access preference${constraints.length === 1 ? "" : "s"} applied` : "No access constraints added"}</li></ul></div>`;
}
