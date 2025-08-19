import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Student from '../../lib/Student';
import { ApiResponse, StudentFormData, Student as StudentType } from '../../types/student';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body: StudentFormData & { _id: string } = await request.json();
    const { _id, nama, umur, kelas, nis } = body;

    // Validasi input
    if (!_id || !nama || !umur || !kelas || !nis) {
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

    // Cek apakah siswa ada
    const existingStudent = await Student.findById(_id);
    if (!existingStudent) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Siswa tidak ditemukan'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Cek NIS sudah ada untuk siswa lain
    if (existingStudent.nis !== nis) {
      const duplicateNIS = await Student.findOne({ nis, _id: { $ne: _id } });
      if (duplicateNIS) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'NIS sudah terdaftar untuk siswa lain'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Update siswa
    const updatedStudent = await Student.findByIdAndUpdate(
      _id,
      {
        nama: nama.trim(),
        umur,
        kelas: kelas.trim(),
        nis: nis.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gagal mengupdate siswa'
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse<StudentType> = {
      success: true,
      data: {
        _id: updatedStudent._id.toString(),
        nama: updatedStudent.nama,
        umur: updatedStudent.umur,
        kelas: updatedStudent.kelas,
        nis: updatedStudent.nis,
        createdAt: updatedStudent.createdAt,
        updatedAt: updatedStudent.updatedAt
      },
      message: 'Siswa berhasil diupdate'
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Error updating student:', error);
    
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
      error: 'Gagal mengupdate siswa'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
