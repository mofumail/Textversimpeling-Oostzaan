import * as React from "react";
import {
    Card,
    CardHeader,
    CardFooter,
    Text,
    Button,
    Body1,
    Caption1,
    makeStyles,
    shorthands,
} from "@fluentui/react-components";
import { Checkmark24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import type { Suggestion } from "../services/analysisService";

const useStyles = makeStyles({
    card: {
        ...shorthands.margin("8px"),
        width: "auto",
        maxWidth: "100%",
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
        justifyContent: "flex-end",
        gap: "8px",
    },
});

interface SuggestionCardProps {
    suggestion: Suggestion;
    onApply: (suggestion: Suggestion, replacement: string) => void;
    onDismiss: (id: string) => void;
    onIgnore: (word: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onApply, onDismiss, onIgnore }) => {
    const styles = useStyles();

    return (
        <Card className={styles.card}>
            <CardHeader
                header={<Text className={styles.category}>{suggestion.issueCategory}</Text>}
                description={<Caption1>Original: "{suggestion.originalText}"</Caption1>}
            />

            <Body1 className={styles.explanation}>
                {suggestion.explanation}
            </Body1>

            <CardFooter className={styles.actions} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <Button
                        appearance="subtle"
                        onClick={() => onIgnore(suggestion.originalText)}
                        size="small"
                        aria-label="Ignore this word"
                    >
                        Ignore Word
                    </Button>
                    <Button
                        appearance="secondary"
                        icon={<Dismiss24Regular />}
                        onClick={() => onDismiss(suggestion.id)}
                        aria-label="Reject suggestion"
                    >
                        Skip
                    </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {suggestion.replacements.map((replacement) => (
                        <Button
                            key={replacement}
                            appearance="primary"
                            icon={<Checkmark24Regular />}
                            onClick={() => onApply(suggestion, replacement)}
                            aria-label={`Replace with: ${replacement}`}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            Change to "{replacement}"
                        </Button>
                    ))}
                </div>
            </CardFooter>
        </Card>
    );
};
