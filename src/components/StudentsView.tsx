import React, { useState, useEffect } from "react";

interface Siswa {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  angkatan: string;
  tagihanSpp: number;
  emailOrangTua: string;
  teleponOrangTua: string;
}

const App: React.FC = () => {
  // Data awal siswa
  const [siswaList, setSiswaList] = useState<Siswa[]>([
    {
      id: "1",
      nis: "12345",
      nama: "Budi",
      kelas: "XII IPA 1",
      angkatan: "2022",
      tagihanSpp: 200000,
      emailOrangTua: "budi@example.com",
      teleponOrangTua: "08123456789",
    },
  ]);

  // State untuk modal tambah/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<Partial<Siswa>>({});

  // Fungsi untuk membuka modal tambah
  const handleOpenAdd = () => {
    setFormData({});
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Fungsi untuk membuka modal edit
  const handleOpenEdit = (siswa: Siswa) => {
    setFormData(siswa);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Fungsi untuk menambah data siswa
  const handleAddSiswa = (siswa: Siswa) => {
    setSiswaList(prev => [siswa, ...prev]);
  };

  // Fungsi untuk mengupdate data siswa
  const handleUpdateSiswa = (siswa: Siswa) => {
    setSiswaList(prev =>
      prev.map(s => (s.id === siswa.id ? siswa : s))
    );
  };

  // Fungsi untuk menghapus siswa
  const handleDeleteSiswa = (id: string) => {
    setSiswaList(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Data Siswa</h1>
      <button onClick={handleOpenAdd}>Tambah Siswa</button>
      {isModalOpen && (
        <StudentsForm
          siswaList={siswaList}
          onAddSiswa={handleAddSiswa}
          onEditSiswa={handleUpdateSiswa}
          onDeleteSiswa={handleDeleteSiswa}
          setIsModalOpen={setIsModalOpen}
          modalMode={modalMode}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      <h2>Daftar Siswa</h2>
      <table border={1} cellPadding={5} cellSpacing={0} style={{ marginTop: 10, width: "100%" }}>
        <thead>
          <tr>
            <th>NIS</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Angkatan</th>
            <th>Tagihan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {siswaList.map(s => (
            <tr key={s.id}>
              <td>{s.nis}</td>
              <td>{s.nama}</td>
              <td>{s.kelas}</td>
              <td>{s.angkatan}</td>
              <td>{s.tagihanSpp}</td>
              <td>
                <button onClick={() => handleOpenEdit(s)}>Edit</button>
                <button onClick={() => handleDeleteSiswa(s.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface StudentsFormProps {
  siswaList: Siswa[];
  onAddSiswa: (siswa: Siswa) => void;
  onEditSiswa: (siswa: Siswa) => void;
  onDeleteSiswa: (id: string) => void;
  setIsModalOpen: (open: boolean) => void;
  modalMode: 'add' | 'edit';
  formData: Partial<Siswa>;
  setFormData: (data: Partial<Siswa>) => void;
}

const StudentsForm: React.FC<StudentsFormProps> = ({
  siswaList,
  onAddSiswa,
  onEditSiswa,
  onDeleteSiswa,
  setIsModalOpen,
  modalMode,
  formData,
  setFormData,
}) => {
  const [nis, setNis] = useState<string>(formData.nis || "");
  const [nama, setNama] = useState<string>(formData.nama || "");
  const [kelas, setKelas] = useState<string>(formData.kelas || "");
  const [angkatan, setAngkatan] = useState<string>(formData.angkatan || "");
  const [tagihanSpp, setTagihanSpp] = useState<string>(
    formData.tagihanSpp?.toString() || "350000"
  );
  const [email, setEmail] = useState<string>(formData.emailOrangTua || "");
  const [telepon, setTelepon] = useState<string>(formData.teleponOrangTua || "");

  // Saat formData berubah (bisa dari edit), update state input
  useEffect(() => {
    setNis(formData.nis || "");
    setNama(formData.nama || "");
    setKelas(formData.kelas || "");
    setAngkatan(formData.angkatan || "");
    setTagihanSpp(formData.tagihanSpp?.toString() || "350000");
    setEmail(formData.emailOrangTua || "");
    setTelepon(formData.teleponOrangTua || "");
  }, [formData]);

  const handleSave = () => {
    if (!nis || !nama) {
      alert("NIS dan Nama harus diisi");
      return;
    }

    if (modalMode === 'add') {
      if (siswaList.some(s => s.nis === nis)) {
        alert("NIS sudah terdaftar");
        return;
      }
      const newSiswa: Siswa = {
        id: `sis-${Date.now()}`,
        nis,
        nama,
        kelas,
        angkatan,
        tagihanSpp: Number(tagihanSpp) || 350000,
        emailOrangTua: email,
        teleponOrangTua: telepon,
      };
      onAddSiswa(newSiswa);
    } else {
      const updatedSiswa: Siswa = {
        ...(formData as Siswa),
        nis,
        nama,
        kelas,
        angkatan,
        tagihanSpp: Number(tagihanSpp) || 350000,
        emailOrangTua: email,
        teleponOrangTua: telepon,
      };
      onEditSiswa(updatedSiswa);
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: "#eee", padding: 20, marginTop: 20, maxWidth: 500 }}>
      <h3>{modalMode === 'add' ? 'Tambah Siswa' : 'Edit Siswa'}</h3>
      <div style={{ marginBottom: 10 }}>
        <label>NIS: </label>
        <input value={nis} onChange={(e) => setNis(e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Nama: </label>
        <input value={nama} onChange={(e) => setNama(e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Kelas: </label>
        <input value={kelas} onChange={(e) => setKelas(e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Angkatan: </label>
        <input value={angkatan} onChange={(e) => setAngkatan(e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Tagihan SPP: </label>
        <input
          type="number"
          value={tagihanSpp}
          onChange={(e) => setTagihanSpp(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Email Orang Tua: </label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Telepon Orang Tua: </label>
        <input value={telepon} onChange={(e) => setTelepon(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={handleSave}>Simpan</button>
        <button onClick={() => setIsModalOpen(false)}>Batal</button>
      </div>
    </div>
  );
};

export default App;

    </div>
  );
}
