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
 * @returns {Promise<string>} - The AI's response text.
 */
export async function askGemini(contents) {
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

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: formattedContents })
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
