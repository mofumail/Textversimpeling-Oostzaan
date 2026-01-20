import * as React from "react";
import {
    Card,
    Text,
    Button,
    Body1,
    Caption1,
    makeStyles,
    shorthands,
} from "@fluentui/react-components";
import { Checkmark24Regular, DismissCircle24Regular, Prohibited24Regular } from "@fluentui/react-icons";
import type { Suggestion } from "../services/analysisService";

const useStyles = makeStyles({
    card: {
        ...shorthands.margin("8px"),
        width: "auto",
        maxWidth: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    category: {
        color: "#d13438", // Warning red
        fontWeight: "bold",
    },
    explanation: {
        ...shorthands.margin("8px", "0"),
    },
    actions: {
        display: "flex",
        flexDirection: "column", // Stack vertically
        gap: "12px",
        marginTop: "12px",
        paddingTop: "12px",
        borderTop: "1px solid #eee",
    },
    ignoreButton: {
        justifyContent: "flex-start",
        color: "#605e5c",
        ":hover": {
            color: "#323130",
            backgroundColor: "#f3f2f1"
        }
    }
});

interface SuggestionCardProps {
    suggestion: Suggestion;
    onApply: (suggestion: Suggestion, replacement: string) => void;
    onDismiss: (id: string) => void; // Ignore once
    onIgnore: (word: string) => void; // Stop checking
    onDisableRule?: (ruleId: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onApply, onDismiss, onIgnore, onDisableRule }) => {
    const styles = useStyles();
    const isRule = suggestion.issueCategory === 'Style Rules';

    // Prepare list of rules to display
    const rulesToDisplay = isRule
        ? [
            { id: suggestion.ruleId, explanation: suggestion.explanation },
            ...(suggestion.secondaryRules?.map(r => ({ id: r.ruleId, explanation: r.explanation })) || [])
        ]
        : [];

    return (
        <Card className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '12px', background: isRule ? '#fff4ce' : '#f0f6ff', borderRadius: '4px', border: isRule ? '1px solid #fde7a8' : '1px solid #c7e0f4' }}>
                <Caption1 style={{ fontWeight: 600, fontSize: '14px', color: isRule ? '#8a6d3b' : '#0078d4' }}>{suggestion.originalText}</Caption1>
            </div>

            {isRule ? (
                // Rule View: Show multiple explanations
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                    {rulesToDisplay.map((rule, idx) => (
                        <div key={rule.id || idx} style={{ borderBottom: idx < rulesToDisplay.length - 1 ? '1px solid #eee' : 'none', paddingBottom: idx < rulesToDisplay.length - 1 ? '12px' : '0' }}>
                            <Body1 className={styles.explanation} style={{ display: 'block', marginBottom: '8px' }}>
                                {rule.explanation}
                            </Body1>
                            {rule.id && (
                                <Button
                                    className={styles.ignoreButton}
                                    appearance="transparent"
                                    icon={<Prohibited24Regular />}
                                    onClick={() => onDisableRule && onDisableRule(rule.id!)}
                                    aria-label="Stop checking this rule"
                                    style={{ fontSize: '12px', padding: '4px 0' }}
                                >
                                    Stop checking this rule
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // Jargon/Standard View: Show replacements
                <>
                    <Body1 className={styles.explanation}>
                        Consider:
                    </Body1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {suggestion.replacements.map((replacement) => (
                            <Button
                                key={replacement}
                                appearance="outline"
                                icon={<Checkmark24Regular />}
                                onClick={() => onApply(suggestion, replacement)}
                                aria-label={`Change to: ${replacement}`}
                                style={{ justifyContent: 'flex-start', padding: '12px', fontSize: '14px' }}
                            >
                                {replacement}
                            </Button>
                        ))}
                        {suggestion.replacements.length === 0 && (
                            <Text italic>No specific replacement suggestions.</Text>
                        )}
                    </div>
                </>
            )}

            <div className={styles.actions}>
                <Button
                    className={styles.ignoreButton}
                    appearance="transparent"
                    icon={<DismissCircle24Regular />}
                    onClick={() => onDismiss(suggestion.id)}
                    aria-label="Ignore once"
                >
                    Ignore once
                </Button>

                {/* Rule actions handled inside loop above for specific rules, but 'Ignore once' is global for this text instance */}
                <Button
                    className={styles.ignoreButton}
                    appearance="transparent"
                    icon={<Prohibited24Regular />}
                    onClick={() => onIgnore(suggestion.originalText)}
                    aria-label="Stop checking for this"
                >
                    Stop checking for this
                </Button>
            </div>
        </Card>
    );
};
