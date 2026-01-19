import * as React from "react";
import {
    Button,
    Title2,
    Body1,
    makeStyles,
    shorthands,
    Spinner,
    RadioGroup,
    Radio
} from "@fluentui/react-components";
import {
    Dismiss24Regular,
    TargetArrow24Regular,
    Delete24Regular,
    Wand24Regular,
    Info24Regular,
    CheckmarkCircle24Regular
} from "@fluentui/react-icons";
import { replaceText } from "../services/wordService";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    reviewNav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    },
    backButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        color: "#0078d4",
        marginBottom: "0",
        background: "none",
        border: "none",
        padding: "0",
        fontSize: "14px"
    },
    explanationBox: {
        backgroundColor: "#edf5fd",
        ...shorthands.padding("12px"),
        borderRadius: "4px",
        borderLeft: "4px solid #0078d4",
        display: "flex",
        gap: "12px",
        alignItems: "start" as "start" | "flex-start" | "center" | "baseline" | "stretch" | "flex-end" | "end" | "normal" | "self-start" | "self-end"
    },
    card: {
        backgroundColor: "white",
        ...shorthands.padding("16px"),
        borderRadius: "4px",
        border: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    optionsContainer: {
        marginTop: "12px",
        paddingTop: "12px",
        borderTop: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    optionCard: {
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #e0e0e0",
        cursor: "pointer",
        ":hover": {
            backgroundColor: "#f5f5f5"
        }
    },
    selectedOption: {
        borderColor: "#0078d4",
        backgroundColor: "#eff6fc"
    }
});

interface SimplifyViewProps {
    onBack: () => void;
    selectedSentences: string[];
    onAddSentence: () => void;
    onRemoveSentence: (index: number) => void;
    // We might need to know occurrence index if we want precise replacement, 
    // but for now relying on text search as per current architecture? 
    // The previous implementation stored just strings. 
    // Real implementation should probably store location info. 
    // Text search is risky if duplicates exist. 
    // Proceeding with text search for now as per previous impl.
}

interface RewriteOptions {
    [index: number]: string[];
}

export const SimplifyView: React.FC<SimplifyViewProps> = ({
    onBack,
    selectedSentences,
    onAddSentence,
    onRemoveSentence
}) => {
    const styles = useStyles();
    const [rewrites, setRewrites] = React.useState<RewriteOptions>({});
    const [loadingIndices, setLoadingIndices] = React.useState<number[]>([]);
    const [selectedOption, setSelectedOption] = React.useState<Record<number, string>>({}); // valid option selected per sentence
    const [completedIndices, setCompletedIndices] = React.useState<number[]>([]);

    const handleGenerate = async (index: number) => {
        if (loadingIndices.includes(index)) return;
        setLoadingIndices(prev => [...prev, index]);

        // Mock API call
        setTimeout(() => {
            const original = selectedSentences[index];
            const mockOptions = [
                `Simplified: ${original.substring(0, Math.min(original.length, 20))}... (Option A)`,
                `Concise: ${original.substring(0, Math.min(original.length, 20))}... (Option B)`,
                `Professional: ${original.substring(0, Math.min(original.length, 20))}... (Option C)`,
            ];
            setRewrites(prev => ({ ...prev, [index]: mockOptions }));
            setLoadingIndices(prev => prev.filter(i => i !== index));
        }, 1500);
    };

    const handleApply = async (index: number) => {
        const replacement = selectedOption[index];
        const original = selectedSentences[index];
        if (!replacement) return;

        try {
            // Using 0 as occurrence index is dangerous if multiple same sentences exist.
            // Ideally we tracked indices. For now, we assume 0 or "Simplify" user flow grabs selection carefully.
            // But `selectedSentences` is just strings.
            // Let's try to find it.
            await replaceText(original, replacement, 0);

            // Mark as done
            setCompletedIndices(prev => [...prev, index]);
            // Maybe remove structure?
            // onRemoveSentence(index); // Optional: Auto remove? User might want to see history.
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.reviewNav}>
                <button className={styles.backButton} onClick={onBack}>
                    <Dismiss24Regular />
                </button>
                <Title2>Simplify Sentences</Title2>
                <div style={{ width: '24px' }}></div>
            </div>

            <div className={styles.explanationBox}>
                <Info24Regular style={{ color: "#0078d4", marginTop: "2px" }} />
                <Body1>
                    Select sentences in your document that contain jargon or are difficult to understand. Generate and apply simplified versions below.
                </Body1>
            </div>

            <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
                <Button
                    appearance="primary"
                    onClick={onAddSentence}
                    icon={<TargetArrow24Regular />}
                >
                    Add Selected Text
                </Button>
            </div>

            {selectedSentences.length > 0 ? (
                selectedSentences.map((sentence, index) => {
                    if (completedIndices.includes(index)) return null; // Hide completed for now? Or show success state.

                    return (
                        <div key={index} className={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                                <Body1 style={{ fontStyle: "italic", color: "#333" }}>"{sentence}"</Body1>
                                <Button
                                    appearance="transparent"
                                    icon={<Delete24Regular />}
                                    onClick={() => onRemoveSentence(index)}
                                    aria-label="Remove"
                                />
                            </div>

                            {!rewrites[index] && (
                                <Button
                                    icon={<Wand24Regular />}
                                    onClick={() => handleGenerate(index)}
                                    disabled={loadingIndices.includes(index)}
                                >
                                    {loadingIndices.includes(index) ? "Generating..." : "Simplify"}
                                </Button>
                            )}

                            {loadingIndices.includes(index) && <Spinner size="tiny" />}

                            {rewrites[index] && (
                                <div className={styles.optionsContainer}>
                                    <Body1 style={{ fontWeight: 600 }}>Select an option:</Body1>
                                    <RadioGroup
                                        value={selectedOption[index]}
                                        onChange={(_, data) => setSelectedOption(prev => ({ ...prev, [index]: data.value }))}
                                    >
                                        {rewrites[index].map((opt, i) => (
                                            <Radio
                                                key={i}
                                                value={opt}
                                                label={opt}
                                                style={{ marginBottom: '4px', padding: '4px', border: selectedOption[index] === opt ? "1px solid #0078d4" : "1px solid transparent", borderRadius: "4px" }}
                                            />
                                        ))}
                                    </RadioGroup>

                                    <Button
                                        appearance="primary"
                                        disabled={!selectedOption[index]}
                                        onClick={() => handleApply(index)}
                                        icon={<CheckmarkCircle24Regular />}
                                    >
                                        Apply Replacement
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
                    <Wand24Regular style={{ fontSize: "40px", marginBottom: "10px", color: "#ccc" }} />
                    <Body1>No sentences added yet.</Body1>
                </div>
            )}
        </div>
    );
};
