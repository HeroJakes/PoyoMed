
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

if (!API_KEY) {
    console.warn("Gemini API Key missing! Check .env");
}

async function fetchWithRetry(url, options, maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;

            // If it's a 4xx error (except 429), don't retry
            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }

            lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
            if (i === maxRetries - 1) break;
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}

export async function askGemini(contents, isJsonMode = false) {
    if (!API_KEY) {
        throw new Error("API Key is missing. Please check your .env file.");
    }

    const url = `${BASE_URL}?key=${API_KEY}`;
    let formattedContents = [];

    // Basic sanitization and formatting
    if (Array.isArray(contents)) {
        const parts = contents.map(part => {
            if (typeof part === 'string') {
                return { text: part.trim() };
            } else if (part.inlineData) {
                return {
                    inline_data: {
                        mime_type: part.inlineData.mimeType,
                        data: part.inlineData.data
                    }
                };
            }
            return part;
        });
        formattedContents = [{ role: 'user', parts }];
    } else {
        formattedContents = [{ role: 'user', parts: [{ text: String(contents).trim() }] }];
    }

    const body = {
        contents: formattedContents,
        generationConfig: isJsonMode ? { response_mime_type: "application/json" } : {}
    };

    try {
        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error("❌ Invalid Gemini response structure:", data);
            throw new Error("Received an empty or invalid response from Gemini.");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("❌ Gemini Service Error:", error.message);
        throw error;
    }
}

export async function checkDrugInteractions(newMedName, newMedDosage, existingMedNames) {
    if (!existingMedNames || existingMedNames.length === 0) {
        return { hasInteraction: false };
    }

    const prompt = `Act as a clinical pharmacist. Analyze the potential drug-drug interactions between a NEW medicine and a list of EXISTING medicines.

NEW Medicine: ${newMedName} (${newMedDosage})
EXISTING Medicines: ${existingMedNames.join(', ')}

Return ONLY a JSON object with these keys:
- hasInteraction: (boolean) True if a significant risk is found.
- severity: (string) 'High', 'Medium', or 'Low' (only if hasInteraction is true).
- warningMessage: (string) A concise, serious warning for the user (e.g., "Wait! You just added Aspirin...").
- reason: (string) A brief medical explanation of the risk.

IMPORTANT: If no significant interaction is found, return {"hasInteraction": false}. Do not halluncinate risks. Focus on clinically significant drug-drug interactions.`;

    try {
        const responseText = await askGemini(prompt, true);
        return JSON.parse(responseText);
    } catch (error) {
        console.error("❌ Drug Interaction Check Error:", error);
        return { hasInteraction: false }; // Fallback to safe mode
    }
}

export async function getMedicineTips(medName, currentInstructions = "") {
    const prompt = currentInstructions
        ? `Act as a helpful pharmacist. Simplify these medical instructions for a patient. Use plain, friendly English.
           Instructions to simplify: "${currentInstructions}"
           Medicine: ${medName}
           
           Example: "Take 1 tab po bid pc" -> "Take 1 pill by mouth twice a day after your meals."
           Return ONLY the simplified text.`
        : `Act as a helpful pharmacist. Provide 2-3 concise, essential safety tips or usage instructions for taking "${medName}". 
           Focus on things like: whether to take with food, common side effects to watch for, or max dosage.
           Use plain, friendly English. Keep it under 40 words.
           Return ONLY the tips.`;

    try {
        const responseText = await askGemini(prompt);
        return responseText.trim();
    } catch (error) {
        console.error("❌ Get Medicine Tips Error:", error);
        return "Always take this medicine exactly as directed by your doctor or pharmacist.";
    }
}
