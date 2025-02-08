import { read, utils } from 'xlsx';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import type { MarriageRecord } from '../types/marriage';

export async function processExcelFile(file: File): Promise<void> {
  const data = await file.arrayBuffer();
  const workbook = read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

  // Extract column headers from the first row
  const headers = jsonData[0] as string[];

  // Process each row (skip the header row)
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as any[];
    if (!row) continue;

    // Create an object from the row data using headers as keys
    const record: any = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = row[j] || ''; // Use empty string for missing values
    }

    // Normalize the record to match the MarriageRecord type
    const normalizedRecord = normalizeRecord(record);

    // Check if record already exists
    const marriageCollection = collection(db, 'marriages');
    const existingDoc = await getDocs(
      query(
        marriageCollection,
        where('NoAktanikah', '==', normalizedRecord.NoAktanikah),
        where('NamaKUA', '==', normalizedRecord.NamaKUA)
      )
    );

    if (existingDoc.empty) {
      // Add new record to Firebase
      await addDoc(marriageCollection, {
        ...normalizedRecord,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  }
}

function normalizeRecord(row: any): Omit<MarriageRecord, 'id' | 'createdAt' | 'updatedAt'> {
  const formatDate = (dateString: any): string => {
    if (!dateString) return '';

    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript
        const year = parseInt(parts[2], 10);

        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month, day);
          return date.toISOString(); // Convert to ISO string for Firebase
        }
      }
      return ''; // Return empty string if parsing fails
    } catch (error) {
      console.error("Error parsing date:", dateString);
      return '';
    }
  };

  return {
    Provinsi: row['Provinsi'] || '',
    KabupatenKota: row['Kabupaten/Kota'] || '',
    KodeKUA: row['Kode KUA'] || '',
    NamaKUA: row['Nama KUA'] || '',
    NoSeriHuruf: row['No Seri Huruf'] || '',
    NoPerforasi: row['No Perforasi'] || '',
    NoPemeriksaan: row['No Pemeriksaan'] || '',
    NoAktanikah: row['No Aktanikah'] || '',
    NoAktanikahLama: row['No Aktanikah Lama'] || '',
    NoPendaftaran: row['No Pendaftaran'] || '',
    TanggalDaftar: formatDate(row['Tanggal Daftar']) || '',
    NIKSuami: row['NIK Suami'] || '',
    NamaSuami: row['Nama Suami'] || '',
    TempatLahirSuami: row['Tempat Lahir Suami'] || '',
    TanggalLahirSuami: formatDate(row['Tanggal Lahir Suami']) || '',
    UmurSuami: parseInt(row['Umur Suami']) || 0,
    WarganegaraSuami: row['Warganegara Suami'] || '',
    PendidikanSuami: row['Pendidikan Suami'] || '',
    PekerjaanSuami: row['Pekerjaan Suami'] || '',
    AlamatSuami: row['Alamat Suami'] || '',
    StatusSuami: row['Status Suami'] || '',
    NamaAyahSuami: row['Nama Ayah Suami'] || '',
    NamaIbuSuami: row['Nama Ibu Suami'] || '',
    NIKIstri: row['NIK Istri'] || '',
    NamaIstri: row['Nama Istri'] || '',
    TempatLahirIstri: row['Tempat Lahir Istri'] || '',
    TanggalLahirIstri: formatDate(row['Tanggal Lahir Istri']) || '',
    UmurIstri: parseInt(row['Umur Istri']) || 0,
    WarganegaraIstri: row['Warganegara Istri'] || '',
    PendidikanIstri: row['Pendidikan Istri'] || '',
    PekerjaanIstri: row['Pekerjaan Istri'] || '',
    AlamatIstri: row['Alamat Istri'] || '',
    StatusIstri: row['Status Istri'] || '',
    NamaAyahIstri: row['Nama Ayah Istri'] || '',
    NamaIbuIstri: row['Nama Ibu Istri'] || '',
    TanggalAkad: formatDate(row['Tanggal Akad']) || '',
    JamAkad: row['Jam Akad'] || '',
    AlamatAkadNikah: row['Alamat Akad Nikah'] || '',
    NamaKelurahan: row['Nama Kelurahan'] || '',
    PencatatanPengadilanSuami: row['Pencatatan Pengadilan Suami'] || '',
    PencatatanNomorPengadilanSuami: row['Pencatatan Nomor Pengadilan Suami'] || '',
    PencatatanTanggalPengadilanSuami: formatDate(row['Pencatatan Tanggal Pengadilan Suami']) || '',
    PencatatanPengadilanIstri: row['Pencatatan Pengadilan Istri'] || '',
    PencatatanNomorPengadilanIstri: row['Pencatatan Nomor Pengadilan Istri'] || '',
    PencatatanTanggalPengadilanIstri: formatDate(row['Pencatatan Tanggal Pengadilan Istri']) || '',
    NIPNIKPenghuluPemeriksa: row['NIP/NIK Penghulu Pemeriksa'] || '',
    NamaPenghuluPemeriksa: row['Nama Penghulu Pemeriksa'] || '',
    NIPNIKPenghuluHadir: row['NIP/NIK Penghulu Hadir'] || '',
    NamaPenghuluHadir: row['Nama Penghulu Hadir'] || '',
    MasKawin: row['Mas Kawin'] || '',
    NoNTPN: row['No NTPN'] || '',
    StatusWali: row['Status Wali'] || '',
    HubunganWali: row['Hubungan Wali'] || '',
    SebabMenjadiWali: row['Sebab Menjadi Wali'] || '',
    NIKWali: row['NIK Wali'] || '',
    NamaLengkapWali: row['Nama Lengkap Wali'] || '',
    TempatLahirWali: row['Tempat Lahir Wali'] || '',
    TanggalLahirWali: formatDate(row['Tanggal Lahir Wali']) || '',
    AlamatTinggalWali: row['Alamat Tinggal Wali'] || '',
    Bin: row['Bin'] || '',
    KewarganegaraanWali: row['Kewarganegaraan Wali'] || '',
    AgamaWali: row['Agama Wali'] || '',
    PekerjaanWali: row['Pekerjaan Wali'] || '',
    NIKSaksiSatu: row['NIK Saksi Satu'] || '',
    NamaSaksiSatu: row['Nama Saksi Satu'] || '',
    TempatLagirSaksiSatu: row['Tempat Lagir Saksi Satu'] || '',
    TanggalLahirSaksiSatu: formatDate(row['Tanggal Lahir Saksi Satu']) || '',
    AgamaSaksiSatu: row['Agama Saksi Satu'] || '',
    KewarganegaraanSaksiSatu: row['Kewarganegaraan Saksi Satu'] || '',
    PekerjaanSaksiSatu: row['Pekerjaan Saksi Satu'] || '',
    TempatTinggalSaksiSatu: row['Tempat Tinggal Saksi Satu'] || '',
    NIKSaksiDua: row['NIK Saksi Dua'] || '',
    NamaSaksiDua: row['Nama Saksi Dua'] || '',
    TempatLagirSaksiDua: row['Tempat Lagir Saksi Dua'] || '',
    TanggalLahirSaksiDua: formatDate(row['Tanggal Lahir Saksi Dua']) || '',
    AgamaSaksiDua: row['Agama Saksi Dua'] || '',
    KewarganegaraanSaksiDua: row['Kewarganegaraan Saksi Dua'] || '',
    PekerjaanSaksiDua: row['Pekerjaan Saksi Dua'] || '',
    TempatTinggalSaksiDua: row['Tempat Tinggal Saksi Dua'] || '',
    TanggalBayar: formatDate(row['Tanggal Bayar']) || '',
    NikahDi: row['Nikah Di'] || ''
  };
}
