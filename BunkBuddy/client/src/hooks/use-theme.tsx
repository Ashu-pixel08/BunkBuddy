import { useContext } from "react";
import { ThemeProvider, useTheme as useThemeContext } from "@/components/shared/theme-provider";

export { ThemeProvider };
export const useTheme = useThemeContext;
