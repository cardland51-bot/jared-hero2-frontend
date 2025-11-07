// ========= CONFIG =========
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"; // temp for local testing

// ========= ELEMENTS =========
const el = {
  fileInput: document.getElementById("fileInput"),
  btnUpload: document.getElementById("btnUpload"),
  btnAnalyze: document.getElementById("btnAnalyze"),
  btnSpeak: document.getElementById("btnSpeak"),
  previewImage: document.getElementById("previewImage"),
  previewPlaceholder: document.getElementById("previewPlaceholder"),
  estSummary: document.getElementById("estSummary"),
  estPrice: document.getElementById("estPrice"),
  systemNote: document.getElementById("systemNote")
};

const STATE = {
  imageBase64: null,
  lastSummary: ""
};

// ========= HELPERS =========
function setNote(msg) {
  el.systemNote.textContent = msg;
}
function setLoading(isLoading) {
  el.btnAnalyze.disabled = isLoading;
  el.btnAnalyze.textContent = isLoading ? "Working…" : "🔍 Analyze Now";
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
    setNote("Photo loaded. Ready for Jared.");
    const reader = new FileReader();
    reader.onloadend = () => {
      STATE.imageBase64 = reader.result.split(",")[1];
    };
    reader.readAsDataURL(file);
  });
}

// ========= ANALYZE (OpenAI Vision) =========
function wireAnalyze() {
  el.btnAnalyze.addEventListener("click", async () => {
    if (!STATE.imageBase64) {
      setNote("Upload a photo first.");
      return;
    }

    setLoading(true);
    setNote("Jared is analyzing with OpenAI…");

    try {
      const resp = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: "Describe this yard or landscape photo in detail and what work might be needed." },
                { type: "input_image", image_data: STATE.imageBase64 }
              ]
            }
          ]
        })
      });

      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      const summary = data.output_text || "No response received.";
      STATE.lastSummary = summary;

      el.estSummary.textContent = summary;
      el.estPrice.textContent = "$—";
      setNote("Analysis complete — Jared has spoken.");

      // Auto-speak result
      await speakJared(summary);

    } catch (err) {
      console.error("❌ Jared error:", err);
      setNote("Analysis failed. Check connection or key.");
    } finally {
      setLoading(false);
    }
  });
}

// ========= SPEAK (OpenAI Voice) =========
async function speakJared(text) {
  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
  } catch (err) {
    console.error("TTS error:", err);
    setNote("Speech unavailable, but analysis succeeded.");
  }
}

// ========= INIT =========
window.addEventListener("DOMContentLoaded", () => {
  wireUpload();
  wireAnalyze();
  setNote("Jared ready. Upload → Analyze.");
});
