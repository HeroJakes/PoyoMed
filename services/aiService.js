/**
 * Gemini AI Service (REST API Fallback)
 * 
 * We use the REST API directly via fetch to avoid versioning conflicts 
 * with the @google/generative-ai SDK in the Expo environment.
 */

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

if (!API_KEY) {
    console.warn("⚠️ EXPO_PUBLIC_GEMINI_API_KEY is missing! Please check your .env file and restart the server.");
} else {
    console.log("✅ Gemini API Key loaded (starts with):", API_KEY.substring(0, 8));
}

/**
 * Sends a prompt (and optional image data) to Gemini.
 * @param {string|Array} contents - A string prompt or an array of parts (text/image).
 * @param {boolean} isJsonMode - If true, enforces a strict JSON response.
 * @returns {Promise<string>} - The AI's response text.
 */
export async function askGemini(contents, isJsonMode = false) {
    if (!API_KEY) {
        console.error("EXPO_PUBLIC_GEMINI_API_KEY is not defined in .env");
        throw new Error("API Key is missing. Please check your .env file and restart the server.");
    }

    const url = `${BASE_URL}?key=${API_KEY}`;

    // Format the contents for the REST API
    let formattedContents = [];

    if (Array.isArray(contents)) {
        // Handle array of parts (text + image) from camera.js
        const parts = contents.map(part => {
            if (typeof part === 'string') {
                return { text: part };
            } else if (part.inlineData) {
                // Convert SDK format to REST API format
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
        // Handle simple string prompt
        formattedContents = [{ role: 'user', parts: [{ text: contents }] }];
    }

    const body = {
        contents: formattedContents
    };

    if (isJsonMode) {
        body.generationConfig = {
            response_mime_type: "application/json"
        };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Gemini API Error Response:", JSON.stringify(errorData, null, 2));
            throw new Error(errorData.error?.message || "Failed to connect to Gemini API");
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.error("❌ No candidates in Gemini response:", data);
            throw new Error("No response candidates returned from Gemini");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("❌ Gemini Service Error:", error);
        throw error;
    }
}

/**
 * Checks for potential drug interactions between a new medicine and existing active medicines.
 * @param {string} newMedName - Name of the new medicine.
 * @param {string} newMedDosage - Dosage of the new medicine.
 * @param {Array<string>} existingMedNames - Array of existing active medicine names.
 * @returns {Promise<Object>} - JSON object with interaction details.
 */
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

/**
 * Simplifies medical jargon or provides general usage tips for a medicine.
 * @param {string} medName - Name of the medicine.
 * @param {string} currentInstructions - Existing jargon or instructions (optional).
 * @returns {Promise<string>} - Simplified instructions or safety tips.
 */
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
