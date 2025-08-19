// Dummy data untuk testing
const testStudents = [
  {
    nama: "Ahmad Rizky Pratama",
    umur: 16,
    kelas: "10A",
    nis: "2024001"
  },
  {
    nama: "Siti Nurhaliza Putri",
    umur: 17,
    kelas: "11B",
    nis: "2023045"
  },
  {
    nama: "Budi Santoso",
    umur: 18,
    kelas: "12C",
    nis: "2022078"
  },
  {
    nama: "Dewi Maharani",
    umur: 16,
    kelas: "10B",
    nis: "2024012"
  },
  {
    nama: "Eko Prasetyo",
    umur: 17,
    kelas: "11A",
    nis: "2023089"
  }
];

// Function untuk menambahkan data test
async function addTestData() {
  for (const student of testStudents) {
    try {
      const response = await fetch('http://localhost:3000/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });
      
      const result = await response.json();
      console.log(`Added ${student.nama}:`, result.success ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.error(`Error adding ${student.nama}:`, error);
    }
  }
}

// Uncomment line below to run
// addTestData();

export { testStudents, addTestData };
