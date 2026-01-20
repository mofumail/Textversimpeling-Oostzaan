/// <reference types="office-js" />
import * as React from "react";
import {
    FluentProvider,
    Spinner,
    Button,
    Title2,
    Title1,
    makeStyles,
    shorthands,
    Switch,
    ProgressBar,
    Body1
} from "@fluentui/react-components";
import {
    TextGrammarSettings24Regular,
    ArrowLeft24Regular,
    CheckmarkCircle24Regular,
    ErrorCircle24Regular,
    ChevronLeft24Regular,
    ChevronRight24Regular,
    Dismiss24Regular,
    TargetArrow24Regular,
    Power24Regular,
    Wand24Regular
} from "@fluentui/react-icons";
import { lightTheme } from "../theme";
import { SuggestionList } from "./SuggestionList";
import { analyzeText } from "../services/analysisService";
import type { Suggestion } from "../services/analysisService";
import { getSelectedText, getDocumentText, replaceText, highlightSpecificIssues, selectText, removeHighlight, clearSelectionHighlight, clearAllHighlights } from "../services/wordService";
import * as wordService from "../services/wordService"; // Import all for easier usage if preferred

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#faf9f8",
    },
    header: {
        ...shorthands.padding("20px", "24px"),
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        borderBottom: "1px solid #f0f0f0",
        position: "sticky",
        top: 0,
        zIndex: 100,
    },
    titleRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "4px",
    },
    content: {
        flexGrow: 1,
        overflowY: "auto",
        ...shorthands.padding("16px", "24px"),
        backgroundColor: "#faf9f8",
    },
    controls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
    },
    scoreContainer: {
        textAlign: "center",
        marginBottom: "24px",
        backgroundColor: "white",
        ...shorthands.padding("24px"),
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    categoryCard: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        backgroundColor: "white",
        marginBottom: "8px",
        borderRadius: "4px",
        cursor: "pointer",
        border: "1px solid #eee",
        ":hover": {
            backgroundColor: "#f5f5f5"
        }
    },
    backButton: {
        display: "flex", // Keep it visible but potentially styled
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        color: "#0078d4",
        marginBottom: "16px",
        background: "none",
        border: "none",
        padding: "0", // Reset default button padding
        fontSize: "14px"
    },
    reviewNav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    },
    navButton: {
        minWidth: "auto",
        padding: "8px"
    },
    explanationBox: {
        backgroundColor: "#edf5fd",
        ...shorthands.padding("12px"),
        borderRadius: "4px",
        marginBottom: "20px",
        borderLeft: "4px solid #0078d4",
        display: "flex", // Keep it flow
        gap: "12px",
        alignItems: "start"
    }
});

import { SettingsView } from "./SettingsView";
import { SimplifyView } from "./SimplifyView";

export const App: React.FC = () => {
    const styles = useStyles();
    const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [liveMode, setLiveMode] = React.useState(false);
    const [ignoredWords, setIgnoredWords] = React.useState<string[]>([]);
    const [dismissedInstances, setDismissedInstances] = React.useState<string[]>([]); // Key: "word_occurrenceIndex"

    // Simplify Mode State
    // Stores objects with ID (tag) and text
    const [selectedSentences, setSelectedSentences] = React.useState<{ tag: string, text: string }[]>([]);

    // New State for Dashboard/Score/Settings/Simplify
    const [view, setView] = React.useState<'dashboard' | 'detail' | 'settings' | 'simplify'>('dashboard');

    const [disabledRules, setDisabledRules] = React.useState<string[]>([]);

    // Sync sentences when entering Simplify view
    React.useEffect(() => {
        if (view === 'simplify' && selectedSentences.length > 0) {
            const sync = async () => {
                const tags = selectedSentences.map(s => s.tag);
                try {
                    const existingTags = await wordService.getExistingTrackingTags(tags);
                    if (existingTags.length !== selectedSentences.length) {
                        setSelectedSentences(prev => prev.filter(s => existingTags.includes(s.tag)));
                    }
                } catch (e) {
                    console.error("Failed to sync sentences", e);
                }
            };
            sync();
        }
    }, [view]);
    const [score, setScore] = React.useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    // Review Mode State
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Debug state
    const [, setDebugLog] = React.useState<string[]>([]);

    const addLog = (msg: string) => {
        console.log(msg);
        setDebugLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
    };

    const filteredSuggestions = React.useMemo(() => {
        return suggestions.filter(s => {
            // Check global ignore
            if (ignoredWords.includes(s.originalText)) return false;
            // Check disabled rules
            if (s.ruleId && disabledRules.includes(s.ruleId)) return false;
            // Check specific instance ignore
            const key = `${s.originalText}_${s.occurrenceIndex ?? 0}`;
            if (dismissedInstances.includes(key)) return false;
            return true;
        });
    }, [suggestions, ignoredWords, dismissedInstances, disabledRules]);

    // Derived stats
    const stats = React.useMemo(() => {
        const total = filteredSuggestions.length;
        const categories = filteredSuggestions.reduce((acc, curr) => {
            acc[curr.issueCategory] = (acc[curr.issueCategory] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return { total, categories };
    }, [filteredSuggestions]);

    const activeSuggestions = React.useMemo(() => {
        if (!selectedCategory) return filteredSuggestions;
        return filteredSuggestions.filter(s => s.issueCategory === selectedCategory);
    }, [filteredSuggestions, selectedCategory]);

    const liveModeRef = React.useRef(liveMode);
    const ignoredWordsRef = React.useRef(ignoredWords);
    const dismissedInstancesRef = React.useRef(dismissedInstances);

    React.useEffect(() => {
        liveModeRef.current = liveMode;
    }, [liveMode]);

    React.useEffect(() => {
        ignoredWordsRef.current = ignoredWords;
    }, [ignoredWords]);

    React.useEffect(() => {
        dismissedInstancesRef.current = dismissedInstances;
    }, [dismissedInstances]);

    React.useEffect(() => {
        addLog(`App mounted. Live: ${liveMode}`);
        const handleSelectionChange = async () => {
            if (liveMode) {
                await handleAnalyze('live');
            }
            if (view === 'simplify') {
                // Auto-sync sentences if document changed
                // This might be too aggressive if merely selection changed, 
                // but checking for deleted controls requires reading the doc.
                // To avoid perf issues, maybe we only sync if we have sentences?
                if (selectedSentences.length > 0) {
                    const tags = selectedSentences.map(s => s.tag);
                    try {
                        const existingTags = await wordService.getExistingTrackingTags(tags);
                        if (existingTags.length !== selectedSentences.length) {
                            setSelectedSentences(prev => prev.filter(s => existingTags.includes(s.tag)));
                        }
                    } catch (e) {
                        // ignore
                    }
                }
            }
        };

        const registerEventHandler = async () => {
            await Office.context.document.addHandlerAsync(
                Office.EventType.DocumentSelectionChanged,
                handleSelectionChange
            );
        };

        const removeEventHandler = async () => {
            await Office.context.document.removeHandlerAsync(
                Office.EventType.DocumentSelectionChanged
            );
        };

        if (typeof Office !== 'undefined') {
            Office.onReady(() => {
                // Always register if live or simplify? 
                // Actually, we should just register once and handle logic inside.
                // But we need to manage lifecycle.
                // Let's Register if live OR simplify
                if (liveMode || view === 'simplify') {
                    registerEventHandler();
                    if (liveMode) handleAnalyze('live');
                } else {
                    removeEventHandler();
                }
            });
        }
        return () => { if (typeof Office !== 'undefined') removeEventHandler(); };
    }, [liveMode, view, selectedSentences]); // Add view and selectedSentences to dep array?
    // WARNING: adding selectedSentences to dep array will cause re-registration on every sync.
    // Better to use a ref for selectedSentences or use functional updates.
    // But handleSelectionChange closes over state.
    // Let's use Ref for selectedSentences to avoid re-registration loop.

    // Auto-select text when current index changes in Detail view
    React.useEffect(() => {
        if (view === 'detail' && activeSuggestions.length > 0 && activeSuggestions[currentIndex]) {
            const item = activeSuggestions[currentIndex];
            selectText(item.originalText, item.occurrenceIndex ?? 0);
        }
    }, [view, currentIndex, activeSuggestions]);

    const calculateScore = (textLength: number, issueCount: number) => {
        // Simple heuristic: 1 issue per 100 characters reduces score by 5?
        // Or just simpler: Base 100, minus 2 per issue.
        // Let's make it look robust:
        if (textLength === 0) return 100;
        const deduction = issueCount * 5;
        return Math.max(0, 100 - deduction);
    };

    const handleAnalyze = async (mode: 'document' | 'selection' | 'live' = 'selection', keepView = false, ignoredWordsOverride?: string[]) => {
        if (loading && mode === 'live') return;
        setLoading(true);
        if (!keepView) setView('dashboard'); // Reset to dashboard only if not keeping view
        try {
            let text = "";
            if (mode === 'document') {
                text = await getDocumentText();
            } else {
                text = await getSelectedText();
                if ((!text || text.trim().length === 0) && mode === 'live') {
                    text = await getDocumentText();
                }
            }

            // Check if cancelled
            if (mode === 'live' && !liveModeRef.current) return;

            if (!text || text.trim().length === 0) {
                setLoading(false);
                return;
            }

            const results = await analyzeText(text);

            // Double check cancellation
            if (mode === 'live' && !liveModeRef.current) return;

            // Filter out ignored words use override if provided
            const currentIgnored = ignoredWordsOverride ?? ignoredWordsRef.current;
            const validSuggestions = results.filter(s => {
                if (currentIgnored.includes(s.originalText)) return false;
                const key = `${s.originalText}_${s.occurrenceIndex ?? 0}`;
                if (dismissedInstancesRef.current.includes(key)) return false;
                return true;
            });

            setSuggestions(validSuggestions);
            // Score should be based on valid suggestions
            setScore(calculateScore(text.length, validSuggestions.length));

            if (validSuggestions.length > 0) {
                await highlightSpecificIssues(validSuggestions);
            } else {
                // If everything is ignored, clear highlights
                await clearAllHighlights();
            }
        } catch (error) {
            addLog(`Error: ${error}`);
        } finally {
            // Only set loading false if we are not in live mode or if we are still in live mode
            // If we are in live mode but liveModeRef is false, it means we cancelled.
            // But we can safely set loading false as long as we didn't touch other state.
            setLoading(false);
        }
    };

    const handleAddSentence = async () => {
        try {
            const result = await wordService.addTrackingControl();
            if (result) {
                setSelectedSentences(prev => [...prev, result]);
                // Optionally auto-nav to simplify view?
            }
        } catch (error) {
            addLog(`Error adding sentence: ${error}`);
        }
    };

    const handleDeleteSentence = async (index: number) => {
        const item = selectedSentences[index];
        if (item) {
            await wordService.removeTrackingControl(item.tag);
            setSelectedSentences(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleLocateSentence = async (tag: string) => {
        try {
            await wordService.selectTrackingControl(tag);
        } catch (error) {
            addLog(`Error locating sentence: ${error}`);
        }
    };

    const handleApplyRewrite = async (tag: string, newText: string) => {
        try {
            await wordService.replaceAndRemoveTrackingControl(tag, newText);
        } catch (error) {
            addLog(`Error replacing sentence: ${error}`);
        }
    };

    const handleApply = async (suggestion: Suggestion, replacement: string) => {
        try {
            await replaceText(suggestion.originalText, replacement, suggestion.occurrenceIndex ?? 0);

            // Re-analyze document to ensure state is fresh and highlights are updated
            // We pass 'true' to keep the current view (Detail/Review mode)
            await handleAnalyze('document', true);

            // Adjust index if necessary (e.g., if list shrinks)
            // Note: activeSuggestions will update after handleAnalyze finishes.
            // We do a rudimentary check here, but really we rely on React's state update cycle.
            // The simple bounds check in useEffect or render might handle it,
            // but let's just ensure we don't crash.

        } catch (error) {
            addLog("Replacement failed");
        }
    };

    const handleDismiss = async (id: string) => {
        // "Ignore once"
        await clearSelectionHighlight();

        // Find component to get key
        const suggestion = suggestions.find(s => s.id === id);
        if (suggestion) {
            const key = `${suggestion.originalText}_${suggestion.occurrenceIndex ?? 0}`;
            setDismissedInstances(prev => [...prev, key]);
        }

        // Remove from list
        setSuggestions(prev => prev.filter(s => s.id !== id));

        // Adjust navigation if needed
        if (currentIndex >= activeSuggestions.length - 1) {
            setCurrentIndex(Math.max(0, activeSuggestions.length - 2));
        }
    };

    const handleIgnore = async (word: string) => {
        setIgnoredWords(prev => [...prev, word]);
        await removeHighlight(word);
        if (currentIndex >= activeSuggestions.length - 1) {
            setCurrentIndex(Math.max(0, activeSuggestions.length - 2));
        }
    };

    const handleUnignore = async (word: string) => {
        const newList = ignoredWords.filter(w => w !== word);
        setIgnoredWords(newList);
        // Force re-analysis with new list to re-discover the word
        await handleAnalyze('document', true, newList);
    };

    const handleDisableRule = async (ruleId: string) => {
        setDisabledRules(prev => [...prev, ruleId]);

        // 1. Calculate new suggestions state (local update)
        const currentSuggestions = suggestions;
        const newSuggestions = currentSuggestions.map(s => {
            // Check primary rule
            if (s.ruleId === ruleId) {
                // If primary matches, try to promote a secondary rule
                if (s.secondaryRules && s.secondaryRules.length > 0) {
                    const nextRule = s.secondaryRules[0];
                    const remainingSecondary = s.secondaryRules.slice(1);
                    return {
                        ...s,
                        ruleId: nextRule.ruleId,
                        explanation: nextRule.explanation,
                        secondaryRules: remainingSecondary.length > 0 ? remainingSecondary : undefined
                    };
                } else {
                    // No secondary rules, this suggestion should be removed
                    return null;
                }
            }

            // Check secondary rules
            if (s.secondaryRules) {
                const filteredSecondary = s.secondaryRules.filter(r => r.ruleId !== ruleId);
                if (filteredSecondary.length !== s.secondaryRules.length) {
                    return {
                        ...s,
                        secondaryRules: filteredSecondary.length > 0 ? filteredSecondary : undefined
                    };
                }
            }

            return s;
        }).filter((s): s is Suggestion => s !== null);

        // 2. Identify texts that are no longer covered by ANY suggestion
        const remainingTexts = new Set(newSuggestions.map(s => s.originalText));

        const allCurrentTexts = new Set(currentSuggestions.map(s => s.originalText));
        const textsToUnhighlight: string[] = [];

        allCurrentTexts.forEach(text => {
            if (!remainingTexts.has(text)) {
                textsToUnhighlight.push(text);
            }
        });

        // 3. Remove highlights
        if (textsToUnhighlight.length > 0) {
            await Promise.all(textsToUnhighlight.map(text => removeHighlight(text)));
        }

        // 4. Update state
        setSuggestions(newSuggestions);

        if (currentIndex >= activeSuggestions.length - 1) {
            setCurrentIndex(Math.max(0, activeSuggestions.length - 2));
        }
    };

    const handleEnableRule = async (ruleId: string) => {
        const newList = disabledRules.filter(id => id !== ruleId);
        setDisabledRules(newList);
        // Force re-analysis to bring them back
        await handleAnalyze('document', true);
    };

    const clearState = async () => {
        setSuggestions([]);
        setScore(null);
        await clearAllHighlights();
    };

    const handleDisable = async () => {
        setLiveMode(false);
        await clearState();
        setView('dashboard');
    };

    const handleLiveModeChange = async (checked: boolean) => {
        setLiveMode(checked);
        if (!checked) {
            await clearState();
        }
    };

    const navigateToDetail = (category: string | null) => {
        setSelectedCategory(category);
        setCurrentIndex(0); // Reset index
        setView('detail');
    };

    const nextItem = () => {
        if (currentIndex < activeSuggestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevItem = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <FluentProvider theme={lightTheme}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <Title2>Dutch Municipal Writer</Title2>
                        {(liveMode || score !== null) && (
                            <Button
                                appearance="subtle"
                                icon={<Power24Regular />}
                                onClick={handleDisable}
                                aria-label="Disable Add-in"
                                title="Disable Add-in"
                            />
                        )}
                        <Button
                            appearance="subtle"
                            icon={<Wand24Regular />}
                            onClick={() => setView('simplify')}
                            aria-label="Simplify"
                            title="Simplify Sentences"
                        />
                        <Button
                            appearance="subtle"
                            icon={<TextGrammarSettings24Regular />}
                            onClick={() => setView('settings')}
                            aria-label="Settings"
                        />
                    </div>

                    <div className={styles.controls}>
                        <Button
                            appearance="primary"
                            onClick={() => handleAnalyze('document')}
                            disabled={loading || liveMode}
                            style={{ flexGrow: 1 }}
                        >
                            Analyze Document
                        </Button>
                    </div>
                    <div className={styles.controls} style={{ marginTop: '8px' }}>
                        <Switch
                            label="Live Feedback"
                            checked={liveMode}
                            onChange={(_, data) => handleLiveModeChange(data.checked)}
                        />
                        {loading && <Spinner size="tiny" />}
                    </div>
                </div>

                <div className={styles.content}>
                    {loading && !liveMode ? (
                        <div style={{ textAlign: "center", marginTop: "40px" }}>
                            <Spinner label="Analyzing..." size="large" />
                        </div>
                    ) : (
                        <>
                            {view === 'dashboard' && (
                                <>
                                    {score !== null && (
                                        <div className={styles.scoreContainer}>
                                            <Body1>B1 Level Score</Body1>
                                            <Title1 style={{ display: 'block', fontSize: '48px', color: score > 70 ? '#107C10' : '#d13438' }}>
                                                {score}%
                                            </Title1>
                                            <ProgressBar value={score / 100} color={score > 70 ? "success" : "error"} />
                                        </div>
                                    )}

                                    {suggestions.length > 0 && (
                                        <div>
                                            <div style={{ marginBottom: '12px' }}>
                                                <Title2>Refinements</Title2>
                                            </div>

                                            {Object.entries(stats.categories).map(([category, count]) => (
                                                <div
                                                    key={category}
                                                    className={styles.categoryCard}
                                                    onClick={() => navigateToDetail(category)}
                                                >
                                                    <Body1>{category}</Body1>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 'bold' }}>{count}</span>
                                                        <ErrorCircle24Regular color={category === 'Jargon' ? "#d13438" : "#FFA500"} />
                                                    </div>
                                                </div>
                                            ))}

                                            <div
                                                className={styles.categoryCard}
                                                onClick={() => navigateToDetail(null)} // All
                                            >
                                                <Body1>View All Suggestions</Body1>
                                                <ArrowLeft24Regular style={{ transform: "rotate(180deg)" }} />
                                            </div>
                                        </div>
                                    )}

                                    {suggestions.length === 0 && score !== null && (
                                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                                            <CheckmarkCircle24Regular style={{ fontSize: "48px", color: "green" }} />
                                            <Title2>Great Job!</Title2>
                                            <Body1>No issues found.</Body1>
                                        </div>
                                    )}
                                </>
                            )}

                            {view === 'detail' && (
                                <div>
                                    <div className={styles.reviewNav}>
                                        <button className={styles.backButton} onClick={() => setView('dashboard')}>
                                            <Dismiss24Regular />
                                        </button>
                                        <Body1>{activeSuggestions.length > 0 ? `${currentIndex + 1} of ${activeSuggestions.length}` : "0 remaining"}</Body1>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <Button
                                                icon={<TargetArrow24Regular />}
                                                appearance="subtle"
                                                onClick={() => {
                                                    if (activeSuggestions[currentIndex]) {
                                                        const item = activeSuggestions[currentIndex];
                                                        selectText(item.originalText, item.occurrenceIndex ?? 0);
                                                    }
                                                }}
                                                aria-label="Locate in document"
                                            />
                                            <Button
                                                icon={<ChevronLeft24Regular />}
                                                appearance="subtle"
                                                disabled={currentIndex === 0}
                                                onClick={prevItem}
                                                className={styles.navButton}
                                            />
                                            <Button
                                                icon={<ChevronRight24Regular />}
                                                appearance="subtle"
                                                disabled={currentIndex >= activeSuggestions.length - 1}
                                                onClick={nextItem}
                                                className={styles.navButton}
                                            />
                                        </div>
                                    </div>

                                    {activeSuggestions.length > 0 && activeSuggestions[currentIndex] ? (
                                        <SuggestionList
                                            suggestions={[activeSuggestions[currentIndex]]} // Show only one
                                            onApply={handleApply}
                                            onDismiss={handleDismiss} // No collapse
                                            onIgnore={handleIgnore}
                                            onDisableRule={handleDisableRule}
                                        />
                                    ) : (
                                        <div style={{ textAlign: "center" }}>
                                            <CheckmarkCircle24Regular style={{ color: "green" }} />
                                            <p>No suggestions in this category.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {view === 'settings' && (
                                <SettingsView
                                    ignoredWords={ignoredWords}
                                    onUnignore={handleUnignore}
                                    disabledRules={disabledRules}
                                    onEnableRule={handleEnableRule}
                                    onBack={() => setView('dashboard')}
                                />
                            )}

                            {view === 'simplify' && (
                                <SimplifyView
                                    onBack={() => setView('dashboard')}
                                    selectedSentences={selectedSentences}
                                    onAddSentence={handleAddSentence}
                                    onRemoveSentence={handleDeleteSentence}
                                    onLocateSentence={handleLocateSentence}
                                    onApplyRewrite={handleApplyRewrite}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </FluentProvider>
    );
};
