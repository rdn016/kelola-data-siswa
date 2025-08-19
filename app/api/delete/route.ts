import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Student from '../../lib/Student';
import { ApiResponse } from '../../types/student';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'ID siswa harus disediakan'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Cek apakah siswa ada
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Siswa tidak ditemukan'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Hapus siswa
    await Student.findByIdAndDelete(id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Siswa berhasil dihapus'
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Error deleting student:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Gagal menghapus siswa'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
