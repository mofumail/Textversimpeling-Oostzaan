import { webLightTheme, webDarkTheme } from "@fluentui/react-components";
import type { Theme } from "@fluentui/react-components";

export const lightTheme: Theme = {
    ...webLightTheme,
    colorBrandBackground: "#0078D4", // Office Blue
    colorBrandBackgroundHover: "#106EBE",
};

export const darkTheme: Theme = {
    ...webDarkTheme,
    colorBrandBackground: "#2899F5",
};
