import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Building2,
  Loader2,
  Search,
  FileText,
  ArrowLeft,
  LogIn
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMarriageData } from '../hooks/useMarriageData';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { MarriageRecord } from '../types/marriage';

function SearchPage({ onBack }: { onBack: () => void }) {
  const [searchType, setSearchType] = useState('NOMOR BUKU NIKAH');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<MarriageRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      const marriageRef = collection(db, 'marriages');
      let q = query(marriageRef);

      if (startDate && endDate) {
        q = query(
          marriageRef,
          where('tglNikah', '>=', startDate),
          where('tglNikah', '<=', endDate)
        );
      }

      const querySnapshot = await getDocs(q);
      const results: MarriageRecord[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as MarriageRecord;
        if (searchKeyword) {
          switch (searchType) {
            case 'NOMOR BUKU NIKAH':
              if (data.bukuNikah.includes(searchKeyword)) results.push(data);
              break;
            case 'NOMOR AKTA NIKAH':
              if (data.noAkta.includes(searchKeyword)) results.push(data);
              break;
            case 'NAMA SUAMI':
              if (data.suami.nama.toLowerCase().includes(searchKeyword.toLowerCase())) 
                results.push(data);
              break;
            case 'NAMA ISTRI':
              if (data.istri.nama.toLowerCase().includes(searchKeyword.toLowerCase())) 
                results.push(data);
              break;
          }
        } else {
          results.push(data);
        }
      });

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-green-800 hover:text-green-700"
        >
          <ArrowLeft size={24} />
          <span>Kembali</span>
        </button>
        <h2 className="text-2xl font-bold">Pencarian Data Nikah</h2>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TANGGAL NIKAH (AWAL)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TANGGAL NIKAH (AKHIR)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KATA KUNCI PENCARIAN
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option>NOMOR BUKU NIKAH</option>
                <option>NOMOR AKTA NIKAH</option>
                <option>NAMA SUAMI</option>
                <option>NAMA ISTRI</option>
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Masukkan kata kunci pencarian..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSearching}
              className="bg-green-800 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              {isSearching ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Search size={20} />
              )}
              <span>PENCARIAN DATA</span>
            </button>
          </div>
        </form>

        {showResults && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Hasil Pencarian</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KUA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BUKU NIKAH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NO.AKTA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TGL.NIKAH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SUAMI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISTRI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{result.kua}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{result.bukuNikah}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{result.noAkta}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{result.tglNikah}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{result.suami.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{result.istri.nama}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function processDataForCharts(data: MarriageRecord[]) {
  const districtData = new Map<string, number>();
  const locationData = new Map<string, number>();
  const husbandAgeData = new Map<string, number>();
  const wifeAgeData = new Map<string, number>();
  const underageData = new Map<string, number>();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

  // Initialize maps
  months.forEach(month => underageData.set(month, 0));

  data.forEach(record => {
    // District data
    districtData.set(record.kecamatan, (districtData.get(record.kecamatan) || 0) + 1);

    // Location data
    locationData.set(record.lokasiNikah, (locationData.get(record.lokasiNikah) || 0) + 1);

    // Age data
    const husbandAgeRange = getAgeRange(record.suami.usia);
    const wifeAgeRange = getAgeRange(record.istri.usia);
    
    husbandAgeData.set(husbandAgeRange, (husbandAgeData.get(husbandAgeRange) || 0) + 1);
    wifeAgeData.set(wifeAgeRange, (wifeAgeData.get(wifeAgeRange) || 0) + 1);

    // Underage marriages
    if (record.suami.usia < 19 || record.istri.usia < 19) {
      const month = new Date(record.tglNikah).getMonth();
      underageData.set(months[month], (underageData.get(months[month]) || 0) + 1);
    }
  });

  return {
    districtData: Array.from(districtData, ([name, value]) => ({ name, value })),
    locationData: Array.from(locationData, ([name, value]) => ({ name, value })),
    ageData: {
      husband: Array.from(husbandAgeData, ([age, value]) => ({ age, value })),
      wife: Array.from(wifeAgeData, ([age, value]) => ({ age, value }))
    },
    underageData: Array.from(underageData, ([month, value]) => ({ month, value }))
  };
}

function getAgeRange(age: number): string {
  if (age <= 25) return '19-25';
  if (age <= 30) return '26-30';
  if (age <= 35) return '31-35';
  if (age <= 40) return '36-40';
  return '>40';
}

export default function IndexPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const years = Array.from(
    { length: currentYear - 2009 },
    (_, i) => currentYear - i
  );

  const { data: marriageData, loading, error } = useMarriageData(selectedYear);
  const chartData = marriageData.length > 0 ? processDataForCharts(marriageData) : null;

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setLoginError(error.message);
    }
  };

  if (showSearch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-800 text-white py-6 px-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center space-x-4">
              <Building2 size={40} />
              <div>
                <h1 className="text-2xl font-bold">SISTEM LAPORAN PERNIKAHAN</h1>
                <h2 className="text-lg">KANTOR KEMENTERIAN AGAMA KOTA GORONTALO</h2>
              </div>
            </div>
          </div>
        </header>
        <SearchPage onBack={() => setShowSearch(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-green-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white py-6 px-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 size={40} />
              <div>
                <h1 className="text-2xl font-bold">SISTEM LAPORAN PERNIKAHAN</h1>
                <h2 className="text-lg">KANTOR KEMENTERIAN AGAMA KOTA GORONTALO</h2>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center space-x-2 bg-white text-green-800 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Search size={20} />
                <span>PENCARIAN DATA NIKAH</span>
              </button>
              <button
                onClick={() => setIsLoginVisible(true)}
                className="flex items-center space-x-2 bg-white text-green-800 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
              >
                <LogIn size={20} />
                <span>ADMIN DASHBOARD</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Year Selection */}
        <div className="mb-8 flex justify-end">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                Data Nikah Tahun {year}
              </option>
            ))}
          </select>
        </div>

        {chartData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* District Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Grafik Data Nikah Per-Kecamatan</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.districtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#047857" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Location Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">
                Grafik Berdasarkan Lokasi Nikah Tahun {selectedYear}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#047857" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Husband Age Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">
                Grafik Berdasarkan Usia (Suami) Tahun {selectedYear}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.ageData.husband}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#047857" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Wife Age Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">
                Grafik Berdasarkan Usia (Istri) Tahun {selectedYear}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.ageData.wife}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#047857" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Underage Marriage Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md col-span-full">
              <h3 className="text-xl font-semibold mb-4">
                Grafik Nikah Berdasarkan Usia Di Bawah Umur {'<'} 19 Tahun Per-Bulan Tahun{' '}
                {selectedYear}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.underageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#047857" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Login Form */}
      {isLoginVisible && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-md w-96">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          {loginError && <p className="text-red-500 mb-4">{loginError}</p>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
