import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Loader2,
  MessageCircle,
  Search,
  Calendar,
  Users,
  MapPin,
  FileText,
  X,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MarriageRecord } from '../types/marriage';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  data?: MarriageRecord[];
}

interface StructuredQuery {
  type: 'name' | 'akta' | 'date' | 'kua' | 'year';
  value: string;
  label: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Selamat datang di Chatbot Data Pernikahan! 🤖\n\nSaya siap membantu Anda mencari informasi pernikahan dengan mudah. Anda bisa:\n\n📝 Ketik langsung pertanyaan\n🔍 Gunakan pencarian terstruktur\n📊 Minta statistik data\n\nContoh pertanyaan:\n"Cari data nikah Ahmad"\n"Berapa pernikahan tahun 2024?"\n"Data KUA Kota Selatan"',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showStructuredSearch, setShowStructuredSearch] = useState(false);
  const [structuredQuery, setStructuredQuery] = useState<StructuredQuery>({
    type: 'name',
    value: '',
    label: 'Nama Lengkap'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Tidak tersedia';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const searchByName = async (name: string): Promise<{ text: string; data: MarriageRecord[] }> => {
    const marriageRef = collection(db, 'marriages');
    const upperName = name.toUpperCase();
    
    const husbandQuery = query(
      marriageRef,
      where('NamaSuami', '>=', upperName),
      where('NamaSuami', '<=', upperName + '\uf8ff'),
      limit(10)
    );
    
    const wifeQuery = query(
      marriageRef,
      where('NamaIstri', '>=', upperName),
      where('NamaIstri', '<=', upperName + '\uf8ff'),
      limit(10)
    );

    const [husbandSnapshot, wifeSnapshot] = await Promise.all([
      getDocs(husbandQuery),
      getDocs(wifeQuery)
    ]);

    const results: MarriageRecord[] = [];
    const seenIds = new Set<string>();

    husbandSnapshot.docs.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        results.push({ id: doc.id, ...doc.data() } as MarriageRecord);
        seenIds.add(doc.id);
      }
    });

    wifeSnapshot.docs.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        results.push({ id: doc.id, ...doc.data() } as MarriageRecord);
        seenIds.add(doc.id);
      }
    });

    if (results.length === 0) {
      return {
        text: `Maaf, saya tidak menemukan data pernikahan dengan nama "${name}" 😔\n\nTips pencarian:\n• Pastikan ejaan nama sudah benar\n• Coba gunakan nama lengkap\n• Gunakan huruf kapital untuk nama\n\nAtau coba cari dengan data lain seperti nomor akta atau KUA.`,
        data: []
      };
    }

    const resultText = results.length === 1 
      ? `Saya menemukan 1 data pernikahan dengan nama "${name}" ✅`
      : `Saya menemukan ${results.length} data pernikahan dengan nama "${name}" ✅`;

    return {
      text: resultText,
      data: results
    };
  };

  const searchByAktaNumber = async (aktaNumber: string): Promise<{ text: string; data: MarriageRecord[] }> => {
    const marriageRef = collection(db, 'marriages');
    const upperAkta = aktaNumber.toUpperCase();
    
    const q = query(
      marriageRef,
      where('NoAktanikah', '>=', upperAkta),
      where('NoAktanikah', '<=', upperAkta + '\uf8ff'),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    const results: MarriageRecord[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MarriageRecord));

    if (results.length === 0) {
      return {
        text: `Tidak ditemukan data dengan nomor akta "${aktaNumber}" 📄\n\nPastikan:\n• Format nomor akta sudah benar\n• Tidak ada spasi berlebih\n• Gunakan huruf kapital\n\nContoh format: AN-2024-001`,
        data: []
      };
    }

    return {
      text: `Berhasil menemukan data dengan nomor akta "${aktaNumber}" ✅`,
      data: results
    };
  };

  const searchByDate = async (date: string): Promise<{ text: string; data: MarriageRecord[] }> => {
    const marriageRef = collection(db, 'marriages');
    
    const q = query(
      marriageRef,
      where('TanggalAkad', '==', date),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const results: MarriageRecord[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MarriageRecord));

    if (results.length === 0) {
      return {
        text: `Tidak ada pernikahan yang tercatat pada tanggal ${formatDate(date)} 📅\n\nCoba cari dengan tanggal lain atau gunakan pencarian berdasarkan bulan/tahun.`,
        data: []
      };
    }

    return {
      text: `Ditemukan ${results.length} pernikahan pada tanggal ${formatDate(date)} 💒`,
      data: results
    };
  };

  const getYearlyStats = async (year: string): Promise<string> => {
    const marriageRef = collection(db, 'marriages');
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const q = query(
      marriageRef,
      where('TanggalAkad', '>=', startDate),
      where('TanggalAkad', '<=', endDate)
    );

    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;

    if (count === 0) {
      return `Belum ada data pernikahan untuk tahun ${year} 📊\n\nMungkin data belum diinput atau tahun yang dicari belum tersedia dalam sistem.`;
    }

    const avgPerMonth = Math.round(count / 12);
    const avgPerDay = Math.round(count / 365);

    return `📊 **Statistik Pernikahan Tahun ${year}**\n\n✅ Total Pernikahan: **${count} pasangan**\n📅 Rata-rata per bulan: **${avgPerMonth} pasangan**\n📆 Rata-rata per hari: **${avgPerDay} pasangan**\n\n🏢 Data mencakup seluruh wilayah Kota Gorontalo yang tercatat di Kemenag.\n\nIngin melihat data tahun lain? Silakan tanya saya! 😊`;
  };

  const searchByKUA = async (kuaName: string): Promise<{ text: string; data: MarriageRecord[] }> => {
    const marriageRef = collection(db, 'marriages');
    const upperKUA = kuaName.toUpperCase();
    
    const q = query(
      marriageRef,
      where('NamaKUA', '>=', upperKUA),
      where('NamaKUA', '<=', upperKUA + '\uf8ff'),
      orderBy('TanggalAkad', 'desc'),
      limit(15)
    );

    const querySnapshot = await getDocs(q);
    const results: MarriageRecord[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MarriageRecord));

    if (results.length === 0) {
      return {
        text: `Tidak ditemukan data pernikahan di KUA "${kuaName}" 🏢\n\nPastikan nama KUA sudah benar. Contoh:\n• KUA Kota Selatan\n• KUA Kota Utara\n• KUA Dungingi`,
        data: []
      };
    }

    return {
      text: `Ditemukan ${results.length} data pernikahan terbaru di KUA "${kuaName}" 🏢✅`,
      data: results
    };
  };

  const processMessage = async (message: string): Promise<void> => {
    setIsTyping(true);
    
    try {
      let response: string | { text: string; data: MarriageRecord[] } = 
        'Maaf, saya belum memahami pertanyaan Anda 🤔\n\nCoba gunakan kata kunci seperti:\n• "Cari nama [nama lengkap]"\n• "Nomor akta [nomor]"\n• "Statistik tahun [tahun]"\n• "Data KUA [nama KUA]"\n• "Pernikahan tanggal [tanggal]"\n\nAtau gunakan tombol pencarian terstruktur di bawah! 👇';

      const lowerMessage = message.toLowerCase();

      // Enhanced pattern matching with more natural language
      if (lowerMessage.includes('nama') || lowerMessage.includes('cari')) {
        const namePatterns = [
          /(?:nama|cari|data)\s+(?:nikah\s+)?(?:atas\s+nama\s+)?(.+?)(?:\s*$|\s+(?:tahun|di|pada))/i,
          /(?:pernikahan|nikah)\s+(.+?)(?:\s*$|\s+(?:tahun|di|pada))/i
        ];
        
        for (const pattern of namePatterns) {
          const match = message.match(pattern);
          if (match && match[1].trim()) {
            response = await searchByName(match[1].trim());
            break;
          }
        }
      } else if (lowerMessage.includes('akta') || lowerMessage.includes('nomor')) {
        const aktaPatterns = [
          /(?:akta|nomor akta|no akta|nomor)\s+([A-Z0-9\-]+)/i,
          /([A-Z]{2}-\d{4}-\d{3})/i
        ];
        
        for (const pattern of aktaPatterns) {
          const match = message.match(pattern);
          if (match) {
            response = await searchByAktaNumber(match[1].trim());
            break;
          }
        }
      } else if (lowerMessage.includes('tahun') || lowerMessage.includes('statistik') || lowerMessage.includes('berapa')) {
        const yearMatch = message.match(/(?:tahun|statistik|berapa).*?(\d{4})/i);
        if (yearMatch) {
          response = await getYearlyStats(yearMatch[1]);
        }
      } else if (lowerMessage.includes('kua') || lowerMessage.includes('kantor urusan agama')) {
        const kuaPatterns = [
          /(?:kua|kantor urusan agama)\s+(.+?)(?:\s*$|\s+(?:tahun|pada))/i,
          /(?:di|pada)\s+kua\s+(.+?)(?:\s*$|\s+(?:tahun|pada))/i
        ];
        
        for (const pattern of kuaPatterns) {
          const match = message.match(pattern);
          if (match && match[1].trim()) {
            response = await searchByKUA(match[1].trim());
            break;
          }
        }
      } else if (lowerMessage.includes('tanggal') || lowerMessage.includes('hari')) {
        const dateMatch = message.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          response = await searchByDate(dateMatch[1]);
        }
      }

      const botMessage: Message = {
        id: Date.now().toString(),
        text: typeof response === 'string' ? response : response.text,
        isBot: true,
        timestamp: new Date(),
        data: typeof response === 'object' ? response.data : undefined
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Maaf, terjadi kesalahan sistem 😔\n\nSilakan coba lagi dalam beberapa saat atau hubungi administrator jika masalah berlanjut.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');

    await processMessage(messageToProcess);
  };

  const handleStructuredSearch = async () => {
    if (!structuredQuery.value.trim()) return;

    let searchMessage = '';
    switch (structuredQuery.type) {
      case 'name':
        searchMessage = `Cari nama ${structuredQuery.value}`;
        break;
      case 'akta':
        searchMessage = `Nomor akta ${structuredQuery.value}`;
        break;
      case 'date':
        searchMessage = `Pernikahan tanggal ${structuredQuery.value}`;
        break;
      case 'kua':
        searchMessage = `Data KUA ${structuredQuery.value}`;
        break;
      case 'year':
        searchMessage = `Statistik tahun ${structuredQuery.value}`;
        break;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: searchMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setStructuredQuery({ ...structuredQuery, value: '' });
    setShowStructuredSearch(false);

    await processMessage(searchMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Search, text: 'Cari Nama', action: () => setInputMessage('Cari nama ') },
    { icon: Calendar, text: 'Statistik 2024', action: () => setInputMessage('Berapa pernikahan tahun 2024?') },
    { icon: MapPin, text: 'Data KUA', action: () => setInputMessage('Data KUA ') },
    { icon: FileText, text: 'Nomor Akta', action: () => setInputMessage('Nomor akta ') }
  ];

  const searchTypes = [
    { value: 'name', label: 'Nama Lengkap', placeholder: 'Masukkan nama suami atau istri' },
    { value: 'akta', label: 'Nomor Akta', placeholder: 'Contoh: AN-2024-001' },
    { value: 'date', label: 'Tanggal Pernikahan', placeholder: 'Format: YYYY-MM-DD' },
    { value: 'kua', label: 'Nama KUA', placeholder: 'Contoh: Kota Selatan' },
    { value: 'year', label: 'Tahun (Statistik)', placeholder: 'Contoh: 2024' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-green-800" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <MessageCircle className="text-green-800" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Chatbot</h1>
                  <p className="text-xs text-gray-600">Data Pernikahan</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStructuredSearch(!showStructuredSearch)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Filter size={20} className="text-green-800" />
            </button>
          </div>
        </div>
      </div>

      {/* Structured Search Panel */}
      {showStructuredSearch && (
        <div className="bg-white border-b shadow-sm">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Pencarian Terstruktur</h3>
              <button
                onClick={() => setShowStructuredSearch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <select
                value={structuredQuery.type}
                onChange={(e) => {
                  const selectedType = searchTypes.find(type => type.value === e.target.value);
                  setStructuredQuery({
                    type: e.target.value as any,
                    value: '',
                    label: selectedType?.label || ''
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {searchTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              
              <div className="flex space-x-2">
                <input
                  type={structuredQuery.type === 'date' ? 'date' : 'text'}
                  value={structuredQuery.value}
                  onChange={(e) => setStructuredQuery({ ...structuredQuery, value: e.target.value })}
                  placeholder={searchTypes.find(type => type.value === structuredQuery.type)?.placeholder}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleStructuredSearch}
                  disabled={!structuredQuery.value.trim()}
                  className="bg-green-800 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container - Mobile Optimized */}
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex items-start space-x-2 max-w-[85%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isBot ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {message.isBot ? (
                    <Bot className="text-green-800" size={14} />
                  ) : (
                    <User className="text-blue-800" size={14} />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.isBot 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-green-800 text-white'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                  {message.data && message.data.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.data.map((record) => (
                        <div key={record.id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <span className="font-semibold text-green-800">👤 Suami:</span>
                                <p className="text-gray-900 font-medium">{record.NamaSuami}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-pink-800">👰 Istri:</span>
                                <p className="text-gray-900 font-medium">{record.NamaIstri}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-blue-800">🏢 KUA:</span>
                                <p className="text-gray-900">{record.NamaKUA}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-purple-800">📅 Tanggal:</span>
                                <p className="text-gray-900">{formatDate(record.TanggalAkad)}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-orange-800">📄 No. Akta:</span>
                                <p className="text-gray-900 font-mono">{record.NoAktanikah}</p>
                              </div>
                              {record.NoPerforasi && (
                                <div>
                                  <span className="font-semibold text-teal-800">🔢 No. Perforasi:</span>
                                  <p className="text-gray-900 font-mono">{record.NoPerforasi}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="text-green-800" size={14} />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin text-green-800" size={14} />
                    <span className="text-gray-600 text-sm">Sedang mencari...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-full px-3 py-2 text-xs whitespace-nowrap transition-colors flex-shrink-0"
              >
                <action.icon size={12} className="text-green-800" />
                <span className="text-gray-700">{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area - Mobile Optimized */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan Anda..."
                className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                rows={1}
                disabled={isTyping}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-green-800 hover:bg-green-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}