// ========= ELEMENTS =========
const el = {
  fileInput: document.getElementById("fileInput"),
  btnUpload: document.getElementById("btnUpload"),
  previewImage: document.getElementById("previewImage"),
  previewPlaceholder: document.getElementById("previewPlaceholder"),
  btnToggleJared: document.getElementById("btnToggleJared"),
  btnAnalyze: document.getElementById("btnAnalyze"),
  estSummary: document.getElementById("estSummary"),
  estPrice: document.getElementById("estPrice"),
  systemNote: document.getElementById("systemNote")
};

// ========= STATE =========
let jaredEnabled = false;
let imageBase64 = null;

// ========= HELPERS =========
function setNote(msg) {
  el.systemNote.textContent = msg;
}

function setLoading(isLoading) {
  el.btnAnalyze.disabled = isLoading;
  el.btnAnalyze.textContent = isLoading ? "Working…" : "🔍 Analyze";
}

// ========= TOGGLE JARED =========
function wireJaredToggle() {
  el.btnToggleJared.addEventListener("click", () => {
    jaredEnabled = !jaredEnabled;
    if (jaredEnabled) {
      setNote("Jared is online.");
      el.btnToggleJared.textContent = "🔊 Jared: ON";
    } else {
      setNote("Jared is offline.");
      el.btnToggleJared.textContent = "🔇 Jared: OFF";
    }
  });
}

// ========= UPLOAD =========
function wireUpload() {
  el.btnUpload.addEventListener("click", () => el.fileInput.click());
  el.fileInput.addEventListener("change", () => {
    const file = el.fileInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    el.previewImage.src = url;
    el.previewImage.classList.remove("hidden");
    el.previewPlaceholder.classList.add("hidden");
    setNote("Photo loaded. Ready when you are.");
    const reader = new FileReader();
    reader.onloadend = () => {
      imageBase64 = reader.result.split(",")[1];
    };
    reader.readAsDataURL(file);
  });
}

// ========= ANALYZE (Static Placeholder) =========
function wireAnalyze() {
  el.btnAnalyze.addEventListener("click", async () => {
    if (!imageBase64) {
      setNote("Upload a photo first.");
      return;
    }

    setLoading(true);
    setNote("Analyzing locally...");

    // Simple fake placeholder result
    const summary = "Cardinal_AI is being trained currently.";
    const price = "$—";

    el.estSummary.textContent = summary;
    el.estPrice.textContent = price;
    setNote("Analysis complete.");

    if (jaredEnabled) {
      speakLocal("Analysis complete. Yard loaded successfully.");
    }

    setLoading(false);
  });
}

// ========= SPEAK (Local Only) =========
function speakLocal(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = speechSynthesis.getVoices().find(v => /male/i.test(v.name)) || null;
  utter.rate = 1;
  speechSynthesis.speak(utter);
}

// ========= INIT =========
window.addEventListener("DOMContentLoaded", () => {
  wireUpload();
  wireAnalyze();
  wireJaredToggle();
  setNote("Ready — Jared toggle available.");
});

