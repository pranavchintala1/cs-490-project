import React, { createContext, useContext } from "react";
import Flash from "../tools/flash";

const FlashContext = createContext();

export const FlashProvider = ({ children }) => {
  const flash = Flash(); // single global hook
  return <FlashContext.Provider value={flash}>{children}</FlashContext.Provider>;
};

export const useFlash = () => useContext(FlashContext); //Allows Flash messages to be used globally.