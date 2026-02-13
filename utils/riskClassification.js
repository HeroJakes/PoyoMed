import { askGemini } from '../services/aiService';

/**
 * Risk levels for medicines
 */
export const RISK_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

/**
 * Risk level metadata
 */
export const RISK_METADATA = {
    low: {
        label: 'Low Risk',
        color: '#4CAF50',
        icon: 'checkmark-circle',
        description: 'Generally safe for household disposal with precautions',
        disposalMethod: 'Can be disposed in regular trash after mixing with undesirable substance (coffee grounds, cat litter). Remove personal information from packaging.'
    },
    medium: {
        label: 'Medium Risk',
        color: '#FF9800',
        icon: 'alert-circle',
        description: 'Requires careful disposal to prevent misuse',
        disposalMethod: 'Return to pharmacy or use medicine take-back program. Do not flush or throw in regular trash.'
    },
    high: {
        label: 'High Risk',
        color: '#F44336',
        icon: 'warning',
        description: 'Dangerous if misused - must be properly disposed',
        disposalMethod: 'MUST be returned to pharmacy or hospital. Never flush or dispose in regular trash. Keep away from children and pets.'
    }
};

/**
 * Common medicine categories and their risk levels
 */
const MEDICINE_RISK_MAP = {
    // High Risk
    'antibiotic': 'high',
    'antibiotics': 'high',
    'controlled substance': 'high',
    'opioid': 'high',
    'narcotic': 'high',
    'benzodiazepine': 'high',
    'antipsychotic': 'high',
    'chemotherapy': 'high',
    'immunosuppressant': 'high',
    'warfarin': 'high',
    'insulin': 'high',

    // Medium Risk
    'painkiller': 'medium',
    'pain relief': 'medium',
    'anti-inflammatory': 'medium',
    'antidepressant': 'medium',
    'blood pressure': 'medium',
    'diabetes': 'medium',
    'thyroid': 'medium',
    'hormone': 'medium',
    'steroid': 'medium',
    'prescription': 'medium',

    // Low Risk
    'vitamin': 'low',
    'supplement': 'low',
    'multivitamin': 'low',
    'calcium': 'low',
    'fish oil': 'low',
    'probiotic': 'low',
    'antacid': 'low',
    'cough drop': 'low',
    'lozenge': 'low'
};

/**
 * Classify medicine risk level using AI
 * @param {string} medicineName - Name of the medicine
 * @param {string} category - Optional category/type
 * @returns {Promise<string>} Risk level (low, medium, high)
 */
export async function classifyMedicineRisk(medicineName, category = '') {
    try {
        // First, try local classification based on keywords
        const searchText = `${medicineName} ${category}`.toLowerCase();

        for (const [keyword, riskLevel] of Object.entries(MEDICINE_RISK_MAP)) {
            if (searchText.includes(keyword)) {
                return riskLevel;
            }
        }

        // If no match, use AI classification
        const prompt = `Classify this medicine's disposal risk level: "${medicineName}".
    
Return a JSON object with a single key "risk" and one of these values: "low", "medium", or "high".

Guidelines:
- HIGH: Antibiotics, controlled drugs, opioids, chemotherapy, immunosuppressants
- MEDIUM: OTC painkillers, prescription medications, antidepressants, blood pressure meds
- LOW: Vitamins, supplements, antacids, cough drops`;

        const response = await askGemini(prompt, true);
        const result = JSON.parse(response);
        const riskLevel = result.risk?.toLowerCase().trim();

        // Validate response
        if (Object.values(RISK_LEVELS).includes(riskLevel)) {
            return riskLevel;
        }

        // Default to medium if uncertain
        return RISK_LEVELS.MEDIUM;
    } catch (error) {
        console.error('Risk classification error:', error);
        // Default to medium risk if classification fails
        return RISK_LEVELS.MEDIUM;
    }
}

/**
 * Get risk metadata for a given risk level
 * @param {string} riskLevel - Risk level (low, medium, high)
 * @returns {object} Risk metadata
 */
export function getRiskMetadata(riskLevel) {
    return RISK_METADATA[riskLevel] || RISK_METADATA.medium;
}

/**
 * Get disposal guidelines for a medicine
 * @param {string} riskLevel - Risk level
 * @returns {string} Disposal guidelines
 */
export function getDisposalGuidelines(riskLevel) {
    const metadata = getRiskMetadata(riskLevel);
    return metadata.disposalMethod;
}

/**
 * Check if medicine requires special disposal
 * @param {string} riskLevel - Risk level
 * @returns {boolean} True if requires special disposal
 */
export function requiresSpecialDisposal(riskLevel) {
    return riskLevel === RISK_LEVELS.MEDIUM || riskLevel === RISK_LEVELS.HIGH;
}
