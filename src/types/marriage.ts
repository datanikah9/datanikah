export interface MarriageRecord {
  id: string;
  kua: string;
  bukuNikah: string;
  noAkta: string;
  tglNikah: string;
  suami: {
    nama: string;
    usia: number;
  };
  istri: {
    nama: string;
    usia: number;
  };
  lokasiNikah: string;
  kecamatan: string;
  createdAt: string;
  updatedAt: string;
}
