import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("GEMINI KEY LOADED:", !!process.env.GEMINI_API_KEY);

// Comprehensive scam patterns database
const scamPatterns = {
  telecom: {
    keywords: ['sim', 'deactivated', 'otp', 'mobile', 'network', 'service', 'recharge', 'share', 'continue'],
    indicators: ['sim will be', 'share otp', 'deactivated today', 'continue services', 'share the otp'],
    type: 'Telecom/SIM Scam'
  },
  phishing: {
    keywords: ['verify', 'suspended', 'confirm', 'login', 'account', 'security', 'authenticate'],
    indicators: ['urgent action', 'click here', 'verify now', 'account locked'],
    type: 'Phishing Scam'
  },
  financial: {
    keywords: ['bank', 'payment', 'card', 'billing', 'transaction', 'refund', 'credit', 'debit'],
    indicators: ['blocked', 'expired', 'update payment', 'frozen account'],
    type: 'Financial Scam'
  },
  lottery: {
    keywords: ['winner', 'prize', 'congratulations', 'lottery', 'jackpot', 'sweepstakes'],
    indicators: ['you won', 'claim now', 'lucky winner', 'selected winner'],
    type: 'Lottery/Prize Scam'
  },
  tech: {
    keywords: ['virus', 'malware', 'infected', 'microsoft', 'apple', 'support', 'computer'],
    indicators: ['computer infected', 'call now', 'tech support', 'system error'],
    type: 'Tech Support Scam'
  },
  romance: {
    keywords: ['love', 'lonely', 'relationship', 'meet', 'dating', 'soulmate', 'heart'],
    indicators: ['send money', 'emergency', 'help me', 'stranded', 'hospital'],
    type: 'Romance Scam'
  },
  investment: {
    keywords: ['invest', 'profit', 'returns', 'cryptocurrency', 'bitcoin', 'trading', 'forex'],
    indicators: ['guaranteed returns', 'get rich quick', 'limited time', 'exclusive offer'],
    type: 'Investment Scam'
  },
  employment: {
    keywords: ['job', 'work from home', 'easy money', 'hiring', 'employment', 'salary'],
    indicators: ['no experience needed', 'pay upfront', 'processing fee', 'work from home'],
    type: 'Employment Scam'
  },
  charity: {
    keywords: ['donation', 'charity', 'help', 'disaster', 'fundraising', 'donate'],
    indicators: ['urgent help needed', 'donate now', 'emergency fund', 'victims'],
    type: 'Charity Scam'
  },
  identity: {
    keywords: ['ssn', 'social security', 'identity', 'personal information', 'documents'],
    indicators: ['provide ssn', 'identity verification', 'personal details', 'government'],
    type: 'Identity Theft Scam'
  },
  rental: {
    keywords: ['rent', 'apartment', 'house', 'property', 'lease', 'deposit'],
    indicators: ['send deposit', 'wire money', 'overseas landlord', 'keys by mail'],
    type: 'Rental Scam'
  },
  shopping: {
    keywords: ['deal', 'discount', 'sale', 'cheap', 'limited offer', 'bargain'],
    indicators: ['too good to be true', 'limited time', 'act now', 'exclusive deal'],
    type: 'Shopping Scam'
  },
  insurance: {
    keywords: ['insurance', 'policy', 'coverage', 'claim', 'premium', 'benefits'],
    indicators: ['expired policy', 'renew now', 'claim money', 'insurance refund'],
    type: 'Insurance Scam'
  },
  tax: {
    keywords: ['irs', 'tax', 'refund', 'audit', 'government', 'treasury'],
    indicators: ['tax refund', 'irs audit', 'pay immediately', 'arrest warrant'],
    type: 'Tax Scam'
  },
  health: {
    keywords: ['medicine', 'cure', 'treatment', 'doctor', 'health', 'medical'],
    indicators: ['miracle cure', 'secret treatment', 'doctors hate this', 'instant results'],
    type: 'Health/Medical Scam'
  },
  advance_fee: {
    keywords: ['fee', 'processing', 'transfer', 'inheritance', 'lawyer', 'beneficiary'],
    indicators: ['pay fee first', 'processing fee', 'transfer fee', 'legal fee'],
    type: 'Advance Fee Scam'
  }
};

function analyzeScamType(message) {
  const lowerMessage = message.toLowerCase();
  let bestMatch = { type: 'Unknown Scam', score: 0, reason: '' };
  
  for (const [key, pattern] of Object.entries(scamPatterns)) {
    let score = 0;
    let matchedTerms = [];
    
    // Check keywords
    pattern.keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        score += 2;
        matchedTerms.push(keyword);
      }
    });
    
    // Check indicators (higher weight)
    pattern.indicators.forEach(indicator => {
      if (lowerMessage.includes(indicator)) {
        score += 3;
        matchedTerms.push(indicator);
      }
    });
    
    if (score > bestMatch.score) {
      bestMatch = {
        type: pattern.type,
        score: score,
        reason: `Contains ${pattern.type.toLowerCase()} indicators: ${matchedTerms.join(', ')}`
      };
    }
  }
  
  return bestMatch;
}

function getSafetyTip(scamType) {
  const tips = {
    'Telecom/SIM Scam': 'Never share OTP with anyone. Telecom companies don\'t ask for OTP.',
    'Financial Scam': 'Contact your bank directly using official phone numbers.',
    'Lottery/Prize Scam': 'Legitimate lotteries don\'t ask for fees upfront.',
    'Tech Support Scam': 'Real tech companies don\'t call unsolicited.',
    'Romance Scam': 'Never send money to someone you haven\'t met in person.',
    'Investment Scam': 'Be wary of guaranteed returns. Research thoroughly.',
    'Employment Scam': 'Legitimate jobs don\'t require upfront payments.',
    'Charity Scam': 'Verify charities through official databases.',
    'Identity Theft Scam': 'Never provide SSN or personal info via unsolicited contact.',
    'Rental Scam': 'Always view property in person before paying.',
    'Shopping Scam': 'If deals seem too good to be true, they probably are.',
    'Insurance Scam': 'Verify insurance communications through official channels.',
    'Tax Scam': 'IRS doesn\'t threaten arrest or demand immediate payment.',
    'Health/Medical Scam': 'Consult real doctors. Avoid miracle cure claims.',
    'Advance Fee Scam': 'Never pay fees upfront for promised money.',
    'Unknown Scam': 'Be cautious. Verify through official channels.'
  };
  return tips[scamType] || tips['Unknown Scam'];
}

app.post("/analyze", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ result: "No message received." });
    }

    console.log("Message received:", message);

    // Try Gemini API first
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      
      const prompt = `You are an expert scam detection AI. Analyze this message and identify the specific type of scam from these categories:

- Telecom/SIM Scam
- Phishing Scam
- Financial Scam  
- Lottery/Prize Scam
- Tech Support Scam
- Romance Scam
- Investment Scam
- Employment Scam
- Charity Scam
- Identity Theft Scam
- Rental Scam
- Shopping Scam
- Insurance Scam
- Tax Scam
- Health/Medical Scam
- Advance Fee Scam
- Other Scam (specify type)

Message: "${message}"

Respond in this exact format:
Scam Type: [specific type]
Verdict: [SCAM/POSSIBLY SCAM/SAFE]
Reason: [detailed explanation with specific red flags]
Safety Tip: [specific actionable advice]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return res.json({ result: text });
    } catch (apiError) {
      console.log("API failed, using fallback analysis");
    }

    // Fallback analysis
    const analysis = analyzeScamType(message);
    const hasScamIndicators = analysis.score > 0;
    
    if (hasScamIndicators) {
      const result = `Scam Type: ${analysis.type}
Verdict: ${analysis.score >= 4 ? 'SCAM' : 'POSSIBLY SCAM'}
Reason: ${analysis.reason}
Safety Tip: ${getSafetyTip(analysis.type)}`;
      
      res.json({ result });
    } else {
      res.json({ 
        result: "Scam Type: None Detected\nVerdict: SAFE\nReason: No suspicious patterns found\nSafety Tip: Always stay vigilant with unsolicited messages" 
      });
    }

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.json({ result: "Analysis failed. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`ScamExplain AI Backend running on http://localhost:${PORT}`);
  console.log(`Frontend served from: ${path.join(__dirname, '../frontend/public')}`);
});
