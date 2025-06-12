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
  FileText
} from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MarriageRecord } from '../types/marriage';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  data?: MarriageRecord[];
}

interface ChatbotIntent {
  keywords: string[];
  handler: (message: string) => Promise<string | { text: string; data: MarriageRecord[] }>;
  examples: string[];
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Selamat datang di Chatbot Data Pernikahan Kemenag Kota Gorontalo! 👋\n\nSaya dapat membantu Anda mencari informasi tentang:\n• Data pernikahan berdasarkan nama\n• Statistik pernikahan per tahun\n• Informasi KUA\n• Data berdasarkan lokasi\n\nSilakan ketik pertanyaan Anda atau gunakan contoh berikut:\n"Cari data nikah atas nama Ahmad"\n"Berapa jumlah pernikahan tahun 2024"\n"Data KUA Kota Selatan"',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchByName = async (name: string): Promise<{ text: string; data: MarriageRecord[] }> => {
    const marriageRef = collection(db, 'marriages');
    const upperName = name.toUpperCase();
    
    // Search in both husband and wife names
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
        text: `Maaf, tidak ditemukan data pernikahan dengan nama "${name}". Pastikan nama yang Anda masukkan sudah benar.`,
        data: []
      };
    }

    return {
      text: `Ditemukan ${results.length} data pernikahan dengan nama "${name}":`,
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
        text: `Tidak ditemukan data dengan nomor akta "${aktaNumber}".`,
        data: []
      };
    }

    return {
      text: `Ditemukan ${results.length} data dengan nomor akta "${aktaNumber}":`,
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
      return `Tidak ditemukan data pernikahan untuk tahun ${year}.`;
    }

    return `📊 Statistik Pernikahan Tahun ${year}:\n\n• Total Pernikahan: ${count} pasangan\n• Rata-rata per bulan: ${Math.round(count / 12)} pasangan\n\nData ini mencakup seluruh wilayah Kota Gorontalo yang tercatat di sistem Kemenag.`;
  };

  const searchByKUA = async (kuaName: string): Promise<{ text: string; data: MarriageRecord[] }> => {
    const marriageRef = collection(db, 'marriages');
    const upperKUA = kuaName.toUpperCase();
    
    const q = query(
      marriageRef,
      where('NamaKUA', '>=', upperKUA),
      where('NamaKUA', '<=', upperKUA + '\uf8ff'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const results: MarriageRecord[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MarriageRecord));

    if (results.length === 0) {
      return {
        text: `Tidak ditemukan data pernikahan di KUA "${kuaName}".`,
        data: []
      };
    }

    return {
      text: `Ditemukan ${results.length} data pernikahan di KUA "${kuaName}":`,
      data: results
    };
  };

  const chatbotIntents: ChatbotIntent[] = [
    {
      keywords: ['cari', 'nama', 'data nikah', 'pernikahan'],
      handler: async (message: string) => {
        const nameMatch = message.match(/(?:nama|atas nama|cari)\s+(.+?)(?:\s|$)/i);
        if (nameMatch) {
          return await searchByName(nameMatch[1].trim());
        }
        return 'Silakan sebutkan nama yang ingin dicari. Contoh: "Cari data nikah atas nama Ahmad"';
      },
      examples: ['Cari data nikah atas nama Ahmad', 'Data pernikahan nama Siti']
    },
    {
      keywords: ['akta', 'nomor akta', 'no akta'],
      handler: async (message: string) => {
        const aktaMatch = message.match(/(?:akta|nomor akta|no akta)\s+(.+?)(?:\s|$)/i);
        if (aktaMatch) {
          return await searchByAktaNumber(aktaMatch[1].trim());
        }
        return 'Silakan sebutkan nomor akta yang ingin dicari. Contoh: "Cari nomor akta AN-2024-001"';
      },
      examples: ['Cari nomor akta AN-2024-001', 'Data akta nikah BN-2024-002']
    },
    {
      keywords: ['tahun', 'statistik', 'jumlah', 'berapa'],
      handler: async (message: string) => {
        const yearMatch = message.match(/(?:tahun|statistik|jumlah)\s*(\d{4})/i);
        if (yearMatch) {
          return await getYearlyStats(yearMatch[1]);
        }
        return 'Silakan sebutkan tahun yang ingin dicari. Contoh: "Berapa jumlah pernikahan tahun 2024"';
      },
      examples: ['Berapa jumlah pernikahan tahun 2024', 'Statistik tahun 2023']
    },
    {
      keywords: ['kua', 'kantor urusan agama'],
      handler: async (message: string) => {
        const kuaMatch = message.match(/(?:kua|kantor urusan agama)\s+(.+?)(?:\s|$)/i);
        if (kuaMatch) {
          return await searchByKUA(kuaMatch[1].trim());
        }
        return 'Silakan sebutkan nama KUA yang ingin dicari. Contoh: "Data KUA Kota Selatan"';
      },
      examples: ['Data KUA Kota Selatan', 'Pernikahan di KUA Kota Utara']
    }
  ];

  const processMessage = async (message: string): Promise<void> => {
    setIsTyping(true);
    
    try {
      let response: string | { text: string; data: MarriageRecord[] } = 
        'Maaf, saya tidak memahami pertanyaan Anda. Silakan coba dengan kata kunci seperti:\n• "Cari nama [nama]"\n• "Nomor akta [nomor]"\n• "Statistik tahun [tahun]"\n• "Data KUA [nama KUA]"';

      // Find matching intent
      for (const intent of chatbotIntents) {
        if (intent.keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()))) {
          response = await intent.handler(message);
          break;
        }
      }

      // Add bot response
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
        text: 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.',
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

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');

    // Process the message
    await processMessage(messageToProcess);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Search, text: 'Cari nama Ahmad', action: () => setInputMessage('Cari data nikah atas nama Ahmad') },
    { icon: Calendar, text: 'Statistik 2024', action: () => setInputMessage('Berapa jumlah pernikahan tahun 2024') },
    { icon: MapPin, text: 'Data KUA', action: () => setInputMessage('Data KUA Kota Selatan') },
    { icon: FileText, text: 'Nomor Akta', action: () => setInputMessage('Cari nomor akta ') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-green-800 hover:text-green-700 transition-colors"
              >
                <ArrowLeft size={24} />
                <span className="font-medium">Kembali</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <MessageCircle className="text-green-800" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Chatbot Data Pernikahan</h1>
                  <p className="text-sm text-gray-600">Kemenag Kota Gorontalo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-200px)] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-start space-x-3 max-w-3xl ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isBot ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {message.isBot ? (
                      <Bot className="text-green-800" size={16} />
                    ) : (
                      <User className="text-blue-800" size={16} />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.isBot 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-green-800 text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    {message.data && message.data.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {message.data.map((record) => (
                          <div key={record.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-semibold text-gray-700">Suami:</span>
                                <p className="text-gray-900">{record.NamaSuami}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Istri:</span>
                                <p className="text-gray-900">{record.NamaIstri}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">KUA:</span>
                                <p className="text-gray-900">{record.NamaKUA}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Tanggal Akad:</span>
                                <p className="text-gray-900">{record.TanggalAkad}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">No. Akta:</span>
                                <p className="text-gray-900">{record.NoAktanikah}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">No. Perforasi:</span>
                                <p className="text-gray-900">{record.NoPerforasi}</p>
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
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Bot className="text-green-800" size={16} />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <Loader2 className="animate-spin text-green-800" size={16} />
                      <span className="text-gray-600">Sedang mengetik...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-3 border-t bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-center space-x-2 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-full px-3 py-2 text-sm transition-colors"
                >
                  <action.icon size={14} className="text-green-800" />
                  <span className="text-gray-700">{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t bg-white">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pertanyaan Anda di sini..."
                  className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent max-h-32"
                  rows={1}
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-green-800 hover:bg-green-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}