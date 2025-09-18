// Common types used throughout the application

export interface ServiceVariant {
  id?: string;
  hair_length: 'KURZ' | 'MITTEL' | 'LANG' | null;
  duration_minutes: number;
  price_euros: number;
}

export interface ServiceGroupImportData {
  title: string;
  description: string;
  category: string;
  gender_restriction: 'DAMEN' | 'HERREN' | 'BEIDE';
  order_index: number;
  variants: ServiceVariant[];
}

export interface ServiceGroupFormData {
  title: string;
  description: string;
  category_id: string;
  gender_restriction: 'DAMEN' | 'HERREN' | 'BEIDE';
  order_index: number;
  variants: ServiceVariant[];
}

export interface AppointmentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  requests: string;
}

export interface BookingData extends AppointmentFormData {
  gender: string;
  hairLength: string;
  service: string;
  serviceDetails: {
    serviceName: string;
    serviceDuration: string;
    servicePrice: string;
  };
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  gender?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}
