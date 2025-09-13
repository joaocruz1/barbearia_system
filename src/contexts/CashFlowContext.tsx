"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";

interface CashFlowStats {
  totalRevenue: number;
  pendingRevenue: number;
  paidRevenue: number;
  cancelledRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  paymentMethods: {
    pix: number;
    dinheiro: number;
    cartao: number;
    plano: number;
  };
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    appointments: number;
  }>;
  barberStats: Array<{
    barberId: string;
    barberName: string;
    revenue: number;
    appointments: number;
  }>;
  serviceStats: Array<{
    serviceId: string;
    serviceName: string;
    revenue: number;
    appointments: number;
  }>;
}

interface CashFlowAppointment {
  id: string;
  clientName: string;
  barberName: string;
  serviceName: string;
  servicePrice: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  locationName: string;
  notes: string;
  createdAt: string;
}

interface CashFlowData {
  stats: CashFlowStats;
  appointments: CashFlowAppointment[];
}

interface CashFlowContextType {
  data: CashFlowData | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    startDate: string;
    endDate: string;
    locationId: string;
    barberId: string;
    status: string;
  };
  setFilters: (filters: Partial<CashFlowContextType["filters"]>) => void;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

const CashFlowContext = createContext<CashFlowContextType | undefined>(
  undefined
);

export function CashFlowProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar useRef para cache para evitar re-renderizações
  const cacheRef = useRef<Map<string, { data: CashFlowData; timestamp: number }>>(new Map());
  const lastFetchRef = useRef<number>(0);
  
  const { isAdmin } = useAuth();

  const [filters, setFiltersState] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    locationId: "",
    barberId: "",
    status: "",
  });

  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

  // Memoizar a chave do cache para evitar re-criações
  const cacheKey = useMemo(() => {
    return `${filters.startDate}-${filters.endDate}-${filters.locationId}-${filters.barberId}`;
  }, [filters.startDate, filters.endDate, filters.locationId, filters.barberId]);

  const fetchCashFlowData = useCallback(
    async (forceRefresh = false) => {
      if (!isAdmin) {
        setData(null);
        return;
      }

      const cached = cacheRef.current.get(cacheKey);
      const now = Date.now();

      // Verificar cache
      if (!forceRefresh && cached && now - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        return;
      }

      // Evitar múltiplas requisições simultâneas
      if (isLoading) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

        if (filters.locationId && filters.locationId !== "all") {
          params.append("locationId", filters.locationId);
        }
        if (filters.barberId && filters.barberId !== "all") {
          params.append("barberId", filters.barberId);
        }

        const response = await fetch(`/api/cash-flow?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erro ao carregar dados de caixa");
        }

        const cashFlowData = await response.json();

        // Atualizar cache usando ref
        cacheRef.current.set(cacheKey, {
          data: cashFlowData,
          timestamp: now,
        });

        setData(cashFlowData);
        lastFetchRef.current = now;
      } catch (err) {
        console.error("Erro ao carregar dados de caixa:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, isAdmin, cacheKey, isLoading]
  );

  const setFilters = useCallback(
    (newFilters: Partial<CashFlowContextType["filters"]>) => {
      setFiltersState((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const refetch = useCallback(async () => {
    await fetchCashFlowData(true);
  }, [fetchCashFlowData]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Buscar dados apenas quando os filtros mudarem ou quando for admin
  useEffect(() => {
    if (isAdmin) {
      fetchCashFlowData();
    }
  }, [isAdmin, cacheKey]); // Removido fetchCashFlowData das dependências

  return (
    <CashFlowContext.Provider
      value={{
        data,
        isLoading,
        error,
        filters,
        setFilters,
        refetch,
        clearCache,
      }}
    >
      {children}
    </CashFlowContext.Provider>
  );
}

export function useCashFlow() {
  const context = useContext(CashFlowContext);
  if (context === undefined) {
    throw new Error("useCashFlow deve ser usado dentro de um CashFlowProvider");
  }
  return context;
}
