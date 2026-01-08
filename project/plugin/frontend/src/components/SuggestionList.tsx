import * as React from "react";
import { SuggestionCard } from "./SuggestionCard";
import type { Suggestion } from "../services/analysisService";
import { makeStyles, shorthands } from "@fluentui/react-components";

const useStyles = makeStyles({
    list: {
        display: "flex",
        flexDirection: "column",
        ...shorthands.padding("0"),
    },
    emptyState: {
        textAlign: "center",
        ...shorthands.padding("20px"),
        color: "#605e5c",
    }
});

interface SuggestionListProps {
    suggestions: Suggestion[];
    onApply: (suggestion: Suggestion, replacement: string) => void;
    onDismiss: (id: string) => void;
}

export const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, onApply, onDismiss }) => {
    const styles = useStyles();

    if (suggestions.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No issues found. Good job!</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {suggestions.map((suggestion) => (
                <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={onApply}
                    onDismiss={onDismiss}
                />
            ))}
        </div>
    );
};
