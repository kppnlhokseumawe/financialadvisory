import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  RefreshCw, 
  Sliders, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ChevronRight, 
  ArrowUpRight, 
  Layers, 
  DollarSign, 
  Briefcase, 
  Settings, 
  FileText,
  Calendar,
  X,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Activity,
  Calculator,
  User,
  ExternalLink,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface SectorData {
  id: string;
  name: string;
  alokasi: number; // in Billion IDR
  kontrak: number; // in Billion IDR
}

interface TenderPackage {
  id: string;
  title: string;
  pagu: number; // in IDR
  hps: number; // in IDR
  status: 'Tender Ulang' | 'Penandatanganan' | 'Evaluasi Teknis' | 'Pengumuman' | 'Selesai';
  sector: string;
}

export default function App() {
  // --- Persistent & Realistic Initial State ---
  const [sectors, setSectors] = useState<SectorData[]>([
    { id: '1', name: 'INFRASTRUKTUR', alokasi: 92, kontrak: 74 },
    { id: '2', name: 'PENDIDIKAN', alokasi: 114, kontrak: 48 },
    { id: '3', name: 'KESEHATAN', alokasi: 82, kontrak: 62 },
    { id: '4', name: 'SOSIAL', alokasi: 52, kontrak: 34 },
    { id: '5', name: 'EKONOMI', alokasi: 34, kontrak: 12 },
  ]);

  const [tenders, setTenders] = useState<TenderPackage[]>([
    {
      id: '4421003',
      title: 'Pembangunan Jembatan Krueng Cunda Tahap III',
      pagu: 12400000000,
      hps: 11950000000,
      status: 'Tender Ulang',
      sector: 'INFRASTRUKTUR'
    },
    {
      id: '4420992',
      title: 'Pengadaan Alkes RSUD Cut Meutia (DAK 2026)',
      pagu: 8210500000,
      hps: 7850000000,
      status: 'Penandatanganan',
      sector: 'KESEHATAN'
    },
    {
      id: '4421105',
      title: 'Peningkatan Jalan Lingkungan Kec. Muara Satu',
      pagu: 3500000000,
      hps: 3320000000,
      status: 'Evaluasi Teknis',
      sector: 'INFRASTRUKTUR'
    },
    {
      id: '4421211',
      title: 'Rehabilitasi Gedung Kantor Walikota',
      pagu: 1200000000,
      hps: 1140000000,
      status: 'Pengumuman',
      sector: 'INFRASTRUKTUR'
    }
  ]);

  // --- Dynamic Simulation / Parameters ---
  const [targetEfficiencyPercent, setTargetEfficiencyPercent] = useState<number>(5.5);
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'anggaran' | 'tender' | 'simulasi'>('dashboard');
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  
  // Last sync clock & Real-time Live clock
  const [lastSyncTime, setLastSyncTime] = useState<string>('2026-07-09 14:32:10 WIB');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Search and Filter for Tenders
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Notification Alerts
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals / Forms State
  const [showTenderModal, setShowTenderModal] = useState<boolean>(false);
  const [editingTender, setEditingTender] = useState<TenderPackage | null>(null);
  const [tenderForm, setTenderForm] = useState<Omit<TenderPackage, 'id'>>({
    title: '',
    pagu: 0,
    hps: 0,
    status: 'Pengumuman',
    sector: 'INFRASTRUKTUR'
  });

  // Clock Update Effect (Dynamic WIB time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to WIB time (UTC+7)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('id-ID', options);
      setCurrentTime(formatter.format(now).replace(/\//g, '-') + ' WIB');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Baseline Adjustments to hit exact initial design numbers ---
  const basePaguOtherSectors = 1054.2; // 1428.2 - 374
  const baseRealisasiOtherSectors = 82.4; // 312.4 - 230
  const baseEfficiencyOtherSectors = 11.7495; // 12.8 - 1.0505
  const baseLelangBerjalanOther = 159.3895; // 184.7 - 25.3105

  // --- Computed Metrics ---
  const metrics = useMemo(() => {
    const sectorPaguTotal = sectors.reduce((acc, curr) => acc + curr.alokasi, 0);
    const sectorRealisasiTotal = sectors.reduce((acc, curr) => acc + curr.kontrak, 0);
    
    const totalPagu = basePaguOtherSectors + sectorPaguTotal;
    const realisasiBelanja = baseRealisasiOtherSectors + sectorRealisasiTotal;
    const realisasiPercentage = (realisasiBelanja / totalPagu) * 100;

    // Dynamic Lelang Berjalan from current tenders array
    const tendersPaguTotal = tenders.reduce((acc, curr) => acc + curr.pagu, 0) / 1000000000; // to Billion
    const nilaiLelangBerjalan = baseLelangBerjalanOther + tendersPaguTotal;

    // Dynamic Efisiensi from difference in Pagu and HPS of tenders
    const tendersEfficiencyTotal = tenders.reduce((acc, curr) => {
      const diff = curr.pagu - curr.hps;
      return acc + (diff > 0 ? diff : 0);
    }, 0) / 1000000000; // to Billion
    const efisiensiPengadaan = baseEfficiencyOtherSectors + tendersEfficiencyTotal;

    return {
      totalPagu,
      realisasiBelanja,
      realisasiPercentage,
      nilaiLelangBerjalan,
      efisiensiPengadaan,
      totalTendersCount: tenders.length + 48 // 52 package baseline
    };
  }, [sectors, tenders]);

  // Handle manual sync simulation
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('id-ID', options);
      setLastSyncTime(formatter.format(now).replace(/\//g, '-') + ' WIB');
      setIsSyncing(false);
      showNotification('Sistem berhasil disinkronisasi langsung dengan server pusat SIPD & SPSE Lhokseumawe.', 'success');
    }, 1200);
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sector edit handlers
  const handleSectorChange = (id: string, field: 'alokasi' | 'kontrak', value: number) => {
    setSectors(prev => prev.map(sec => {
      if (sec.id === id) {
        // Enforce logical constraint: contracts cannot exceed total budget allocation
        let newVal = value;
        if (field === 'kontrak' && newVal > sec.alokasi) {
          newVal = sec.alokasi;
        }
        if (field === 'alokasi' && newVal < sec.kontrak) {
          // Adjust contract downwards if allocation drops below it
          return { ...sec, alokasi: newVal, kontrak: newVal };
        }
        return { ...sec, [field]: newVal };
      }
      return sec;
    }));
  };

  // Tender form actions
  const handleAddOrEditTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenderForm.pagu <= 0 || tenderForm.hps <= 0) {
      showNotification('Nilai Pagu dan HPS harus lebih besar dari 0!', 'error');
      return;
    }
    if (tenderForm.hps > tenderForm.pagu) {
      showNotification('Peringatan: Nilai HPS melebihi Pagu Anggaran.', 'error');
    }

    if (editingTender) {
      setTenders(prev => prev.map(t => t.id === editingTender.id ? { ...tenderForm, id: t.id } as TenderPackage : t));
      showNotification(`Paket lelang #${editingTender.id} berhasil diperbarui.`, 'success');
    } else {
      const newId = (Math.floor(1000000 + Math.random() * 9000000)).toString();
      setTenders(prev => [
        {
          id: newId,
          ...tenderForm
        } as TenderPackage,
        ...prev
      ]);
      showNotification(`Paket lelang baru #${newId} berhasil ditambahkan ke database SPSE.`, 'success');
    }

    setShowTenderModal(false);
    setEditingTender(null);
    setTenderForm({
      title: '',
      pagu: 0,
      hps: 0,
      status: 'Pengumuman',
      sector: 'INFRASTRUKTUR'
    });
  };

  const startEditTender = (t: TenderPackage) => {
    setEditingTender(t);
    setTenderForm({
      title: t.title,
      pagu: t.pagu,
      hps: t.hps,
      status: t.status,
      sector: t.sector
    });
    setShowTenderModal(true);
  };

  const handleDeleteTender = (id: string) => {
    setTenders(prev => prev.filter(t => t.id !== id));
    showNotification(`Paket lelang #${id} telah dihapus dari sistem.`, 'info');
  };

  const handleExportData = () => {
    showNotification('Mempersiapkan berkas ekspor data analisis fiskal SIPD-SPSE...', 'info');
    setTimeout(() => {
      showNotification('Berhasil! Laporan Konsolidasi Fiskal Lhokseumawe telah diunduh ke perangkat Anda.', 'success');
    }, 1500);
  };

  // Filtered Tenders list
  const filteredTenders = useMemo(() => {
    return tenders.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'Semua' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tenders, searchQuery, statusFilter]);

  // Selected Sector details for display
  const selectedSector = useMemo(() => {
    return sectors.find(s => s.id === selectedSectorId) || null;
  }, [sectors, selectedSectorId]);

  return (
    <div id="app-root" className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      
      {/* Header Panel */}
      <header id="header-bar" className="gradient-header h-16 flex items-center justify-between px-6 shadow-md z-10 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-200 rounded-lg flex flex-col items-center justify-center font-extrabold text-slate-900 text-[10px] text-center leading-none tracking-tighter border border-slate-500 shadow-inner">
            <span className="text-[8px] font-medium text-slate-700">PEMKOT</span>
            <span className="text-[12px] text-slate-900">LSM</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">Sistem Integrasi Fiskal Lhokseumawe</h1>
            <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest flex items-center gap-1.5">
              <span>Dashboard Analisis SIPD & SPSE Real-Time</span>
              <span className="text-slate-600">•</span>
              <span className="text-blue-400 text-[9px] bg-blue-900/30 px-1.5 py-0.5 rounded font-mono">PRO VERSION</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Jam Sistem (WIB)</div>
            <div className="text-white text-xs font-mono font-medium">{currentTime || 'Loading...'}</div>
          </div>

          <div className="flex flex-col text-right">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Sinkronisasi Terakhir</div>
            <div className="text-emerald-400 text-xs font-mono">{lastSyncTime}</div>
          </div>

          <button 
            id="sync-button"
            onClick={handleSync}
            disabled={isSyncing}
            className={`bg-slate-700/50 hover:bg-slate-700 p-2 rounded-lg flex items-center gap-2 border border-slate-600 text-white text-xs font-semibold cursor-pointer transition-all ${isSyncing ? 'opacity-80' : ''}`}
            title="Sinkronisasikan data fiskal saat ini dengan SIPD Lhokseumawe"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'MENYAMAKAN...' : 'SINKRONISASI'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div id="main-layout" className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside id="sidebar" className="w-64 bg-slate-900 flex flex-col justify-between py-6 shrink-0 border-r border-slate-800">
          <div className="flex flex-col gap-6">
            <div className="px-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 mb-2">Navigasi Utama</p>
              <div className="flex flex-col gap-1">
                <button
                  id="nav-tab-dashboard"
                  onClick={() => setSelectedTab('dashboard')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    selectedTab === 'dashboard' 
                      ? 'bg-slate-800 text-white border-l-4 border-blue-400 pl-3' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>Dashboard Ringkasan</span>
                </button>

                <button
                  id="nav-tab-anggaran"
                  onClick={() => setSelectedTab('anggaran')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    selectedTab === 'anggaran' 
                      ? 'bg-slate-800 text-white border-l-4 border-blue-400 pl-3' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Manajemen Anggaran</span>
                </button>

                <button
                  id="nav-tab-tender"
                  onClick={() => setSelectedTab('tender')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    selectedTab === 'tender' 
                      ? 'bg-slate-800 text-white border-l-4 border-blue-400 pl-3' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Daftar Paket SPSE</span>
                </button>

                <button
                  id="nav-tab-simulasi"
                  onClick={() => setSelectedTab('simulasi')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    selectedTab === 'simulasi' 
                      ? 'bg-slate-800 text-white border-l-4 border-blue-400 pl-3' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-purple-400" />
                  <span>Kalkulator & Simulasi</span>
                </button>
              </div>
            </div>

            {/* Quick Sector Summary in Sidebar */}
            <div className="px-4 border-t border-slate-800 pt-4 hidden md:block">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 mb-3">Realisasi Sektoral</p>
              <div className="flex flex-col gap-2.5 px-2">
                {sectors.map(sec => {
                  const pct = Math.round((sec.kontrak / sec.alokasi) * 100);
                  return (
                    <div key={sec.id} className="flex flex-col gap-1 cursor-pointer" onClick={() => { setSelectedTab('dashboard'); setSelectedSectorId(sec.id); }}>
                      <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                        <span className="truncate max-w-[120px]">{sec.name}</span>
                        <span className="font-mono text-slate-300 font-semibold">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${pct > 75 ? 'bg-emerald-500' : pct > 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-6 flex flex-col gap-4 text-slate-500">
            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
              <span className="font-bold text-slate-300 block mb-1">Status Koneksi API</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Kemendagri SIPD v2.3</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Inaproc SPSE v4.5</span>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-600 text-center font-mono">
              Pemerintah Kota Lhokseumawe &copy; 2026
            </p>
          </div>
        </aside>

        {/* Content Panel Area */}
        <main id="content-area" className="flex-1 flex flex-col overflow-y-auto relative">
          
          {/* Notification Toast */}
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4"
              >
                <div className={`p-4 rounded-lg shadow-lg border flex items-start gap-3 ${
                  notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                  {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />}
                  {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{notification.message}</p>
                  </div>
                  <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Metric Cards Section (Always visible on top of pages for quick assessment) */}
          <section id="metric-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b bg-white shrink-0 shadow-sm">
            <div className="flex flex-col p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Pagu SIPD 2026</span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">
                Rp {metrics.totalPagu.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Miliar
              </span>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                <span>↑ 4.2% vs TA 2025</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">Sektoral + Operasional</span>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Realisasi Belanja</span>
                <DollarSign className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-800 tracking-tight">
                  Rp {metrics.realisasiBelanja.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Miliar
                </span>
                <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {metrics.realisasiPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.realisasiPercentage}%` }}></div>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nilai Lelang Berjalan</span>
                <Briefcase className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">
                Rp {metrics.nilaiLelangBerjalan.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Miliar
              </span>
              <div className="text-[10px] text-blue-600 font-semibold mt-1.5 flex items-center gap-1">
                <span className="bg-blue-50 px-1 rounded font-mono">{metrics.totalTendersCount} Paket Aktif</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">Sistem SPSE v4.5</span>
              </div>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Efisiensi Pengadaan</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-2xl font-bold text-emerald-600 tracking-tight">
                Rp {metrics.efisiensiPengadaan.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Miliar
              </span>
              <div className="text-[10px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                <span className="text-slate-600 font-bold">Rerata Selisih Pagu-HPS</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-mono">Sisa Anggaran</span>
              </div>
            </div>
          </section>

          {/* Core Dynamic Body Content based on Tabs */}
          <div className="p-6 flex-1 flex flex-col gap-6">
            
            {/* TAB 1: DASHBOARD RINGKASAN */}
            {selectedTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Core Chart Section (8/12) */}
                <div className="col-span-1 lg:col-span-8 card flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[420px]">
                  <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3 bg-slate-50">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-slate-700 text-sm">Korelasi Anggaran & Implementasi Pengadaan</h3>
                      <p className="text-[11px] text-slate-500">Klik sektor untuk melihat detail alokasi vs realisasi lelang kontrak.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500"></span> Alokasi SIPD
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Kontrak SPSE (Realisasi)
                      </span>
                    </div>
                  </div>

                  {/* SVG & Responsive Bar Chart rendering */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="flex-1 min-h-[240px] relative flex items-end gap-3 sm:gap-4 px-2 pt-6">
                      {sectors.map(sec => {
                        const isSelected = selectedSectorId === sec.id;
                        // Calculate percentage of max budget allocation to draw high accuracy heights
                        const maxVal = 120; // Highest allocation is 114 (Pendidikan)
                        const alokasiHeight = (sec.alokasi / maxVal) * 100;
                        const kontrakHeight = (sec.kontrak / maxVal) * 100;
                        const gap = sec.alokasi - sec.kontrak;
                        const gapPercent = Math.round((gap / sec.alokasi) * 100);

                        return (
                          <div 
                            key={sec.id} 
                            onClick={() => setSelectedSectorId(isSelected ? null : sec.id)}
                            className={`flex-1 bg-slate-50/50 border border-slate-100 flex flex-col justify-end gap-1 px-1 sm:px-2 pb-1 h-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                              isSelected ? 'bg-blue-50/70 ring-2 ring-blue-400 border-blue-200' : 'hover:bg-slate-100/70'
                            }`}
                          >
                            {/* Bar Tooltip on Selection */}
                            {isSelected && (
                              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] py-1 px-3 rounded-md shadow-md z-20 flex gap-4">
                                <div><strong>Sektor:</strong> {sec.name}</div>
                                <div><strong>Pagu SIPD:</strong> Rp {sec.alokasi}M</div>
                                <div><strong>Kontrak SPSE:</strong> Rp {sec.kontrak}M</div>
                                <div><strong>Belum Terealisasi:</strong> {gapPercent}%</div>
                              </div>
                            )}

                            {/* Alokasi SIPD bar */}
                            <div 
                              className="w-full bg-blue-500/20 border-t-2 border-x border-blue-500/80 rounded-t-md flex items-end justify-center text-[10px] font-extrabold text-blue-700 pb-1 hover:bg-blue-500/30 transition-all shadow-inner"
                              style={{ height: `${alokasiHeight}%` }}
                              title={`${sec.name} - Alokasi SIPD: Rp ${sec.alokasi} Miliar`}
                            >
                              <span className="mb-1 leading-none">{sec.alokasi}B</span>
                            </div>

                            {/* Kontrak SPSE Realisasi bar */}
                            <div 
                              className="w-full bg-gradient-to-t from-amber-600 to-amber-500 border-t border-amber-400 rounded-t-md flex items-end justify-center text-[10px] font-extrabold text-white pb-1 hover:brightness-105 transition-all shadow-md"
                              style={{ height: `${kontrakHeight}%` }}
                              title={`${sec.name} - Kontrak Kontrak SPSE: Rp ${sec.kontrak} Miliar`}
                            >
                              <span className="mb-1 leading-none">{sec.kontrak}B</span>
                            </div>

                            {/* Sector Name label */}
                            <div className="text-center mt-2 border-t border-slate-100 pt-1">
                              <span className="text-[9px] font-bold text-slate-500 truncate block max-w-full tracking-tight">{sec.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Sector Drilldown or Dynamic Fiscal Analysis Statement */}
                    <div className="h-16 flex flex-col sm:flex-row sm:items-center px-4 bg-slate-50 rounded-lg border border-slate-200 mt-4 text-xs text-slate-600 gap-4 justify-between">
                      {selectedSector ? (
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">Analisis {selectedSector.name}:</span>
                            <span>Pagu Rp {selectedSector.alokasi}M teralisasi Rp {selectedSector.kontrak}M.</span>
                            <span className="font-bold text-amber-600">Sisa Pagu belum terserap: Rp {selectedSector.alokasi - selectedSector.kontrak} Miliar ({Math.round(((selectedSector.alokasi - selectedSector.kontrak)/selectedSector.alokasi)*100)}%).</span>
                          </div>
                          <button 
                            onClick={() => setSelectedTab('anggaran')}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Sesuaikan Anggaran <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <strong>Analisis Fiskal:</strong> Sektor pendidikan memiliki gap penyerapan belanja tertinggi (baru {Math.round((48/114)*100)}% terkontrak). Potensi keterlambatan pelaksanaan fisik tinggi pada Triwulan II & III.
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => {
                                setSelectedSectorId('2'); // Select Pendidikan
                                showNotification('Menampilkan visualisasi drilldown sektor Pendidikan.', 'info');
                              }}
                              className="font-bold text-blue-600 hover:text-blue-800 uppercase italic text-[11px] tracking-wider cursor-pointer hover:underline"
                            >
                              DETAIL PENDIDIKAN &gt;
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Latest Tenders Quick Panel (4/12) */}
                <div className="col-span-1 lg:col-span-4 card flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[420px]">
                  <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-slate-700 text-sm">Tracking Lelang SPSE (Terbaru)</h3>
                      <p className="text-[11px] text-slate-500">Log sinkronisasi tender teraktif saat ini.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingTender(null);
                        setTenderForm({
                          title: '',
                          pagu: 0,
                          hps: 0,
                          status: 'Pengumuman',
                          sector: 'INFRASTRUKTUR'
                        });
                        setShowTenderModal(true);
                      }}
                      className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-all flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>BUAT</span>
                    </button>
                  </div>

                  {/* Vertical list of latest tenders with custom status badges */}
                  <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-slate-100">
                    {tenders.slice(0, 5).map(t => (
                      <div key={t.id} className="p-4 hover:bg-slate-50/80 transition-all cursor-pointer relative group">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`status-badge text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            t.status === 'Tender Ulang' ? 'bg-red-50 text-red-700 border border-red-200' :
                            t.status === 'Penandatanganan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            t.status === 'Evaluasi Teknis' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            t.status === 'Selesai' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {t.status}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-400 font-mono">#{t.id}</span>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                              <button 
                                onClick={(e) => { e.stopPropagation(); startEditTender(t); }} 
                                className="p-0.5 hover:bg-slate-200 rounded text-slate-600"
                                title="Edit paket ini"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteTender(t.id); }} 
                                className="p-0.5 hover:bg-slate-200 rounded text-rose-600"
                                title="Hapus paket"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1 truncate" title={t.title}>
                          {t.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Sektor: <strong>{t.sector}</strong></span>
                          <span>Pagu: <strong>Rp {t.pagu.toLocaleString('id-ID')}</strong></span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 border-t border-dotted border-slate-100 pt-0.5">
                          <span>HPS: Rp {t.hps.toLocaleString('id-ID')}</span>
                          <span className="text-emerald-600 font-semibold font-mono">Efisiensi: Rp {(t.pagu - t.hps).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-50 mt-auto text-center border-t border-slate-200">
                    <button 
                      onClick={() => setSelectedTab('tender')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all flex items-center justify-center gap-1.5 w-full cursor-pointer"
                    >
                      Buka Portal SPSE Lhokseumawe (Kelola Semua Paket) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: MANAJEMEN ANGGARAN (Full interactive slider/controls editor) */}
            {selectedTab === 'anggaran' && (
              <div className="flex flex-col gap-6">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-700 text-sm mb-1">Penyelarasan Target Alokasi & Kontrak Sektoral (SIPD-SPSE)</h3>
                  <p className="text-xs text-slate-500">
                    Gunakan panel ini untuk mensimulasikan perubahan pagu sektoral atau mencatatkan realisasi kontrak baru. Seluruh dashboard utama, persentase realisasi, dan grafik interaktif akan terupdate secara real-time.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sectors.map(sec => {
                    const pct = sec.alokasi > 0 ? Math.round((sec.kontrak / sec.alokasi) * 100) : 0;
                    return (
                      <div key={sec.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                            <span className="text-xs font-extrabold text-slate-700 tracking-wider bg-slate-100 px-2 py-1 rounded">{sec.name}</span>
                            <span className="text-xs font-semibold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              Realisasi: {pct}%
                            </span>
                          </div>

                          {/* Allocation (Alokasi SIPD) Input */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-500 font-medium">Alokasi Anggaran (SIPD)</span>
                              <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                                <span className="text-slate-400 font-normal">Rp</span>
                                <input 
                                  type="number"
                                  min="1"
                                  max="500"
                                  value={sec.alokasi}
                                  onChange={(e) => handleSectorChange(sec.id, 'alokasi', Number(e.target.value))}
                                  className="w-16 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-400 bg-slate-50/50"
                                />
                                <span>Miliar</span>
                              </div>
                            </div>
                            <input 
                              type="range" 
                              min="10" 
                              max="200" 
                              value={sec.alokasi}
                              onChange={(e) => handleSectorChange(sec.id, 'alokasi', Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Realization (Kontrak SPSE) Input */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-500 font-medium">Realisasi Kontrak (SPSE)</span>
                              <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                                <span className="text-slate-400 font-normal">Rp</span>
                                <input 
                                  type="number"
                                  min="0"
                                  max={sec.alokasi}
                                  value={sec.kontrak}
                                  onChange={(e) => handleSectorChange(sec.id, 'kontrak', Number(e.target.value))}
                                  className="w-16 text-right border border-slate-200 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-400 bg-slate-50/50"
                                />
                                <span>Miliar</span>
                              </div>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max={sec.alokasi} 
                              value={sec.kontrak}
                              onChange={(e) => handleSectorChange(sec.id, 'kontrak', Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Sisa Anggaran Sektor:</span>
                          <strong className="font-mono text-slate-700">Rp {(sec.alokasi - sec.kontrak).toFixed(1)} Miliar</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Back to Dashboard shortcut */}
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => { setSelectedTab('dashboard'); showNotification('Menerapkan perubahan anggaran sementaramu ke visualisasi grafik.', 'success'); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs shadow hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Menerapkan dan Lihat Visualisasi Grafik</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DAFTAR PAKET SPSE (Fully features tender list, search, filter, add/edit) */}
            {selectedTab === 'tender' && (
              <div className="flex flex-col gap-6">
                
                {/* Search, Filter, Actions Bar */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    {/* Search Field */}
                    <div className="relative max-w-sm w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input 
                        type="text" 
                        placeholder="Cari nama paket atau ID tender..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-slate-50/50"
                      />
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                      >
                        <option value="Semua">Semua Status</option>
                        <option value="Tender Ulang">Tender Ulang</option>
                        <option value="Penandatanganan">Penandatanganan</option>
                        <option value="Evaluasi Teknis">Evaluasi Teknis</option>
                        <option value="Pengumuman">Pengumuman</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleExportData}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ekspor Data</span>
                    </button>

                    <button 
                      onClick={() => {
                        setEditingTender(null);
                        setTenderForm({
                          title: '',
                          pagu: 0,
                          hps: 0,
                          status: 'Pengumuman',
                          sector: 'INFRASTRUKTUR'
                        });
                        setShowTenderModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tambah Tender Baru</span>
                    </button>
                  </div>
                </div>

                {/* Tender Table Panel */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-4 w-28">ID Tender</th>
                          <th className="p-4 w-44">Sektor / Bidang</th>
                          <th className="p-4">Nama Paket Lelang</th>
                          <th className="p-4 text-right">Nilai Pagu</th>
                          <th className="p-4 text-right">Nilai HPS</th>
                          <th className="p-4 text-right">Efisiensi (Pagu-HPS)</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 w-24 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredTenders.length > 0 ? (
                          filteredTenders.map(t => {
                            const diff = t.pagu - t.hps;
                            const diffPercent = t.pagu > 0 ? ((diff / t.pagu) * 100).toFixed(1) : '0.0';
                            return (
                              <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                                <td className="p-4 font-mono font-medium text-slate-500">#{t.id}</td>
                                <td className="p-4">
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[9px]">
                                    {t.sector}
                                  </span>
                                </td>
                                <td className="p-4 font-semibold text-slate-800 break-words max-w-xs">{t.title}</td>
                                <td className="p-4 text-right font-mono font-semibold text-slate-700">
                                  Rp {t.pagu.toLocaleString('id-ID')}
                                </td>
                                <td className="p-4 text-right font-mono text-slate-500">
                                  Rp {t.hps.toLocaleString('id-ID')}
                                </td>
                                <td className="p-4 text-right font-mono text-emerald-600 font-semibold">
                                  <div className="flex flex-col items-end">
                                    <span>Rp {diff.toLocaleString('id-ID')}</span>
                                    <span className="text-[9px] font-bold text-emerald-500">({diffPercent}%)</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`status-badge text-[9px] px-2.5 py-1 rounded-full font-bold uppercase inline-block ${
                                    t.status === 'Tender Ulang' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                    t.status === 'Penandatanganan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    t.status === 'Evaluasi Teknis' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    t.status === 'Selesai' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    {t.status}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                      onClick={() => startEditTender(t)}
                                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                      title="Edit Paket"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteTender(t.id)}
                                      className="p-1 hover:bg-rose-50 rounded text-rose-600"
                                      title="Hapus Paket"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                              Tidak ada paket lelang yang cocok dengan kata kunci pencarian Anda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Table Footer Stats summary */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                    <div>
                      Menampilkan <strong>{filteredTenders.length}</strong> dari total <strong>{tenders.length}</strong> paket terdaftar di simulasi SPSE.
                    </div>
                    <div className="flex gap-4">
                      <span>Total Pagu Terhitung: <strong>Rp {(tenders.reduce((acc, curr) => acc + curr.pagu, 0) / 1000000000).toFixed(2)} Miliar</strong></span>
                      <span className="text-emerald-600">Total Akumulasi Efisiensi: <strong>Rp {(tenders.reduce((acc, curr) => acc + (curr.pagu - curr.hps), 0) / 1000000000).toFixed(2)} Miliar</strong></span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: SIMULASI & ANALISIS (Calculators & dynamic what-if simulation tool) */}
            {selectedTab === 'simulasi' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Simulation Control Panel (5/12) */}
                <div className="col-span-1 lg:col-span-5 card flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm p-5 gap-5">
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-1">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <span>Simulasi Target Efisiensi Fiskal</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Gunakan parameter kontrol di bawah ini untuk menguji bagaimana target penghematan pengadaan baru (selisih Pagu-HPS) mempengaruhi ketersediaan ruang fiskal Lhokseumawe.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                    {/* Slider for Target Efficiency Percentage */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-600 font-bold">Target Efisiensi Pengadaan (%)</span>
                        <span className="text-sm font-bold font-mono text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded">
                          {targetEfficiencyPercent}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="2" 
                        max="12" 
                        step="0.5"
                        value={targetEfficiencyPercent}
                        onChange={(e) => setTargetEfficiencyPercent(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>2.0% (Konservatif)</span>
                        <span>7.0% (Moderat)</span>
                        <span>12.0% (Agresif)</span>
                      </div>
                    </div>

                    <div className="bg-purple-50/40 border border-purple-100 p-4 rounded-lg flex flex-col gap-2.5 text-xs text-purple-950">
                      <div className="flex items-center gap-2 font-bold text-purple-900 border-b border-purple-100 pb-1.5">
                        <Percent className="w-4 h-4 text-purple-500" />
                        <span>Estimasi Ruang Fiskal Baru</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Pagu Lelang yang Direncanakan:</span>
                        <strong className="font-mono text-slate-800">Rp {metrics.nilaiLelangBerjalan.toFixed(1)} Miliar</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Efisiensi Pengadaan Saat Ini:</span>
                        <strong className="font-mono text-slate-800">Rp {metrics.efisiensiPengadaan.toFixed(2)} Miliar</strong>
                      </div>

                      <div className="flex justify-between items-center bg-purple-100/50 p-2 rounded">
                        <span className="font-bold text-purple-900">Potensi Tabungan Tambahan:</span>
                        <strong className="font-mono text-purple-800 text-sm">
                          Rp {Math.max(0, (metrics.nilaiLelangBerjalan * (targetEfficiencyPercent / 100)) - metrics.efisiensiPengadaan).toFixed(2)} Miliar
                        </strong>
                      </div>

                      <p className="text-[10px] text-purple-600 leading-normal mt-1 italic">
                        *Catatan: Sisa alokasi anggaran hasil efisiensi lelang SPSE dapat dialokasikan kembali pada APBK-Perubahan Lhokseumawe untuk membiayai program prioritas daerah.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fiscal Recommendations Output (7/12) */}
                <div className="col-span-1 lg:col-span-7 card flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm p-5 gap-4">
                  <h3 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Laporan & Rekomendasi Kebijakan Fiskal</span>
                  </h3>

                  <div className="flex flex-col gap-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-lg flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rasio Belanja Terkontrak</span>
                        <span className="text-lg font-bold text-slate-800 font-mono">
                          {((metrics.realisasiBelanja / metrics.totalPagu)*100).toFixed(1)}%
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">Total penyerapan APBK terhadap pagu konsolidasi.</p>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-lg flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gap Alokasi Sektoral Utama</span>
                        <span className="text-lg font-bold text-amber-600 font-mono">
                          Rp {(sectors.reduce((acc, curr) => acc + (curr.alokasi - curr.kontrak), 0)).toFixed(1)} Miliar
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">Total selisih anggaran yang belum memiliki kontrak pengadaan.</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="font-bold text-slate-800 text-xs">Poin Rekomendasi Penting:</h4>
                      
                      <div className="flex items-start gap-2.5">
                        <div className="p-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 shrink-0 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                        </div>
                        <div className="leading-relaxed">
                          <strong>Sektor Pendidikan:</strong> Menunjukkan tingkat penyerapan terendah (hanya {Math.round((48/114)*100)}% terealisasi). Disarankan untuk mempercepat evaluasi administrasi pada paket pengadaan alat peraga dan rehabilitasi sekolah guna menghindari keterlambatan serapan di akhir tahun anggaran.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="p-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                        <div className="leading-relaxed">
                          <strong>Sektor Kesehatan:</strong> Menunjukkan efektivitas penyerapan yang optimal ({Math.round((62/82)*100)}% terealisasi). Pola penjadwalan lelang pada sektor ini direkomendasikan untuk diterapkan sebagai model rujukan bagi dinas teknis lainnya.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="p-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 shrink-0 mt-0.5">
                          <Info className="w-3 h-3" />
                        </div>
                        <div className="leading-relaxed">
                          <strong>Optimasi Sisa Anggaran:</strong> Melalui pencapaian target efisiensi {targetEfficiencyPercent}%, Pemkot berpeluang menghemat tambahan dana segar sebesar <strong>Rp {Math.max(0, (metrics.nilaiLelangBerjalan * (targetEfficiencyPercent / 100)) - metrics.efisiensiPengadaan).toFixed(2)} Miliar</strong> untuk dialokasikan kembali pada APBK Perubahan.
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                      <button 
                        onClick={handleExportData}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs shadow hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Unduh Format Excel</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Persistent Footer */}
          <footer id="footer" className="h-8 bg-white border-t flex items-center px-6 justify-between text-[10px] text-slate-500 font-semibold mt-auto shrink-0 shadow-sm">
            <div>Sumber Data: Konsolidasi API Kemendagri SIPD & Inaproc LKPP SPSE v4.5</div>
            <div className="flex gap-4">
              <span>Transparansi: <strong className="text-emerald-600">98.4% (Sangat Baik)</strong></span>
              <span>Akuntabilitas Fiskal: <strong className="text-blue-600">Grade A-</strong></span>
              <span>Wilayah: <strong>Kota Lhokseumawe, Aceh</strong></span>
            </div>
          </footer>

        </main>
      </div>

      {/* Tender Add/Edit Slideover / Modal Overlay */}
      <AnimatePresence>
        {showTenderModal && (
          <div id="modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
            >
              <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>{editingTender ? `Edit Paket Lelang #${editingTender.id}` : 'Tambah Paket Lelang SPSE Baru'}</span>
                </h3>
                <button 
                  onClick={() => { setShowTenderModal(false); setEditingTender(null); }}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddOrEditTender} className="p-5 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Paket Pekerjaan</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Rehabilitasi Ruang Kelas SDN 4 Muara Dua"
                    value={tenderForm.title}
                    onChange={(e) => setTenderForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Sector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Sektor Alokasi</label>
                    <select 
                      value={tenderForm.sector}
                      onChange={(e) => setTenderForm(prev => ({ ...prev, sector: e.target.value }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="INFRASTRUKTUR">INFRASTRUKTUR</option>
                      <option value="PENDIDIKAN">PENDIDIKAN</option>
                      <option value="KESEHATAN">KESEHATAN</option>
                      <option value="SOSIAL">SOSIAL</option>
                      <option value="EKONOMI">EKONOMI</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Status Lelang SPSE</label>
                    <select 
                      value={tenderForm.status}
                      onChange={(e) => setTenderForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Pengumuman">Pengumuman</option>
                      <option value="Evaluasi Teknis">Evaluasi Teknis</option>
                      <option value="Penandatanganan">Penandatanganan</option>
                      <option value="Tender Ulang">Tender Ulang</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Pagu */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Pagu Anggaran (IDR)</label>
                    <input 
                      type="number"
                      required
                      min="100000"
                      placeholder="Nilai Pagu Pekerjaan"
                      value={tenderForm.pagu || ''}
                      onChange={(e) => setTenderForm(prev => ({ ...prev, pagu: Number(e.target.value) }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>

                  {/* HPS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nilai HPS (Harga Perkiraan Sendiri)</label>
                    <input 
                      type="number"
                      required
                      min="100000"
                      placeholder="Nilai HPS Pekerjaan"
                      value={tenderForm.hps || ''}
                      onChange={(e) => setTenderForm(prev => ({ ...prev, hps: Number(e.target.value) }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Selisih antara nilai Pagu dengan nilai HPS akan secara kumulatif menambah metrik <strong>Efisiensi Pengadaan</strong> pada dashboard utama sebagai bentuk optimalisasi penghematan anggaran belanja daerah.
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => { setShowTenderModal(false); setEditingTender(null); }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow hover:shadow-md"
                  >
                    {editingTender ? 'Simpan Perubahan' : 'Tambahkan Paket'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
