import { createContext, SetStateAction, Dispatch } from "react";

interface IThemeContext {
  theme: string;
  setTheme: Dispatch<SetStateAction<string>>;
}

// define the context
const ThemeContext = createContext<IThemeContext>({
  theme: "",
  setTheme: () => {},
});

export default ThemeContext;
