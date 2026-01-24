const analyzeBtn = document.getElementById("analyzeBtn");
const imageInput = document.getElementById("imageInput");

analyzeBtn.addEventListener("click", () => {
  if (!imageInput.files.length) {
    alert("Please upload an image");
    return;
  }

  analyzeBtn.innerText = "Analyzing...";
  analyzeBtn.disabled = true;

  // Fake AI delay (realistic)
  setTimeout(() => {
    const aiScore = Math.floor(Math.random() * 40) + 30; // 30–70%
    const isAI = aiScore > 50;

    showResult(isAI, aiScore);

    analyzeBtn.addEventListener("click", async () => {
  if (!imageInput.files.length) {
    alert("Please upload an image");
    return;
  }

  analyzeBtn.innerText = "Analyzing...";
  analyzeBtn.disabled = true;

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);

  try {
    const res = await fetch("https://ai-image-detector-backend-z55k.onrender.com", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    showResult(
      data.result.includes("AI"),
      parseInt(data.confidence)
    );

  } catch (err) {
    alert("Server error");
  }

  analyzeBtn.innerText = "Analyze Image";
  analyzeBtn.disabled = false;
});

});

function showResult(isAI, confidence) {
  let resultBox = document.getElementById("demoResult");

  if (!resultBox) {
    resultBox = document.createElement("div");
    resultBox.id = "demoResult";
    resultBox.style.marginTop = "16px";
    resultBox.style.padding = "14px";
    resultBox.style.borderRadius = "14px";
    resultBox.style.background = "rgba(0,0,0,0.4)";
    document.querySelector(".card").appendChild(resultBox);
  }

  resultBox.innerHTML = `
    <h3 style="margin:5px 0">
      ${isAI ? "⚠️ Likely AI-Generated Image" : "✅ Likely Real Image"}
    </h3>
    <p>Confidence: <b>${confidence}%</b></p>
  `;
}