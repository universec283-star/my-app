
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Navigation, Map as MapIcon, Loader2, Compass, 
  AlertCircle, Info, LocateFixed, Sparkles, Home, QrCode, 
  X, Share2, Copy, Check, Link as LinkIcon, Edit3, 
  Download, HelpCircle, MapPin, RefreshCw
} from 'lucide-react';
import { fetchPlaces } from './services/geminiService';
import { PlaceResult, UserLocation, Category } from './types';
import PlaceCard from './components/PlaceCard';
import QRCode from 'qrcode';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; places: PlaceResult[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'found' | 'denied' | 'idle'>('idle');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>(window.location.href);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const initLocation = useCallback((force: boolean = false) => {
    setGpsStatus('searching');
    if (!navigator.geolocation) {
      setError("သင့် Browser က တည်နေရာကို အားမပေးပါ။");
      setGpsStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGpsStatus('found');
        setError(null);
      },
      (err) => {
        console.warn("Location error:", err);
        setGpsStatus('denied');
        if (force) {
          setError("Chrome Settings > Site Settings > Location တွင် ခွင့်ပြုချက် ပေးရန် လိုအပ်ပါသည်။");
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  useEffect(() => {
    if (showQrModal) {
      QRCode.toDataURL(shareUrl, { width: 600, margin: 2 })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [showQrModal, shareUrl]);

  const handleSearch = async (q: string) => {
    const searchTerm = q || query;
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlaces(searchTerm, location);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "ရှာဖွေမှု အဆင်မပြေပါ။");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3 flex items-center justify-between pt-safe">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-none">မြစ်ကြီးနားလမ်းညွှန်</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${gpsStatus === 'found' ? 'bg-green-500' : 'bg-orange-400'}`} />
              {gpsStatus === 'found' ? 'GPS Active' : 'City Center Mode'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHelpModal(true)} className="p-2 text-slate-500 active:bg-slate-100 rounded-full"><HelpCircle className="w-5 h-5" /></button>
          <button onClick={() => setShowQrModal(true)} className="p-2 text-blue-600 bg-blue-50 rounded-full"><QrCode className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 overflow-y-auto pb-32">
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="ဘာရှာချင်လဲ? (ဥပမာ- ကော်ဖီဆိုင်)"
            className="w-full bg-white border-none shadow-xl shadow-slate-200/60 rounded-2xl p-4 pr-14 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button 
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="absolute right-2 top-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {Object.values(Category).map((cat) => (
            <button 
              key={cat} 
              onClick={() => { setQuery(cat); handleSearch(cat); }}
              className="whitespace-nowrap px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 shadow-sm active:bg-blue-600 active:text-white transition-all"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Welcome Card */}
        {!results && !loading && !error && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
              <h2 className="text-xl font-black mb-2">မင်္ဂလာပါ</h2>
              <p className="text-xs text-blue-100 font-medium leading-relaxed opacity-90 mb-5">
                မြစ်ကြီးနားမြို့အတွင်းရှိ စားသောက်ဆိုင်များ၊ ဘဏ်များ နှင့် အထင်ကရနေရာများကို AI စနစ်ဖြင့် အလွယ်တကူ ရှာဖွေနိုင်ပါသည်။
              </p>
              <button 
                onClick={() => handleSearch("မြစ်ကြီးနားရှိ စိတ်ဝင်စားဖွယ်နေရာများ")}
                className="w-full py-3.5 bg-white text-blue-700 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" /> အနီးနားရှိနေရာများရှာမည်
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => initLocation(true)} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 active:bg-slate-50">
                <div className="p-2 bg-green-50 rounded-lg"><LocateFixed className="w-5 h-5 text-green-600" /></div>
                <span className="text-[10px] font-black text-slate-500 uppercase">GPS Refresh</span>
              </button>
              <button onClick={() => setShowHelpModal(true)} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 active:bg-slate-50">
                <div className="p-2 bg-blue-50 rounded-lg"><Info className="w-5 h-5 text-blue-600" /></div>
                <span className="text-[10px] font-black text-slate-500 uppercase">How to use</span>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3 animate-in shake duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs font-bold text-red-700 leading-relaxed">{error}</p>
              <button onClick={() => handleSearch(query)} className="text-[10px] font-black text-red-600 underline uppercase tracking-wider">ထပ်မံကြိုးစားမည်</button>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">AI Expert Summary</span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{results.text}</p>
            </div>
            
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Found {results.places.length} Locations</h3>
              <div className="h-px bg-slate-200 flex-1 ml-4" />
            </div>

            <div className="space-y-3">
              {results.places.map((place, i) => (
                <PlaceCard key={i} place={place} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Menu */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-6 pt-2 z-40">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-2 flex items-center justify-between">
          <button onClick={() => { setResults(null); setQuery(''); }} className={`flex-1 flex flex-col items-center gap-1 py-1 ${!results ? 'text-blue-600' : 'text-slate-400'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Home</span>
          </button>
          
          <button 
            onClick={() => handleSearch("အနီးနားရှိ ထင်ရှားသောနေရာများ")}
            className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center -mt-10 border-4 border-slate-50 shadow-xl shadow-blue-200 active:scale-90 transition-all"
          >
            <MapPin className="w-6 h-6" />
          </button>

          <button 
            onClick={() => window.open(`https://www.google.com/maps/search/Myitkyina+${query || 'landmark'}`, '_blank')}
            className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-400"
          >
            <MapIcon className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Live Map</span>
          </button>
        </div>
      </nav>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
          <div className="relative bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center">
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-slate-400"><X /></button>
            <h3 className="text-lg font-black text-slate-900 mb-1">လူတိုင်းသုံးနိုင်အောင် မျှဝေပါ</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">Scan to open the app</p>
            <div className="bg-slate-50 p-4 rounded-2xl mb-4">
              {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-full h-auto" />}
            </div>
            <button 
              onClick={copyLink}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Link ကူးမည်'}
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHelpModal(false)} />
          <div className="relative bg-white w-full rounded-3xl p-7 shadow-2xl">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-slate-400"><X /></button>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-600" /> အကူအညီ
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">၁</div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Chrome မှာ Location ဖွင့်နည်း</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Chrome ၏ Address Bar ဘေးရှိ Lock ပုံစံကို နှိပ်ပြီး <b>Location</b> ကို <b>Allow</b> ပေးပါ။ ထို့နောက် Page ကို Refresh လုပ်ပါ။</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">၂</div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">ရှာဖွေနည်း</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">မြန်မာလိုဖြစ်စေ၊ အင်္ဂလိပ်လိုဖြစ်စေ "ဘဏ်" ၊ "ဆေးရုံ" စသည်ဖြင့် ရိုက်ထည့်ရှာဖွေနိုင်ပါသည်။</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">၃</div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">လမ်းညွှန်ချက်ရယူရန်</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">တွေ့ရှိသောနေရာများ၏ မြေပုံခလုတ်ကို နှိပ်လိုက်လျှင် Google Maps သို့ အလိုအလျောက် ရောက်ရှိသွားမည်ဖြစ်သည်။</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowHelpModal(false)} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm">နားလည်ပါပြီ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
