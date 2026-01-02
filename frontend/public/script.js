const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://your-render-backend-url.onrender.com'; // Replace with your Render backend URL

const examples = {
  phishing: "URGENT: Your PayPal account has been suspended due to suspicious activity. Verify your account immediately at paypal-security-verify.com to avoid permanent closure.",
  financial: "Your bank account will be blocked today. Update your payment information at secure-bankverify.com within 24 hours.",
  lottery: "Congratulations! You've won $50,000 in the Google Lottery! Claim your prize now by providing your bank details.",
  tech: "WARNING: Your computer is infected with 5 viruses! Call Microsoft Support at 1-800-FAKE-NUM immediately.",
  investment: "Guaranteed 500% returns in Bitcoin trading! Limited spots available. Invest $1000 now and become rich in 30 days!",
  employment: "Work from home! Earn $5000/week with no experience needed. Just pay $200 processing fee to get started.",
  romance: "My dearest love, I'm stranded in Nigeria and need $2000 for emergency surgery. Please help your soulmate.",
  rental: "Beautiful 3BR apartment for $500/month! Send deposit via wire transfer. Keys will be mailed after payment."
};

function loadExample(type) {
  document.getElementById("message").value = examples[type];
}

async function analyze() {
  const message = document.getElementById("message").value;
  const output = document.getElementById("output");
  const btn = document.getElementById("analyzeBtn");

  if (!message.trim()) {
    output.innerHTML = '<div class="error">Please enter a message to analyze.</div>';
    return;
  }

  btn.textContent = "🔍 Analyzing...";
  btn.disabled = true;
  output.innerHTML = '<div class="loading">Analyzing message with AI...</div>';

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    displayResult(data.result);
  } catch (err) {
    output.innerHTML = '<div class="error">Connection error. Please try again.</div>';
  } finally {
    btn.textContent = "🔍 Analyze Message";
    btn.disabled = false;
  }
}

function displayResult(result) {
  const output = document.getElementById("output");
  const lines = result.split('\n');
  
  let html = '<div class="result">';
  
  lines.forEach(line => {
    if (line.startsWith('Scam Type:')) {
      const type = line.replace('Scam Type:', '').trim();
      html += `<div class="scam-type">🎯 <strong>Scam Type:</strong> ${type}</div>`;
    } else if (line.startsWith('Verdict:')) {
      const verdict = line.replace('Verdict:', '').trim();
      const icon = verdict === 'SCAM' ? '🚨' : verdict === 'POSSIBLY SCAM' ? '⚠️' : '✅';
      const className = verdict === 'SCAM' ? 'danger' : verdict === 'POSSIBLY SCAM' ? 'warning' : 'safe';
      html += `<div class="verdict ${className}">${icon} <strong>Verdict:</strong> ${verdict}</div>`;
    } else if (line.startsWith('Reason:')) {
      const reason = line.replace('Reason:', '').trim();
      html += `<div class="reason">💡 <strong>Reason:</strong> ${reason}</div>`;
    } else if (line.startsWith('Safety Tip:')) {
      const tip = line.replace('Safety Tip:', '').trim();
      html += `<div class="safety-tip">🛡️ <strong>Safety Tip:</strong> ${tip}</div>`;
    }
  });
  
  html += '</div>';
  output.innerHTML = html;
}
