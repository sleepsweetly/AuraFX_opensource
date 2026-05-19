"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface GuestContextType {
  isGuest: boolean;
  setGuest: (guest: boolean) => void;
}

const GuestContext = createContext<GuestContextType>({
  isGuest: false,
  setGuest: () => {},
});

export const GuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const guest = localStorage.getItem("guest_mode");
    setIsGuest(guest === "1");
  }, []);

  const setGuest = (guest: boolean) => {
    setIsGuest(guest);
    if (guest) {
      localStorage.setItem("guest_mode", "1");
    } else {
      localStorage.removeItem("guest_mode");
    }
  };

  return (
    <GuestContext.Provider value={{ isGuest, setGuest }}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => useContext(GuestContext); 