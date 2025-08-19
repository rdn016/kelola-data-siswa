import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import Student from '../../lib/Student';
import { ApiResponse, Student as StudentType } from '../../types/student';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search ? {
      $or: [
        { nama: { $regex: search, $options: 'i' } },
        { nis: { $regex: search, $options: 'i' } },
        { kelas: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Get students with pagination
    const students = await Student.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Student.countDocuments(searchQuery);

    const response: ApiResponse<{
      students: StudentType[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    }> = {
      success: true,
      data: {
        students: students.map(student => ({
          _id: String(student._id),
          nama: student.nama,
          umur: student.umur,
          kelas: student.kelas,
          nis: student.nis,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching students:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Gagal mengambil data siswa'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
