export interface Student {
  _id?: string;
  nama: string;
  umur: number;
  kelas: string;
  nis: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentFormData {
  nama: string;
  umur: number;
  kelas: string;
  nis: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
