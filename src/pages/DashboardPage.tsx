import React, { useState, useRef, useEffect } from 'react';
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
  Search
} from 'lucide-react';
import { processExcelFile } from '../utils/processExcel';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { MarriageRecord } from '../types/marriage';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [recentUploads, setRecentUploads] = useState<MarriageRecord[]>([]);

  useEffect(() => {
    const marriageCollection = collection(db, 'marriages');
    const q = query(marriageCollection, orderBy('createdAt', 'desc'), limit(5));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uploads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarriageRecord));
      setRecentUploads(uploads);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await processExcelFile(file);
      setShowUploadSuccess(true);
      setTimeout(() => {
        setShowUploadSuccess(false);
      }, 3000);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleAdminSearchNavigation = () => {
    navigate('/admin-search');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-green-800 text-white transition-all duration-300 ease-in-out fixed h-full`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center space-x-2">
                <Building2 size={24} />
                <span className="font-bold">KEMENAG</span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-green-700 rounded-lg"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <button className="flex items-center space-x-3 text-white hover:bg-green-700 w-full p-3 rounded-lg transition-colors">
              <LayoutDashboard size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </button>
            <button className="flex items-center space-x-3 text-white hover:bg-green-700 w-full p-3 rounded-lg transition-colors">
              <Upload size={20} />
              {isSidebarOpen && <span>Upload Data</span>}
            </button>
            {/* Admin Search Menu */}
            <button
              onClick={handleAdminSearchNavigation}
              className="flex items-center space-x-3 text-white hover:bg-green-700 w-full p-3 rounded-lg transition-colors"
            >
              <Search size={20} />
              {isSidebarOpen && <span>Admin Search</span>}
            </button>
            <button className="flex items-center space-x-3 text-white hover:bg-green-700 w-full p-3 rounded-lg transition-colors">
              <Users size={20} />
              {isSidebarOpen && <span>Users</span>}
            </button>
            <button className="flex items-center space-x-3 text-white hover:bg-green-700 w-full p-3 rounded-lg transition-colors">
              <Settings size={20} />
              {isSidebarOpen && <span>Settings</span>}
            </button>
          </div>
          <div className="absolute bottom-4 w-full px-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 text-white hover:bg-green-700 w-full p-3 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Upload Data</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xls,.xlsx"
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop your XLS file here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-green-800 hover:text-green-700 font-medium"
                    disabled={isUploading}
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">Only XLS files are supported</p>
                {uploadError && (
                  <p className="text-red-500 mt-2">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Recent Uploads</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KUA
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buku Nikah
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No Akta
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tgl Nikah
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUploads.map((upload) => (
                    <tr key={upload.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{upload.NamaKUA}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{upload.NoAktanikah}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{upload.NoSeriHuruf}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{upload.TanggalAkad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showUploadSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle2 size={20} />
          <span>Database has been successfully updated!</span>
        </div>
      )}
    </div>
  );
}
