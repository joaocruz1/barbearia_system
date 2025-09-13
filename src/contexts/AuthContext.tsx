"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "admin" | "funcionario";
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    barberId: string,
    password: string,
    locationId: string
  ) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const barberId = localStorage.getItem("barberId");
      const locationId = localStorage.getItem("locationId");

      if (!barberId || !locationId) {
        setIsLoading(false);
        return;
      }

      // Buscar dados do usuário
      const response = await fetch(`/api/users?adminBarberId=${barberId}`);
      if (response.ok) {
        const users = await response.json();
        const currentUser = users.find((u: User) => u.id === barberId);

        if (currentUser && currentUser.isActive) {
          setUser(currentUser);
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    barberId: string,
    password: string,
    locationId: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barberId, password, locationId }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("barberId", barberId);
        localStorage.setItem("locationId", locationId);
        localStorage.setItem("barberName", data.barber.name);

        setUser({
          id: data.barber.id,
          name: data.barber.name,
          email: data.barber.email,
          phone: data.barber.phone,
          role: data.barber.role,
          isActive: data.barber.isActive,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("barberId");
    localStorage.removeItem("locationId");
    localStorage.removeItem("barberName");
    setUser(null);
    router.push("/");
  };

  const refreshUser = async () => {
    if (user?.id) {
      await checkAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

