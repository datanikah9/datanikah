import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Loader2,
  Search,
  FileText,
  LogIn,
  ArrowLeft
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { MarriageRecord } from '../types/marriage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useMarriageData } from '../hooks/useMarriageData';

function SearchPage({ onBack }: { onBack: () => void }) {
  const [searchType, setSearchType] = useState('No Aktanikah');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<MarriageRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchResults([]);

    try {
      const marriageRef = collection(db, 'marriages');
      let q = query(marriageRef);

      if (searchKeyword) {
        switch (searchType) {
          case 'No Aktanikah':
            q = query(marriageRef, where('NoAktanikah', '>=', searchKeyword.toUpperCase()), where('NoAktanikah', '<=', searchKeyword.toUpperCase() + '\uf8ff'));
            break;
          case 'Nama Suami':
            q = query(marriageRef, where('NamaSuami', '>=', searchKeyword.toUpperCase()), where('NamaSuami', '<=', searchKeyword.toUpperCase() + '\uf8ff'));
            break;
          case 'Nama Istri':
            q = query(marriageRef, where('NamaIstri', '>=', searchKeyword.toUpperCase()), where('NamaIstri', '<=', searchKeyword.toUpperCase() + '\uf8ff'));
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
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching data:", error);
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
              onChange={(e) => setSearchKeyword(e.target.value.toUpperCase())}
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
              onClick={() => {
                setSearchKeyword('');
                setSearchResults([]);
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {isSearching ? (
          <div className="flex justify-center mt-6">
            <Loader2 className="animate-spin h-8 w-8 text-green-800" />
          </div>
        ) : (
          searchResults.length > 0 && (
            <div className="overflow-x-auto mt-8">
              <h3 className="text-xl font-semibold mb-4">Search Results</h3>
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama KUA
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Perforasi
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Aktanikah
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Suami
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Istri
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((result) => (
                    <tr key={result.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaKUA}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoPerforasi}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NoAktanikah}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaSuami}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{result.NamaIstri}</td>
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
    wifeAgeData.set(wifeAgeRange, (wifeAgeRange ? wifeAgeRange : 0) + 1);

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
  if (age <= 40) return '>40';
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
      setIsLoginVisible(false);
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
