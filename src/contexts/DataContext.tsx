"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface Location {
  id: string;
  name: string;
  address?: string;
}

interface Barber {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  isActive: boolean;
}

interface DataContextType {
  locations: Location[];
  barbers: Barber[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getLocationById: (id: string) => Location | undefined;
  getBarberById: (id: string) => Barber | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Cache com timestamp
  const [lastFetch, setLastFetch] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  const fetchData = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    if (now - lastFetch < CACHE_DURATION && locations.length > 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar dados em paralelo
      const [locationsRes, barbersRes] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/barbers"),
      ]);

      if (locationsRes.ok && barbersRes.ok) {
        const [locationsData, barbersData] = await Promise.all([
          locationsRes.json(),
          barbersRes.json(),
        ]);

        setLocations(locationsData);
        setBarbers(barbersData);
        setLastFetch(now);
      } else {
        throw new Error("Erro ao carregar dados");
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const refreshData = async () => {
    setLastFetch(0); // Força refresh
    await fetchData();
  };

  const getLocationById = (id: string) => {
    return locations.find((location) => location.id === id);
  };

  const getBarberById = (id: string) => {
    return barbers.find((barber) => barber.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        locations,
        barbers,
        isLoading,
        error,
        refreshData,
        getLocationById,
        getBarberById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData deve ser usado dentro de um DataProvider");
  }
  return context;
}
