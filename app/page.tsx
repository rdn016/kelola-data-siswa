'use client';

import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import StudentTable from './components/StudentTable';
import StudentForm from './components/StudentForm';
import ConfirmDialog from './components/ConfirmDialog';
import { Student, StudentFormData, ApiResponse } from './types/student';
import toast, { Toaster } from 'react-hot-toast';

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
    loading: boolean;
  }>({
    isOpen: false,
    studentId: '',
    studentName: '',
    loading: false
  });

  // Fetch students
  const fetchStudents = async (search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/get?${params.toString()}`);
      const data: ApiResponse<{
        students: Student[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }> = await response.json();

      if (data.success && data.data) {
        setStudents(data.data.students);
      } else {
        toast.error(data.error || 'Gagal mengambil data siswa');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal mengambil data siswa');
    } finally {
      setLoading(false);
    }
  };

  // Add or update student
  const handleSubmit = async (formData: StudentFormData) => {
    setFormLoading(true);
    try {
      let response;
      
      if (editingStudent) {
        // Update existing student
        response = await fetch('/api/edit', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: editingStudent._id,
            ...formData
          }),
        });
      } else {
        // Add new student
        response = await fetch('/api/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      const data: ApiResponse<Student> = await response.json();

      if (data.success) {
        toast.success(data.message || (editingStudent ? 'Siswa berhasil diupdate' : 'Siswa berhasil ditambahkan'));
        setIsFormOpen(false);
        setEditingStudent(null);
        fetchStudents(); // Refresh data
      } else {
        toast.error(data.error || 'Gagal menyimpan data siswa');
      }
    } catch (error) {
      console.error('Error submitting student:', error);
      toast.error('Gagal menyimpan data siswa');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete student
  const handleDelete = async (id: string) => {
    // Find student name for confirmation
    const student = students.find(s => s._id === id);
    const studentName = student?.nama || 'siswa ini';
    
    setDeleteDialog({
      isOpen: true,
      studentId: id,
      studentName,
      loading: false
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`/api/delete?id=${deleteDialog.studentId}`, {
        method: 'DELETE',
      });

      const data: ApiResponse<null> = await response.json();

      if (data.success) {
        toast.success(data.message || 'Siswa berhasil dihapus');
        fetchStudents(); // Refresh data
        setDeleteDialog({ isOpen: false, studentId: '', studentName: '', loading: false });
      } else {
        toast.error(data.error || 'Gagal menghapus siswa');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Gagal menghapus siswa');
    } finally {
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, studentId: '', studentName: '', loading: false });
  };

  // Handle edit
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  // Handle search
  const handleSearch = (search: string) => {
    fetchStudents(search);
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
  };

  // Load data on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kelola Data Siswa</h1>
                <p className="text-sm text-gray-600">Sistem manajemen data siswa sekolah</p>
              </div>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Siswa</div>
                <div className="text-2xl font-bold text-gray-900">{students.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <StudentTable
          students={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      {/* Student Form Modal */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        student={editingStudent}
        loading={formLoading}
      />

      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Hapus Siswa"
        message={`Apakah Anda yakin ingin menghapus ${deleteDialog.studentName}? Tindakan ini tidak dapat dibatalkan.`}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
