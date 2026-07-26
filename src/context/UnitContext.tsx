import React, { createContext, useContext, useState } from 'react';

export type UnitType = 'imperial' | 'metric';

interface UnitContextType {
  unit: UnitType;
  setUnit: (unit: UnitType) => void;
  toggleUnit: () => void;
}

const UnitContext = createContext<UnitContextType>({
  unit: 'imperial',
  setUnit: () => {},
  toggleUnit: () => {},
});

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnit] = useState<UnitType>('imperial');

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'imperial' ? 'metric' : 'imperial'));
  };

  return (
    <UnitContext.Provider value={{ unit, setUnit, toggleUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => useContext(UnitContext);
