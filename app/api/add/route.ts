import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Student from '../../lib/Student';
import { ApiResponse, StudentFormData, Student as StudentType } from '../../types/student';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: StudentFormData = await request.json();
    const { nama, umur, kelas, nis } = body;

    // Validasi input
    if (!nama || !umur || !kelas || !nis) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Semua field harus diisi'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validasi umur
    if (umur < 5 || umur > 25) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Umur harus antara 5-25 tahun'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Cek NIS sudah ada atau belum
    const existingStudent = await Student.findOne({ nis });
    if (existingStudent) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'NIS sudah terdaftar'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Buat siswa baru
    const newStudent = new Student({
      nama: nama.trim(),
      umur,
      kelas: kelas.trim(),
      nis: nis.trim()
    });

    const savedStudent = await newStudent.save();

    const response: ApiResponse<StudentType> = {
      success: true,
      data: {
        _id: savedStudent._id.toString(),
        nama: savedStudent.nama,
        umur: savedStudent.umur,
        kelas: savedStudent.kelas,
        nis: savedStudent.nis,
        createdAt: savedStudent.createdAt,
        updatedAt: savedStudent.updatedAt
      },
      message: 'Siswa berhasil ditambahkan'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    console.error('Error adding student:', error);
    
    // Handle mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      const validationError = error as unknown as { errors: Record<string, { message: string }> };
      const response: ApiResponse<null> = {
        success: false,
        error: Object.values(validationError.errors)[0]?.message || 'Data tidak valid'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Handle duplicate key error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'NIS sudah terdaftar'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse<null> = {
      success: false,
      error: 'Gagal menambahkan siswa'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
