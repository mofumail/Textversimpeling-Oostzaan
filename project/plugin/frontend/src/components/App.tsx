/// <reference types="office-js" />
import * as React from "react";
import {
    FluentProvider,
    Spinner,
    Button,
    Title2,
    makeStyles,
    shorthands,
    Switch,
} from "@fluentui/react-components";
import { TextGrammarSettings24Regular } from "@fluentui/react-icons";
import { lightTheme } from "../theme";
import { SuggestionList } from "./SuggestionList";
import { analyzeText } from "../services/analysisService";
import type { Suggestion } from "../services/analysisService";
import { getSelectedText, getDocumentText, getCurrentParagraphText, replaceText, highlightIssues } from "../services/wordService";

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
});

export const App: React.FC = () => {
    const styles = useStyles();
    const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [liveMode, setLiveMode] = React.useState(false);
    // Debug state
    const [debugLog, setDebugLog] = React.useState<string[]>([]);

    const addLog = (msg: string) => {
        console.log(msg);
        setDebugLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20)); // Keep last 20
    };

    // Initial load and Event Handlers
    React.useEffect(() => {
        addLog(`App mounted. Live: ${liveMode}`);

        const registerEventHandler = async () => {
            addLog("Registering DocumentSelectionChanged");
            if (liveMode) {
                await Office.context.document.addHandlerAsync(
                    Office.EventType.DocumentSelectionChanged,
                    () => {
                        handleAnalyze('live');
                    }
                );
            }
        };

        const removeEventHandler = async () => {
            addLog("Removing event handler");
            await Office.context.document.removeHandlerAsync(
                Office.EventType.DocumentSelectionChanged
            );
        };

        if (typeof Office !== 'undefined') {
            Office.onReady(() => {
                addLog("Office.onReady fired");
                if (liveMode) {
                    registerEventHandler();
                } else {
                    removeEventHandler();
                }
            });
        }

        return () => {
            addLog("Cleanup effect");
            if (typeof Office !== 'undefined') {
                removeEventHandler();
            }
        };
    }, [liveMode]);

    const handleAnalyze = async (mode: 'document' | 'selection' | 'live' = 'selection') => {
        addLog(`handleAnalyze called. Mode: ${mode}`);
        if (loading && mode === 'live') {
            return;
        }

        setLoading(true);
        try {
            let text = "";
            if (mode === 'document') {
                addLog("Getting full document text...");
                text = await getDocumentText();
            } else {
                addLog("Getting selected text...");
                text = await getSelectedText();
                if ((!text || text.trim().length === 0) && mode === 'live') {
                    addLog("Selection empty, checking paragraph...");
                    text = await getCurrentParagraphText();
                }
            }

            addLog(`Text length: ${text ? text.length : 0}`);

            if (!text || text.trim().length === 0) {
                if (mode === 'document') {
                    addLog("Document empty.");
                } else {
                    addLog("No text, aborting.");
                    setLoading(false);
                    return;
                }
            }

            addLog("Analyzing...");
            const results = await analyzeText(text);
            addLog(`Found ${results.length} suggestions`);
            setSuggestions(results);

            // Highlight
            if (results.length > 0) {
                const textsToHighlight = results.map(s => s.originalText);
                addLog(`Highlighting ${textsToHighlight.length} terms`);
                await highlightIssues(textsToHighlight);
            }
        } catch (error) {
            addLog(`Error: ${error}`);
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (suggestion: Suggestion, replacement: string) => {
        try {
            await replaceText(suggestion.originalText, replacement);
            // Remove from list
            setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        } catch (error) {
            console.error("Replacement failed", error);
            addLog("Replacement failed");
        }
    };

    const handleDismiss = (id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
    };

    return (
        <FluentProvider theme={lightTheme}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <Title2>Dutch Writer</Title2>
                        <TextGrammarSettings24Regular />
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
                            onChange={(_, data) => setLiveMode(data.checked)}
                        />
                        {loading && <Spinner size="tiny" />}
                    </div>
                </div>

                <div className={styles.content}>
                    {debugLog.length > 0 && (
                        <div style={{ padding: '8px', background: '#f0f0f0', borderBottom: '1px solid #ccc', fontSize: '10px', maxHeight: '100px', overflowY: 'auto' }}>
                            <strong>Debug Log:</strong>
                            {debugLog.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                        </div>
                    )}

                    {loading && !liveMode ? (
                        <Spinner label="Checking your text..." size="large" />
                    ) : (
                        <SuggestionList
                            suggestions={suggestions}
                            onApply={handleApply}
                            onDismiss={handleDismiss}
                        />
                    )}
                </div>
            </div>
        </FluentProvider>
    );
};
