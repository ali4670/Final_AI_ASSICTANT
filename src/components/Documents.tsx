import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { parseFile } from '../lib/fileParser';
import { ArrowLeft, FileText, Trash2, MessageSquare, CreditCard, Brain, Loader, FileUp, Search, Plus, Table, FileCode } from 'lucide-react';

export default function Documents({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDocs(); }, [user]);

  const fetchDocs = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setDocs(data);
    setLoading(false);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await parseFile(file);
      setTitle(file.name);
      setContent(res.content);
    } catch (err: any) { alert(err.message); }
    setUploading(false);
  };

  const saveToDB = async () => {
    const { data, error } = await supabase.from('documents').insert([{
      user_id: user?.id, title, content, file_type: title.split('.').pop()
    }]).select().single();
    if (!error) { setDocs([data, ...docs]); setTitle(''); setContent(''); }
    else alert(error.message);
  };

  const generateCards = async (doc: any) => {
    setGenerating(doc.id);
    try {
      const res = await fetch('http://localhost:4000/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentContent: doc.content, title: doc.title }),
      });
      const aiCards = await res.json();
      await supabase.from('flashcards').insert(aiCards.map((c: any) => ({
        ...c, user_id: user?.id, document_id: doc.id, difficulty: 'easy'
      })));

      // Navigate specifically to this document's cards
      onNavigate('flashcards', doc.id);
    } catch (err) { alert("Server Error"); }
    setGenerating(null);
  };

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <nav className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft /></button>
            <h1 className="font-bold text-xl">My Library</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-100 rounded-full border-none text-sm w-64 focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border h-fit sticky top-24">
            <h2 className="font-bold mb-4 flex items-center gap-2"><FileUp size={18} className="text-blue-500"/> Upload File</h2>
            <label className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all">
              {uploading ? <Loader className="animate-spin text-blue-500" /> : <><Plus className="text-slate-400"/><p className="text-xs font-bold text-slate-500 mt-2 uppercase">PDF, Word, Excel, TXT</p></>}
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt" />
            </label>
            {content && (
                <div className="mt-4 space-y-3 animate-in fade-in">
                  <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={title} onChange={e => setTitle(e.target.value)} />
                  <button onClick={saveToDB} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Save to Library</button>
                </div>
            )}
          </aside>

          <section className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(doc => (
                <div key={doc.id} className="bg-white p-6 rounded-2xl border hover:shadow-xl transition-all group">
                  <div className="flex justify-between mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50">
                      {doc.title.endsWith('.pdf') ? <FileText className="text-red-500" /> : <FileCode className="text-blue-500" />}
                    </div>
                    <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('documents').delete().eq('id', doc.id); fetchDocs(); }}} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  <h3 className="font-bold text-slate-800 line-clamp-1">{doc.title}</h3>
                  <div className="mt-6 flex gap-2">
                    <button onClick={() => onNavigate('chat', doc.id)} className="flex-1 bg-slate-50 hover:bg-indigo-50 p-2 rounded-xl flex flex-col items-center gap-1">
                      <MessageSquare size={16} /><span className="text-[9px] font-black uppercase">Chat</span>
                    </button>
                    <button onClick={() => generateCards(doc)} disabled={!!generating} className="flex-1 bg-slate-900 text-white hover:bg-blue-600 p-2 rounded-xl flex flex-col items-center gap-1 transition-colors">
                      {generating === doc.id ? <Loader size={16} className="animate-spin" /> : <CreditCard size={16} />}
                      <span className="text-[9px] font-black uppercase">Cards</span>
                    </button>
                    <button
                        onClick={() => onNavigate('quizzes', doc.id)} // CHANGED THIS LINE
                        className="flex-1 bg-slate-50 hover:bg-purple-50 p-2 rounded-xl flex flex-col items-center gap-1"
                    >
                      <Brain size={16} />
                      <span className="text-[9px] font-black uppercase">Study</span>
                    </button>
                  </div>
                </div>
            ))}
          </section>
        </main>
      </div>
  );
}