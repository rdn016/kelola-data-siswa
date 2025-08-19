import mongoose, { Schema, Document } from 'mongoose';
import { Student } from '../types/student';

export interface StudentDocument extends Omit<Student, '_id'>, Document {}

const studentSchema = new Schema<StudentDocument>({
  nama: {
    type: String,
    required: [true, 'Nama siswa harus diisi'],
    trim: true,
    maxlength: [100, 'Nama tidak boleh lebih dari 100 karakter']
  },
  umur: {
    type: Number,
    required: [true, 'Umur harus diisi'],
    min: [5, 'Umur minimal 5 tahun'],
    max: [25, 'Umur maksimal 25 tahun']
  },
  kelas: {
    type: String,
    required: [true, 'Kelas harus diisi'],
    trim: true,
    maxlength: [10, 'Kelas tidak boleh lebih dari 10 karakter']
  },
  nis: {
    type: String,
    required: [true, 'NIS harus diisi'],
    unique: true,
    trim: true,
    maxlength: [20, 'NIS tidak boleh lebih dari 20 karakter']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index untuk performa pencarian
studentSchema.index({ nama: 1 });
studentSchema.index({ kelas: 1 });

export default mongoose.models.Student || mongoose.model<StudentDocument>('Student', studentSchema);
