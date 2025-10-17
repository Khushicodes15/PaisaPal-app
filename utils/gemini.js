import Constants from 'expo-constants';
import { useStore } from '../utils/store';
import { getMonthlyData, getCategoryTotals, formatCurrency } from '../utils/helpers';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let keyValidated = false;

async function validateKey() {
  if (keyValidated || !GEMINI_API_KEY) return keyValidated;

  try {
    const testResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      }
    );
    keyValidated = testResponse.ok;
    if (!keyValidated) {
      const errorData = await testResponse.json();
      console.error('❌ Key validation failed. Status:', testResponse.status, 'Error:', errorData.error?.message);
    } else {
      console.log('✅ API key validated successfully!');
    }
    return keyValidated;
  } catch (e) {
    console.error('❌ Key validation error:', e.message);
    return false;
  }
}

export async function askGeminiAI(prompt, context = {}) {
  const { user, transactions } = useStore.getState();
  const monthlyTx = getMonthlyData(transactions || []);
  const categoryTotals = getCategoryTotals(monthlyTx);
  const totalExpense = monthlyTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = monthlyTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);

  const fullContext = {
    balance: user?.balance || 0,
    txCount: transactions?.length || 0,
    monthlyIncome: totalIncome,
    monthlyExpense: totalExpense,
    streakDays: user?.streakDays || 0,
    categoryTotals,
    ...context,
  };

  if (!await validateKey()) {
    console.warn('🔑 Invalid/missing API key. Using fallback.');
    return getLocalFallback(prompt, fullContext);
  }

  const models = ['gemini-1.5-flash-001', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  let lastError = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    for (let retry = 0; retry < 3; retry++) { // Up to 3 retries per model
      try {
        console.log(`🤖 Attempt ${retry + 1} with ${model}:`, prompt.substring(0, 50) + '...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const requestBody = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are PaisaPal AI, a friendly Indian financial assistant.

User Data:
- Balance: ₹${formatCurrency(fullContext.balance)}
- Monthly Income: ₹${formatCurrency(fullContext.monthlyIncome)}
- Monthly Expense: ₹${formatCurrency(fullContext.monthlyExpense)}
- Transactions: ${fullContext.txCount}
- Streak: ${fullContext.streakDays} days
- Categories: ${JSON.stringify(fullContext.categoryTotals)}

User question: "${prompt}"

Give helpful financial advice in under 5 sentences using ₹ and emojis. Be encouraging and practical.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        console.log(`📡 ${model} response status:`, response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`❌ ${model} error on retry ${retry + 1}:`, errorData.error?.message);
          lastError = { model, status: response.status, message: errorData.error?.message };
          if (response.status === 429) { // Rate limit
            console.warn('⏳ Rate limit. Retrying in 3s...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue; // Retry this model
          }
          if (response.status === 404) {
            console.warn('⚠️ Model not found. Trying next model.');
            break; // Skip to next model
          }
          if (response.status === 401 || response.status === 403) {
            console.error('🔑 Invalid key or permissions. Check AI Studio.');
            return getLocalFallback(prompt, fullContext);
          }
          continue; // Retry or next model
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (aiResponse) {
          console.log('✅ Real Gemini response:', aiResponse.substring(0, 50) + '...');
          return aiResponse;
        }

        console.warn(`⚠️ Empty response from ${model}. Retrying...`);
      } catch (error) {
        console.error(`❌ ${model} error on retry ${retry + 1}:`, error.message);
        lastError = { model, error: error.message };
        if (error.name === 'AbortError') {
          console.warn('⏰ Timeout. Retrying...');
        }
      }
    }
  }

  console.error('🔄 All attempts failed. Last error:', lastError);
  return `⚠️ Gemini unavailable (Error: ${lastError?.message || 'Unknown'}). Local advice: ${getLocalFallback(prompt, fullContext)}`;
}

// Local fallbacks (unchanged, but ensure it's only a last resort)
function getLocalFallback(prompt, context) {
  const { balance, monthlyIncome, monthlyExpense, categoryTotals } = context;
  const savings = monthlyIncome - monthlyExpense;
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('how am i doing') || lowerPrompt.includes('status')) {
    return `Based on your data, you're maintaining a solid balance of ₹${formatCurrency(balance)}! 🌟 With ${savings > 0 ? `₹${formatCurrency(savings)} saved` : 'room to optimize'} this month, keep tracking—you're on track! 📊`;
  } else if (lowerPrompt.includes('savings tips') || lowerPrompt.includes('save')) {
    return `Top tip: Review your top category ${Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0]?.[0] || 'expenses'} and cut 10-20%. 💡 Start a ₹500 emergency fund—small wins add up! 🏆`;
  } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('spending')) {
    const topSpend = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0] || ['Uncategorized', 0];
    return `Your biggest spend is ${topSpend[0]} at ₹${formatCurrency(topSpend[1])}. 🔍 Shift ₹200 from there to savings for better balance. You've got this! 💪`;
  } else if (lowerPrompt.includes('compare') || lowerPrompt.includes('trend')) {
    return `Tracking trends? Your monthly expenses are ₹${formatCurrency(monthlyExpense)}—aim to keep it under 70% of income. 📈 Log more transactions for deeper insights!`;
  } else if (lowerPrompt.includes('budget')) {
    return `Build a budget: Allocate 50% to needs, 30% to wants, 20% to savings. Based on your ₹${formatCurrency(monthlyIncome)}, target ₹${formatCurrency(monthlyIncome * 0.2)} saved. 🎯`;
  } else {
    return `Smart question! With your current ₹${formatCurrency(balance)} and ${context.streakDays}-day streak, focus on consistent tracking. 🔥 What specific area—savings or spending? Let's dive deeper!`;
  }
}