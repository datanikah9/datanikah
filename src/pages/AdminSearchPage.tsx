import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { MarriageRecord } from '../types/marriage';
import { ArrowLeft, Loader2, Search, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminSearchPage() {
  const [searchType, setSearchType] = useState('No Aktanikah');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [adminSearchResults, setAdminSearchResults] = useState<MarriageRecord[]>([]);
  const [adminSearchLoading, setAdminSearchLoading] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleAdminSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSearchLoading(true);
    setAdminSearchResults([]);

    try {
      const marriageCollection = collection(db, 'marriages');
      let q = query(marriageCollection);

      if (searchKeyword) {
        switch (searchType) {
          case 'No Aktanikah':
            q = query(marriageCollection, where('NoAktanikah', '>=', searchKeyword.toUpperCase()), where('NoAktanikah', '<=', searchKeyword.toUpperCase() + '\uf8ff'));
            break;
          case 'Nama Suami':
            q = query(marriageCollection, where('NamaSuami', '>=', searchKeyword.toUpperCase()), where('NamaSuami', '<=', searchKeyword.toUpperCase() + '\uf8ff'));
            break;
          case 'Nama Istri':
            q = query(marriageCollection, where('NamaIstri', '>=', searchKeyword.toUpperCase()), where('NamaIstri', '<=', searchKeyword.toUpperCase() + '\uf8ff'));
            break;
          default:
            console.warn('Unknown search type:', searchType);
            break;
        }
      }

      const querySnapshot = await getDocs(q);
      const results: MarriageRecord[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarriageRecord));
      setAdminSearchResults(results);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setAdminSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchType('No Aktanikah');
    setSearchKeyword('');
    setAdminSearchResults([]);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value.toUpperCase());
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-green-800 hover:text-green-700"
        >
          <ArrowLeft size={24} />
          <span>Kembali</span>
        </button>
        <h2 className="text-2xl font-bold">Admin Search Data</h2>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleAdminSearch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Type
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option>No Aktanikah</option>
              <option>Nama Suami</option>
              <option>Nama Istri</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Keyword
            </label>
            <input
              type="text"
              value={searchKeyword}
              onChange={handleKeywordChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Search size={16} className="inline-block mr-2" />
              Search
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <XCircle size={16} className="inline-block mr-2" />
              Clear
            </button>
          </div>
        </form>

        {adminSearchLoading ? (
          <div className="flex justify-center mt-6">
            <Loader2 className="animate-spin h-8 w-8 text-green-800" />
          </div>
        ) : (
          adminSearchResults.length > 0 && (
            <div className="overflow-x-auto mt-8">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provinsi
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kabupaten/Kota
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode KUA
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama KUA
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Seri Huruf
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Perforasi
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Pemeriksaan
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Aktanikah
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Aktanikah Lama
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Pendaftaran
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Daftar
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIK Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat Lahir Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Lahir Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Umur Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warganegara Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pendidikan Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pekerjaan Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Ayah Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Ibu Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIK Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat Lahir Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Lahir Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Umur Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warganegara Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pendidikan Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pekerjaan Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Ayah Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Ibu Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Akad
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jam Akad
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat Akad Nikah
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Kelurahan
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pencatatan Pengadilan Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pencatatan Nomor Pengadilan Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pencatatan Tanggal Pengadilan Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pencatatan Pengadilan Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pencatatan Nomor Pengadilan Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pencatatan Tanggal Pengadilan Istri
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIP/NIK Penghulu Pemeriksa
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Penghulu Pemeriksa
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIP/NIK Penghulu Hadir
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Penghulu Hadir
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mas Kawin
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No NTPN
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hubungan Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sebab Menjadi Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIK Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Lengkap Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat Lahir Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Lahir Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat Tinggal Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bin
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kewarganegaraan Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agama Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pekerjaan Wali
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIK Saksi Satu
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Saksi Satu
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat Lagir Saksi Satu
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Lahir Saksi Satu
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agama Saksi Satu
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kewarganegaraan Saksi Satu
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pekerjaan Saksi Satu
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat Tinggal Saksi Satu
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIK Saksi Dua
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Saksi Dua
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat Lagir Saksi Dua
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Lahir Saksi Dua
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agama Saksi Dua
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kewarganegaraan Saksi Dua
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pekerjaan Saksi Dua
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempat Tinggal Saksi Dua
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Bayar
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nikah Di
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminSearchResults.map((result) => (
                    <tr key={result.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{result.Provinsi}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.KabupatenKota}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.KodeKUA}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaKUA}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoSeriHuruf}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoPerforasi}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoPemeriksaan}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoAktanikah}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoAktanikahLama}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoPendaftaran}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TanggalDaftar}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NIKSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TempatLahirSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TanggalLahirSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.UmurSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.WarganegaraSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PendidikanSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PekerjaanSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.AlamatSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.StatusSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaAyahSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaIbuSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NIKIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TempatLahirIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TanggalLahirIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.UmurIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.WarganegaraIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PendidikanIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PekerjaanIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.AlamatIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.StatusIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaAyahIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaIbuIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TanggalAkad}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.JamAkad}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.AlamatAkadNikah}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaKelurahan}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PencatatanPengadilanSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PencatatanNomorPengadilanSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PencatatanTanggalPengadilanSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PencatatanPengadilanIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PencatatanNomorPengadilanIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PencatatanTanggalPengadilanIstri}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NIPNIKPenghuluPemeriksa}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaPenghuluPemeriksa}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NIPNIKPenghuluHadir}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaPenghuluHadir}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.MasKawin}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoNTPN}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.StatusWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.HubunganWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.SebabMenjadiWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NIKWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaLengkapWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TempatLahirWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TanggalLahirWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.AlamatTinggalWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.Bin}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.KewarganegaraanWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.AgamaWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PekerjaanWali}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NIKSaksiSatu}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaSaksiSatu}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TempatLagirSaksiSatu}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TanggalLahirSaksiSatu}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.AgamaSaksiSatu}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.KewarganegaraanSaksiSatu}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PekerjaanSaksiSatu}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TempatTinggalSaksiSatu}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NIKSaksiDua}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaSaksiDua}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TempatLagirSaksiDua}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TanggalLahirSaksiDua}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.AgamaSaksiDua}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.KewarganegaraanSaksiDua}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.PekerjaanSaksiDua}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TempatTinggalSaksiDua}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.TanggalBayar}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NikahDi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
