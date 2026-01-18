import { Link } from 'react-router-dom';
import { Search, Clock, MapPin, User, ChevronRight, Star, ShoppingBag, FileText, Image, PenTool, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-gray-900">

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container max-w-md mx-auto p-4 pb-2">
          {/* Top Bar: Location & User */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 font-extrabold text-xs tracking-widest text-gray-500 uppercase">
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-primary border-r-[6px] border-r-transparent"></div>
                Delivering to
              </div>
              <div className="flex items-center gap-1 font-bold text-lg leading-none cursor-pointer group">
                JIIT Sector 128 <ChevronRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <Link to="/login" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <User size={20} className="text-gray-700" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search 'Lab Manual', 'Notes'..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-sm"
            />
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-8">

        {/* Hero Banners (Carousel style) */}
        <section className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
          <div className="min-w-[85%] snap-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-[160px]">
            <div className="relative z-10">
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Fastest Delivery</span>
              <h2 className="text-2xl font-bold leading-tight mb-1">Print Lab <br />Manuals</h2>
              <p className="text-white/80 text-xs mb-4">Starting @ ₹2/page</p>
              <Link to="/order" className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold inline-block shadow-sm active:scale-95 transition-transform">
                Order Now
              </Link>
            </div>
            <FileText className="absolute right-[-10px] bottom-[-20px] opacity-20 rotate-12" size={120} />
          </div>

          <div className="min-w-[85%] snap-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-[160px]">
            <div className="relative z-10">
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Best Quality</span>
              <h2 className="text-2xl font-bold leading-tight mb-1">Color <br />Prints</h2>
              <p className="text-white/80 text-xs mb-4">For Projects & Posters</p>
              <Link to="/order" className="bg-white text-teal-600 px-4 py-2 rounded-lg text-xs font-bold inline-block shadow-sm active:scale-95 transition-transform">
                Upload Photo
              </Link>
            </div>
            <Image className="absolute right-[-10px] bottom-[-20px] opacity-20 rotate-12" size={120} />
          </div>
        </section>

        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Shop by Category</h3>
          </div>
          <div className="grid grid-cols-4 gap-x-2 gap-y-6">
            <CategoryItem icon={<FileText />} label="Documents" color="bg-blue-50 text-blue-600" />
            <CategoryItem icon={<BookOpen />} label="Lab Manuals" color="bg-orange-50 text-orange-600" />
            <CategoryItem icon={<Image />} label="Photos" color="bg-purple-50 text-purple-600" />
            <CategoryItem icon={<PenTool />} label="Binding" color="bg-pink-50 text-pink-600" />
          </div>
        </section>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 py-3 px-6 z-50 flex justify-between items-center text-xs font-medium text-gray-400">
        <Link to="/" className="flex flex-col items-center gap-1 text-primary">
          <ShoppingBag size={24} strokeWidth={2.5} />
          <span>Print</span>
        </Link>
        <Link to="/order" className="flex flex-col items-center gap-1 hover:text-gray-900 transition-colors">
          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg -mt-8 border-4 border-white">
            <span className="text-xl">+</span>
          </div>
          <span>Upload</span>
        </Link>
        <Link to={user?.role === 'vendor' ? "/vendor" : (user ? "/profile" : "/login")} className="flex flex-col items-center gap-1 hover:text-gray-900 transition-colors">
          <User size={24} />
          <span>{user?.role === 'vendor' ? 'Admin' : (user ? 'Account' : 'Profile')}</span>
        </Link>
      </div>

      {/* Floating Login for Students if not logged in */}
      {!user && (
        <div className="fixed bottom-20 right-6 z-40">
          <Link to="/login" className="bg-primary text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 animate-bounce">
            <User size={18} /> Student Login
          </Link>
        </div>
      )}

    </div>
  );
}

function CategoryItem({ icon, label, color }) {
  return (
    <Link to="/order" className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className={`w-[70px] h-[70px] rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-active:scale-95 ${color}`}>
        {icon}
      </div>
      <span className="text-[11px] font-bold text-center leading-tight text-gray-700">{label}</span>
    </Link>
  );
}

function ProductItem({ title, desc, price, badge, icon }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:border-primary/30 transition-colors relative overflow-hidden group">
      {badge && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg z-10">
          {badge}
        </div>
      )}
      <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-gray-500 mb-3 truncate">{desc}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{price}</span>
          <Link to="/order" className="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition-colors">
            ADD
          </Link>
        </div>
      </div>
    </div>
  );
}
