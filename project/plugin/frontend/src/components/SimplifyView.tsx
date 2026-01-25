import * as React from "react";
import {
    Button,
    Title2,
    Body1,
    makeStyles,
    shorthands,
    Spinner
} from "@fluentui/react-components";
import {
    Dismiss24Regular,
    TargetArrow24Regular,
    Delete24Regular,
    Wand24Regular,
    Info24Regular,
    CheckmarkCircle24Regular,
    ChevronLeft24Regular,
    ChevronRight24Regular,
    ArrowCounterclockwise24Regular
} from "@fluentui/react-icons";
import { generateRewrites } from "../services/rewriteService";

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
        ...shorthands.borderColor("#0078d4"),
        backgroundColor: "#eff6fc"
    }
});

interface SimplifyViewProps {
    onBack: () => void;
    selectedSentences: { tag: string, text: string }[];
    onAddSentence: () => void;
    onRemoveSentence: (index: number) => void;
    onLocateSentence: (tag: string) => void;
    onApplyRewrite: (tag: string, newText: string) => Promise<void>;
}

interface RewriteOptions {
    [tag: string]: string;
}

export const SimplifyView: React.FC<SimplifyViewProps> = ({
    onBack,
    selectedSentences,
    onAddSentence,
    onRemoveSentence,
    onLocateSentence,
    onApplyRewrite
}) => {
    const styles = useStyles();
    const [rewrites, setRewrites] = React.useState<RewriteOptions>({});
    const [loadingTags, setLoadingTags] = React.useState<string[]>([]);
    // selectedOption no longer needed for single choice
    const [error, setError] = React.useState<string | null>(null);

    // Detail View State
    const [viewMode, setViewMode] = React.useState<'list' | 'detail'>('list');
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Auto-select when entering detail
    React.useEffect(() => {
        if (viewMode === 'detail' && selectedSentences[currentIndex]) {
            onLocateSentence(selectedSentences[currentIndex].tag);
        }
    }, [viewMode, currentIndex, selectedSentences]);

    const handleGenerate = async (item: { tag: string, text: string }) => {
        if (loadingTags.includes(item.tag)) return;
        setLoadingTags(prev => [...prev, item.tag]);
        setError(null);

        try {
            const suggestion = await generateRewrites(item.text);
            setRewrites(prev => ({ ...prev, [item.tag]: suggestion }));
            setLoadingTags(prev => prev.filter(t => t !== item.tag));
        } catch (error) {
            console.error("Error generating rewrites:", error);
            setError(`Failed to generate: ${(error as Error).message}`);
            setLoadingTags(prev => prev.filter(t => t !== item.tag));
        }
    };

    const handleApply = async (tag: string) => {
        const replacement = rewrites[tag]; // Direct lookup
        if (!replacement) return;
        try {
            await onApplyRewrite(tag, replacement);

            // Auto-delete logic
            onRemoveSentence(currentIndex);
            // After removal, check navigation
            if (selectedSentences.length <= 1) {
                // Was the last one
                setViewMode('list');
            } else if (currentIndex >= selectedSentences.length - 1) {
                // Was at end, move back
                setCurrentIndex(currentIndex - 1);
            }
            // else stay at current index (which is now the next item)

        } catch (error) {
            console.error(error);
            setError("Failed to apply replacement.");
        }
    };

    const navigateToDetail = (index: number) => {
        setCurrentIndex(index);
        setViewMode('detail');
    };

    const nextItem = () => {
        if (currentIndex < selectedSentences.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevItem = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className={styles.container}>
            {viewMode === 'list' && (
                <>
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
                            Select sentences to simplify. They will be tracked even if you edit the document.
                        </Body1>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <Button
                            appearance="primary"
                            onClick={onAddSentence}
                            icon={<TargetArrow24Regular />}
                        >
                            Add Selected Text
                        </Button>
                    </div>

                    {selectedSentences.length === 0 ? (
                        <div style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
                            <Wand24Regular style={{ fontSize: "40px", marginBottom: "10px", color: "#ccc" }} />
                            <Body1>No sentences added yet.</Body1>
                        </div>
                    ) : (
                        <div
                            className={styles.card}
                            style={{ cursor: 'pointer', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => navigateToDetail(0)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Body1 style={{ fontWeight: 600 }}>Sentences to Simplify</Body1>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Body1 style={{ fontWeight: 'bold' }}>{selectedSentences.length}</Body1>
                                <ChevronRight24Regular style={{ color: "#0078d4" }} />
                            </div>
                        </div>
                    )}
                </>
            )}

            {viewMode === 'detail' && selectedSentences[currentIndex] && (
                <>
                    <div className={styles.reviewNav}>
                        <button className={styles.backButton} onClick={() => setViewMode('list')}>
                            <Dismiss24Regular />
                        </button>
                        <Body1>{currentIndex + 1} of {selectedSentences.length}</Body1>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <Button
                                icon={<TargetArrow24Regular />}
                                appearance="subtle"
                                onClick={() => onLocateSentence(selectedSentences[currentIndex].tag)}
                                aria-label="Locate"
                            />
                            <Button
                                icon={<Delete24Regular />}
                                appearance="subtle"
                                onClick={() => {
                                    onRemoveSentence(currentIndex);
                                    if (selectedSentences.length <= 1) setViewMode('list');
                                    else if (currentIndex >= selectedSentences.length - 1) setCurrentIndex(currentIndex - 1);
                                }}
                                aria-label="Remove"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <Button
                                icon={<ChevronLeft24Regular />} // Correcting order/grouping
                                appearance="subtle"
                                disabled={currentIndex === 0}
                                onClick={prevItem}
                            />
                            <Button
                                icon={<ChevronRight24Regular />}
                                appearance="subtle"
                                disabled={currentIndex >= selectedSentences.length - 1}
                                onClick={nextItem}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: "8px", backgroundColor: "#fde7e9", color: "#a80000", borderRadius: "4px", border: "1px solid #d13438", marginBottom: "8px" }}>
                            {error}
                        </div>
                    )}

                    <div className={styles.card}>
                        <Body1 style={{ fontStyle: "italic", color: "#333", marginBottom: "12px", display: "block" }}>
                            "{selectedSentences[currentIndex].text}"
                        </Body1>

                        {(() => {
                            const item = selectedSentences[currentIndex];
                            const suggestion = rewrites[item.tag]; // Now a string (or array of 1, but we treat as string for simple view?)
                            // Wait, rewrites state type needs update or we cast.
                            // Let's assume rewrites is Record<string, string> now.
                            // I need to update state def too in next tool call or do multireplace?
                            // I'll do multireplace to be safe.
                            const isLoading = loadingTags.includes(item.tag);

                            if (!suggestion) {
                                return (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <Button
                                            appearance="primary"
                                            icon={<Wand24Regular />}
                                            onClick={() => handleGenerate(item)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Generating..." : "Simplify this sentence"}
                                        </Button>
                                    </div>
                                );
                            }

                            return (
                                <div className={styles.optionsContainer}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <Body1 style={{ fontWeight: 600 }}>Suggestion:</Body1>
                                        <Button
                                            appearance="subtle"
                                            icon={<ArrowCounterclockwise24Regular />}
                                            onClick={() => handleGenerate(item)}
                                            disabled={isLoading}
                                            aria-label="Redo"
                                            title="Regenerate"
                                        />
                                    </div>
                                    <div className={styles.optionCard} style={{ marginBottom: '16px', backgroundColor: '#f0f0f0', cursor: 'default' }}>
                                        <Body1>{suggestion}</Body1>
                                    </div>

                                    <Button
                                        appearance="primary"
                                        onClick={() => handleApply(item.tag)}
                                        icon={<CheckmarkCircle24Regular />}
                                        style={{ width: '100%' }}
                                    >
                                        Replace & Remove
                                    </Button>
                                </div>
                            );
                        })()}

                        {(loadingTags.includes(selectedSentences[currentIndex].tag)) && <Spinner size="tiny" />}
                    </div>
                </>
            )}
        </div>
    );
};
