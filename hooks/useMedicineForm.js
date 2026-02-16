import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getMedicineTips } from '../services/aiService';
import { medicineService } from '../services/medicineService';

export function useMedicineForm(initialMedicine, scannedData) {
    const router = useRouter();

    // Form State
    const [name, setName] = useState(initialMedicine?.name || '');
    const [dosage, setDosage] = useState(initialMedicine?.dosage || '');
    const [frequency, setFrequency] = useState(initialMedicine?.frequency || 'Daily');
    const [timesPerDay, setTimesPerDay] = useState(initialMedicine?.timesPerDay || 1);
    const [doseTimes, setDoseTimes] = useState([new Date()]);
    const [expiryDate, setExpiryDate] = useState(initialMedicine?.expiryDate ? new Date(initialMedicine.expiryDate) : new Date());
    const [instructions, setInstructions] = useState(initialMedicine?.instructions || '');
    const [category, setCategory] = useState(initialMedicine?.category || 'General');
    const [customCategory, setCustomCategory] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(initialMedicine?.icon || 'medical');
    const [selectedColor, setSelectedColor] = useState(initialMedicine?.color || '#FF8C42');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingTips, setIsGeneratingTips] = useState(false);
    const [confidenceScore, setConfidenceScore] = useState(100);
    const [isEstimated, setIsEstimated] = useState(false);

    // Initial parsing of scanned/initial data
    useEffect(() => {
        if (scannedData) {
            try {
                const data = typeof scannedData === 'string' ? JSON.parse(scannedData) : scannedData;
                if (data.name) setName(data.name);
                if (data.dosage) setDosage(data.dosage);
                if (data.expiry) setExpiryDate(new Date(data.expiry));
                if (data.instructions) setInstructions(data.instructions);
                if (data.confidenceScore) setConfidenceScore(data.confidenceScore);
                if (data.isEstimated) setIsEstimated(true);
                if (data.category) {
                    const validCategories = ['General', 'Painkillers', 'Antibiotics', 'Supplements', 'Vitamins', 'Chronic', 'First Aid'];
                    if (validCategories.includes(data.category)) {
                        setCategory(data.category);
                    } else {
                        setCategory('Custom');
                        setCustomCategory(data.category);
                    }
                }
                if (data.frequency) setFrequency(data.frequency);
                if (data.timesPerDay) {
                    setTimesPerDay(data.timesPerDay);
                    const newTimes = [];
                    for (let i = 0; i < data.timesPerDay; i++) {
                        // Spread doses throughout the day roughly
                        const t = new Date();
                        t.setHours(8 + (i * 4), 0, 0, 0);
                        newTimes.push(t);
                    }
                    setDoseTimes(newTimes);
                }
            } catch (e) {
                console.error("Error parsing scanned data:", e);
            }
        }
    }, [scannedData]);

    const handleTimesChange = (num) => {
        setTimesPerDay(num);
        const newTimes = [...doseTimes];
        if (num > doseTimes.length) {
            for (let i = doseTimes.length; i < num; i++) {
                const t = new Date();
                t.setHours(8 + (i * 4), 0, 0, 0);
                newTimes.push(t);
            }
        } else {
            newTimes.splice(num);
        }
        setDoseTimes(newTimes);
    };

    const handleGetTips = async () => {
        if (!name.trim()) return Alert.alert('Error', 'Enter a name first');
        setIsGeneratingTips(true);
        try {
            const tips = await getMedicineTips(name.trim(), instructions);
            setInstructions(tips);
        } finally {
            setIsGeneratingTips(false);
        }
    };

    const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    };

    const handleSave = async (isEdit, bypassInteractions = false) => {
        if (!name.trim() || !dosage.trim()) {
            Alert.alert('Error', 'Please fill in name and dosage');
            return;
        }

        setIsLoading(true);
        try {
            const medicineData = {
                id: initialMedicine?.id,
                name: name.trim(),
                dosage: dosage.trim(),
                frequency,
                category: category === 'Custom' ? customCategory.trim() : category,
                timesPerDay: frequency === 'Daily' ? timesPerDay : 1,
                times: frequency === 'Daily' ? doseTimes.map(t => formatTime(t)) : [],
                icon: selectedIcon,
                color: selectedColor,
                expiryDate: expiryDate.toISOString(),
                instructions: instructions.trim(),
                status: 'Active',
                bypassInteractions
            };

            const result = await medicineService.saveMedicine(medicineData, isEdit);

            if (result.needsConfirmation) {
                setIsLoading(false);
                Alert.alert(
                    'Drug Interaction Warning',
                    result.interaction.warningMessage + '\n\n' + result.interaction.reason + '\n\nDo you still want to add this medicine?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Add Anyway', style: 'destructive', onPress: () => handleSave(isEdit, true) }
                    ]
                );
                return;
            }

            Alert.alert('Success', `Medicine ${isEdit ? 'updated' : 'added'} successfully`);
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save medicine');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form: {
            name, setName,
            dosage, setDosage,
            frequency, setFrequency,
            timesPerDay, setTimesPerDay,
            doseTimes, setDoseTimes,
            expiryDate, setExpiryDate,
            instructions, setInstructions,
            category, setCategory,
            customCategory, setCustomCategory,
            selectedIcon, setSelectedIcon,
            selectedColor, setSelectedColor,
        },
        ui: {
            isLoading,
            isGeneratingTips,
            confidenceScore, setConfidenceScore,
            isEstimated,
        },
        actions: {
            handleTimesChange,
            handleGetTips,
            handleSave,
            formatTime
        }
    };
}
