// Utilitários para chamadas à API
const API_BASE_URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.error || "Request failed")
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, "Network error")
  }
}

// Locations API
export const locationsApi = {
  getAll: () => apiRequest<Location[]>("/locations"),
  getById: (id: string) => apiRequest<Location>(`/locations/${id}`),
  create: (data: CreateLocationData) =>
    apiRequest<Location>("/locations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateLocationData) =>
    apiRequest<Location>(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/locations/${id}`, {
      method: "DELETE",
    }),
}

// Barbers API
export const barbersApi = {
  getAll: () => apiRequest<Barber[]>("/barbers"),
  getById: (id: string) => apiRequest<Barber>(`/barbers/${id}`),
  create: (data: CreateBarberData) =>
    apiRequest<Barber>("/barbers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateBarberData) =>
    apiRequest<Barber>(`/barbers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/barbers/${id}`, {
      method: "DELETE",
    }),
}

// Clients API
export const clientsApi = {
  getAll: (params?: { search?: string; planId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.planId) searchParams.set("planId", params.planId)

    const query = searchParams.toString()
    return apiRequest<Client[]>(`/clients${query ? `?${query}` : ""}`)
  },
  getById: (id: string) => apiRequest<Client>(`/clients/${id}`),
  create: (data: CreateClientData) =>
    apiRequest<Client>("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateClientData) =>
    apiRequest<Client>(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/clients/${id}`, {
      method: "DELETE",
    }),
}

// Plans API
export const plansApi = {
  getAll: () => apiRequest<Plan[]>("/plans"),
  create: (data: CreatePlanData) =>
    apiRequest<Plan>("/plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Services API
export const servicesApi = {
  getAll: () => apiRequest<Service[]>("/services"),
  create: (data: CreateServiceData) =>
    apiRequest<Service>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Appointments API
export const appointmentsApi = {
  getAll: (params?: {
    date?: string
    barberId?: string
    locationId?: string
    status?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set("date", params.date)
    if (params?.barberId) searchParams.set("barberId", params.barberId)
    if (params?.locationId) searchParams.set("locationId", params.locationId)
    if (params?.status) searchParams.set("status", params.status)

    const query = searchParams.toString()
    return apiRequest<Appointment[]>(`/appointments${query ? `?${query}` : ""}`)
  },
  getById: (id: string) => apiRequest<Appointment>(`/appointments/${id}`),
  create: (data: CreateAppointmentData) =>
    apiRequest<Appointment>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateAppointmentData) =>
    apiRequest<Appointment>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  cancel: (id: string) =>
    apiRequest<void>(`/appointments/${id}`, {
      method: "DELETE",
    }),
}

// Dashboard API
export const dashboardApi = {
  getStats: (params?: { barberId?: string; locationId?: string; date?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.barberId) searchParams.set("barberId", params.barberId)
    if (params?.locationId) searchParams.set("locationId", params.locationId)
    if (params?.date) searchParams.set("date", params.date)

    const query = searchParams.toString()
    return apiRequest<DashboardStats>(`/dashboard/stats${query ? `?${query}` : ""}`)
  },
}

// Barber Schedules API
export const barberSchedulesApi = {
  getAll: (params?: { barberId?: string; locationId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.barberId) searchParams.set("barberId", params.barberId)
    if (params?.locationId) searchParams.set("locationId", params.locationId)

    const query = searchParams.toString()
    return apiRequest<BarberSchedule[]>(`/barber-schedules${query ? `?${query}` : ""}`)
  },
  create: (data: CreateBarberScheduleData) =>
    apiRequest<BarberSchedule>("/barber-schedules", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Types
export interface Location {
  id: string
  name: string
  address?: string
  createdAt: string
  _count?: {
    barberSchedules: number
    appointments: number
  }
}

export interface Barber {
  id: string
  name: string
  phone?: string
  email?: string
  createdAt: string
  schedules?: BarberSchedule[]
  _count?: {
    appointments: number
  }
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  planId?: string
  planStartDate?: string
  planEndDate?: string
  isActive: boolean
  createdAt: string
  plan?: Plan
  _count?: {
    appointments: number
  }
}

export interface Plan {
  id: string
  name: string
  price: number
  description?: string
  benefits?: any
  isActive: boolean
  createdAt: string
  _count?: {
    clients: number
  }
}

export interface Service {
  id: string
  name: string
  price: number
  durationMinutes: number
  isActive: boolean
  createdAt: string
  _count?: {
    appointments: number
  }
}

export interface Appointment {
  id: string
  clientId: string
  barberId: string
  locationId: string
  serviceId: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  paymentMethod?: string
  paymentStatus: string
  notes?: string
  createdAt: string
  client: Client
  barber: Barber
  location: Location
  service: Service
}

export interface BarberSchedule {
  id: string
  barberId: string
  locationId: string
  weekDay: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
  barber: Barber
  location: Location
}

export interface DashboardStats {
  today: {
    appointments: number
    revenue: number
    vipClients: number
    occupancyRate: number
  }
  general: {
    totalClients: number
    totalClientsWithPlans: number
    monthlyPlanRevenue: number
  }
  appointments: Appointment[]
}

// Create/Update types
export interface CreateLocationData {
  name: string
  address?: string
}

export interface UpdateLocationData extends Partial<CreateLocationData> {}

export interface CreateBarberData {
  name: string
  phone?: string
  email?: string
}

export interface UpdateBarberData extends Partial<CreateBarberData> {}

export interface CreateClientData {
  name: string
  phone: string
  email?: string
  planId?: string
  planStartDate?: string
  planEndDate?: string
}

export interface UpdateClientData extends Partial<CreateClientData> {
  isActive?: boolean
}

export interface CreatePlanData {
  name: string
  price: number
  description?: string
  benefits?: any
  isActive?: boolean
}

export interface CreateServiceData {
  name: string
  price: number
  durationMinutes: number
  isActive?: boolean
}

export interface CreateAppointmentData {
  clientId: string
  barberId: string
  locationId: string
  serviceId: string
  appointmentDate: string
  startTime: string
  endTime: string
  paymentMethod?: string
  paymentStatus?: string
  notes?: string
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  status?: string
}

export interface CreateBarberScheduleData {
  barberId: string
  locationId: string
  weekDay: number
  startTime: string
  endTime: string
  isActive?: boolean
}
