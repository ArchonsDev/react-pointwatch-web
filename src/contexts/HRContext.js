import { useContext, createContext, useState } from "react";

const HRContext = createContext();

export default function HRContextProvider({ children }) {
  const [selectedTerm, setSelectedTerm] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  return (
    <HRContext.Provider
      value={{
        selectedTerm,
        setSelectedTerm,
        selectedLevel,
        setSelectedLevel,
        selectedDepartment,
        setSelectedDepartment,
      }}>
      {children}
    </HRContext.Provider>
  );
}

export const HRData = () => {
  return useContext(HRContext);
};
