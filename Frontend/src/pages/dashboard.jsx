import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../service/api';
import { LogOut, Plus, Search, LayoutGrid, List, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { getErrorMessage } from '../service/errors';

const ACCENTS = ['bg-amber-400', 'bg-emerald-400', 'bg-sky-400', 'bg-rose-400', 'bg-violet-400', 'bg-teal-400'];

const accentFor = (id = '') => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return ACCENTS[sum % ACCENTS.length];
};

const countWords = (text = '') => text.trim().split(/\s+/).filter(Boolean).length;

/* ---------- Count-up number ---------- */
const useCountUp = (target, duration = 900) => {
    const [value, setValue] = useState(0);
    const last = useRef(0);

    useEffect(() => {
        const from = last.current;
        const start = performance.now();
        let raf;
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const next = Math.round(from + (target - from) * eased);
            setValue(next);
            last.current = next;
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return value;
};

/* ---------- Live clock (isolated so the dashboard doesn't re-render every second) ---------- */
const Clock = ({ className = '' }) => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return <span className={className}>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
};

/* ---------- Stat card ---------- */
const StatCard = ({ label, children, delay = 0, hint }) => (
    <div
        className="dash-in group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-[#fffefa]/90 p-6 shadow-[0_2px_6px_rgba(55,45,28,0.04),0_12px_28px_rgba(55,45,28,0.055)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(55,45,28,0.07),0_20px_40px_rgba(55,45,28,0.09)] dark:border-white/10 dark:bg-[#151515]/90 dark:shadow-none"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-amber-200/10" />
        <p className="relative text-xs font-medium uppercase tracking-[0.18em] text-gray-400">{label}</p>
        <div className="relative mt-3">{children}</div>
        {hint && <p className="relative mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
);

/* ---------- Note card ---------- */
const NoteCard = ({ note, index, onEdit, onDelete }) => {
    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--cx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--cy', `${e.clientY - r.top}px`);
    };

    const words = countWords(`${note.title} ${note.description || ''}`);

    return (
        <article
            onMouseMove={onMove}
            style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
            className="dash-in group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-[#fffefa] p-6 shadow-[0_2px_6px_rgba(55,45,28,0.035),0_10px_26px_rgba(55,45,28,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_18px_rgba(55,45,28,0.07),0_24px_44px_rgba(55,45,28,0.1)] dark:border-white/10 dark:bg-[#151515] dark:shadow-none dark:hover:border-white/20 dark:hover:shadow-black/30"
        >
            {/* Cursor spotlight */}
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:hidden"
                style={{ background: 'radial-gradient(260px circle at var(--cx,50%) var(--cy,50%), rgba(251,191,36,0.20), transparent 70%)' }}
            />
            <div
                className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:block"
                style={{ background: 'radial-gradient(260px circle at var(--cx,50%) var(--cy,50%), rgba(255,255,255,0.07), transparent 70%)' }}
            />

            {/* Accent bar */}
            <span className={`absolute left-0 top-6 h-8 w-[3px] rounded-r-full ${accentFor(note._id)} transition-all duration-300 group-hover:h-12`} />

            <div className="relative">
                <div className="flex items-start justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => onEdit(note)}
                        aria-label={`Edit note: ${note.title}`}
                        className="min-w-0 flex-1 wrap-break-word text-left text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                        {note.title}
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(note._id);
                        }}
                        aria-label={`Delete note: ${note.title}`}
                        className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-60 transition hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 group-hover:opacity-100"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => onEdit(note)}
                    aria-label={`Edit note: ${note.title}`}
                    className="mt-3 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                    <span className="line-clamp-4 block min-h-12 wrap-break-word text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {note.description || 'No description'}
                    </span>
                    <span className="mt-6 flex items-center justify-between border-t border-black/5 pt-4 text-xs text-gray-400 dark:border-white/10">
                        <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}</span>
                        <span>{words} {words === 1 ? 'word' : 'words'}</span>
                    </span>
                </button>
            </div>
        </article>
    );
};

const SkeletonCard = ({ i }) => (
    <div
        className="animate-pulse rounded-2xl border border-stone-200/80 bg-[#fffefa] p-6 dark:border-white/10 dark:bg-[#151515]"
        style={{ animationDelay: `${i * 120}ms` }}
    >
        <div className="h-4 w-2/3 rounded bg-stone-200 dark:bg-white/10" />
        <div className="mt-5 h-3 w-full rounded bg-stone-100 dark:bg-white/5" />
        <div className="mt-2 h-3 w-5/6 rounded bg-stone-100 dark:bg-white/5" />
        <div className="mt-2 h-3 w-1/2 rounded bg-stone-100 dark:bg-white/5" />
        <div className="mt-8 h-3 w-1/4 rounded bg-stone-100 dark:bg-white/5" />
    </div>
);

const Dashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadError, setLoadError] = useState('');
    const [notesLoading, setNotesLoading] = useState(true);
    const [modalError, setModalError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [sort, setSort] = useState('newest');
    const [view, setView] = useState('grid');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const rootRef = useRef(null);
    const searchRef = useRef(null);

    const fetchNotes = useCallback(async () => {
        setNotesLoading(true);
        setLoadError('');
        try {
            const response = await api.get('/notes/getall');
            setNotes(response.data.notes);
        } catch (error) {
            setLoadError(getErrorMessage(error, 'Unable to load your notes. Please try again.'));
        } finally {
            setNotesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    useEffect(() => {
        if (!showModal) return undefined;
        function handleEscape(event) {
            if (event.key === 'Escape' && !isSaving) {
                setShowModal(false);
                setEditingNoteId(null);
                setModalError('');
            }
        }
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [showModal, isSaving]);

    /* Keyboard shortcuts: "n" = new note, "/" = focus search */
    useEffect(() => {
        function onKey(e) {
            if (showModal || e.metaKey || e.ctrlKey || e.altKey) return;
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
            if (e.key === 'n') {
                e.preventDefault();
                handleNewNote();
            } else if (e.key === '/') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showModal]);

    function handleMouseMove(e) {
        const el = rootRef.current;
        if (!el) return;
        el.style.setProperty('--px', `${e.clientX}px`);
        el.style.setProperty('--py', `${e.clientY}px`);
    }

    function handleNewNote() {
        setEditingNoteId(null);
        setTitle('');
        setDescription('');
        setModalError('');
        setShowModal(true);
    }

    function handleEditNote(note) {
        setEditingNoteId(note._id);
        setTitle(note.title);
        setDescription(note.description || '');
        setModalError('');
        setShowModal(true);
    }

    function handleCloseModal() {
        setShowModal(false);
        setEditingNoteId(null);
        setTitle('');
        setDescription('');
        setModalError('');
    }

    async function handleCreateNote(e) {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            setModalError('');
            setIsSaving(true);
            if (editingNoteId) {
                const response = await api.patch(
                    `/notes/update/${editingNoteId}`,
                    { title: title.trim(), description }
                );

                setNotes(prev =>
                    prev.map(note =>
                        note._id === editingNoteId
                            ? response.data.note
                            : note
                    )
                );
            } else {
                const response = await api.post('/notes/create', {
                    title: title.trim(),
                    description
                });

                setNotes(prev => [response.data.note, ...prev]);
            }

            handleCloseModal();

        } catch (error) {
            setModalError(getErrorMessage(error, 'Unable to save this note. Please try again.'));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteNote(id) {
        try {
            setErrorMessage('');
            await api.delete(`/notes/delete/${id}`);
            setNotes(prev => prev.filter(note => note._id !== id));
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Unable to delete this note. Please try again.'));
        }
    }

    // Logout functionality
    async function handleLogout() {
        try {
            await api.post('/auth/logout');
            setUser(null);
            navigate('/login', { replace: true });
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Unable to log out. Please try again.'));
        }
    }

    const visibleNotes = useMemo(() => {
        const q = search.toLowerCase();
        const filtered = notes.filter(note =>
            note.title.toLowerCase().includes(q) ||
            (note.description || '').toLowerCase().includes(q)
        );
        const time = (n) => (n.createdAt ? new Date(n.createdAt).getTime() : 0);
        const sorted = [...filtered];
        if (sort === 'newest') sorted.sort((a, b) => time(b) - time(a));
        if (sort === 'oldest') sorted.sort((a, b) => time(a) - time(b));
        if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title));
        return sorted;
    }, [notes, search, sort]);

    const totalWords = useMemo(
        () => notes.reduce((sum, n) => sum + countWords(`${n.title} ${n.description || ''}`), 0),
        [notes]
    );

    const latest = useMemo(() => {
        if (!notes.length) return null;
        return notes.reduce((a, b) =>
            (new Date(b.createdAt || 0) > new Date(a.createdAt || 0) ? b : a)
        );
    }, [notes]);

    const totalCount = useCountUp(notes.length);
    const wordCount = useCountUp(totalWords);

    const hour = new Date().getHours();
    const greeting = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Good night';
    const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    const username = user?.username || 'there';

    return (
        <div
            ref={rootRef}
            onMouseMove={handleMouseMove}
            style={{ '--px': '50vw', '--py': '30vh' }}
            className="relative min-h-screen bg-[#f3f0e9] text-stone-900 transition-colors dark:bg-[#090909] dark:text-white"
        >
            <style>{`
                @keyframes dashIn { from { opacity:0; transform:translateY(18px) scale(.98);} to { opacity:1; transform:translateY(0) scale(1);} }
                @keyframes modalIn { from { opacity:0; transform:translateY(16px) scale(.96);} to { opacity:1; transform:translateY(0) scale(1);} }
                @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
                @keyframes blob { 0%,100% { transform:translate(0,0) scale(1);} 33% { transform:translate(40px,-30px) scale(1.1);} 66% { transform:translate(-30px,30px) scale(.95);} }
                @keyframes floatY { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-10px);} }
                @keyframes wave { 0%,100% { transform:rotate(0);} 20% { transform:rotate(16deg);} 40% { transform:rotate(-8deg);} 60% { transform:rotate(14deg);} 80% { transform:rotate(-4deg);} }
                .dash-in { opacity:0; animation: dashIn .7s cubic-bezier(.2,.7,.2,1) forwards; }
                .modal-in { animation: modalIn .35s cubic-bezier(.2,.8,.2,1) both; }
                .fade-in { animation: fadeIn .25s ease-out both; }
                .blob { animation: blob 18s ease-in-out infinite; }
                .float-y { animation: floatY 5s ease-in-out infinite; }
                .wave { display:inline-block; transform-origin:70% 70%; animation: wave 2.4s ease-in-out 1s 1; }
                @media (prefers-reduced-motion: reduce) {
                    .dash-in { animation:none; opacity:1; }
                    .modal-in,.fade-in,.blob,.float-y,.wave { animation:none; }
                }
            `}</style>

            {/* ---------- Ambient background ---------- */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="blob absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-200/10" />
                <div className="blob absolute -bottom-24 right-0 h-[28rem] w-[28rem] rounded-full bg-stone-300/60 blur-3xl dark:bg-white/5" style={{ animationDelay: '-7s' }} />
                <div
                    className="absolute inset-0 opacity-30 dark:opacity-[0.08]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(120,113,108,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,0.14) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                        maskImage: 'radial-gradient(ellipse at 60% 30%, black 20%, transparent 75%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at 60% 30%, black 20%, transparent 75%)',
                    }}
                />
                <div className="absolute inset-0 dark:hidden" style={{ background: 'radial-gradient(480px circle at var(--px) var(--py), rgba(251,191,36,0.14), transparent 65%)' }} />
                <div className="absolute inset-0 hidden dark:block" style={{ background: 'radial-gradient(480px circle at var(--px) var(--py), rgba(255,255,255,0.05), transparent 65%)' }} />
                <div
                    className="absolute inset-0 opacity-[0.045] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                    }}
                />
            </div>

            {/* Mobile Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-200/80 bg-[#fcfbf8]/90 px-4 py-3 pr-16 backdrop-blur-md md:hidden dark:border-white/10 dark:bg-[#151515]/90">
                <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold tracking-tight">
                        notes<span className="text-gray-400">.</span>
                    </h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="ml-3 flex h-9 items-center gap-2 rounded-lg px-2 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
                    aria-label="Logout"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </header>

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-stone-200/80 bg-[#fcfbf8]/85 px-7 py-8 shadow-[8px_0_30px_rgba(55,45,28,0.035)] backdrop-blur-xl md:flex md:flex-col dark:border-white/10 dark:bg-[#151515]/85 dark:shadow-none">

                <div className="mb-12">
                    <h1 className="text-2xl font-bold tracking-tight">
                        notes<span className="text-gray-400">.</span>
                    </h1>
                    <p className="mt-1 text-xs tracking-widest text-gray-400 uppercase">
                        Your personal space
                    </p>
                </div>

                <p className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase">
                    Workspace
                </p>

                <div className="flex items-center gap-3 rounded-xl bg-stone-900 px-4 py-3 text-sm text-white shadow-[0_6px_16px_rgba(41,37,36,0.18)] dark:bg-black">
                    <span className="text-lg">▤</span>
                    All Notes
                    <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-xs text-gray-200">
                        {notes.length}
                    </span>
                </div>

                {/* Today card */}
                <div className="mt-8 rounded-2xl border border-stone-200/80 bg-[#fffefa]/80 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Today</p>
                    <Clock className="mt-2 block text-3xl font-semibold tracking-tight" />
                    <p className="mt-1 text-xs text-gray-400">{dateLabel}</p>
                </div>

                {/* Shortcuts */}
                <div className="mt-6 space-y-2.5 text-xs text-gray-400">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Shortcuts</p>
                    <p className="flex items-center justify-between">
                        New note
                        <kbd className="rounded-md border border-stone-300 bg-[#fffefa] px-1.5 py-0.5 font-sans text-[10px] text-stone-500 dark:border-white/15 dark:bg-white/5 dark:text-gray-300">N</kbd>
                    </p>
                    <p className="flex items-center justify-between">
                        Search
                        <kbd className="rounded-md border border-stone-300 bg-[#fffefa] px-1.5 py-0.5 font-sans text-[10px] text-stone-500 dark:border-white/15 dark:bg-white/5 dark:text-gray-300">/</kbd>
                    </p>
                </div>

                <div className="mt-auto border-t border-black/10 pt-6 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-medium text-white ring-2 ring-amber-300/60 dark:bg-black">
                            {(user?.username || 'U')[0].toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {user?.username || 'User'}
                            </p>
                            <p className="text-xs text-gray-400">
                                Personal account
                            </p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="mt-6 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

            </aside>

            {/* Main Content */}
            <main className="relative z-10 px-4 py-6 sm:px-5 md:ml-64 md:px-12 md:py-10 lg:px-16">

                {/* Header */}
                <header className="dash-in flex items-start justify-between gap-3 border-b border-stone-300/80 pb-6 sm:items-center sm:gap-5 md:pb-8 dark:border-white/10">

                    <div>
                        <p className="text-xs font-medium tracking-[0.18em] text-gray-400 uppercase">
                            {dateLabel}
                        </p>

                        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl md:text-5xl">
                            {greeting}, <span className="font-serif italic">{username}</span>
                            <span className="wave ml-2 text-2xl md:text-4xl">👋</span>
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            A little space for everything on your mind.
                        </p>
                    </div>

                    <button
                        onClick={handleNewNote}
                        className="group flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-3.5 py-2.5 text-sm font-medium text-white shadow-[0_5px_12px_rgba(41,37,36,0.12),0_12px_28px_rgba(41,37,36,0.12)] transition hover:-translate-y-0.5 hover:bg-stone-800 active:scale-95 sm:px-5 sm:py-3 dark:bg-black dark:shadow-lg dark:shadow-black/10 dark:hover:bg-gray-800"
                    >
                        <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
                        <span className="hidden sm:inline">New Note</span>
                    </button>

                </header>

                <Feedback message={errorMessage} onDismiss={() => setErrorMessage('')} />

                {/* Stats */}
                <section className="my-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StatCard label="Total Notes" delay={100}>
                        <h3 className="text-4xl font-semibold tabular-nums">{totalCount}</h3>
                    </StatCard>

                    <StatCard label="Words Written" delay={180}>
                        <h3 className="text-4xl font-semibold tabular-nums">{wordCount}</h3>
                    </StatCard>

                    <StatCard label="Latest Note" delay={260} hint={latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString() : 'Nothing yet'}>
                        <h3 className="truncate text-xl font-semibold leading-10">{latest ? latest.title : '—'}</h3>
                    </StatCard>

                    <StatCard label="Your Workspace" delay={340} hint="Private to you">
                        <h3 className="text-xl font-semibold leading-10">Personal</h3>
                    </StatCard>

                </section>

                {/* Notes Section */}
                <section>
                    {loadError && (
                        <div>
                            <Feedback message={loadError} />
                            <button
                                type="button"
                                onClick={fetchNotes}
                                className="mb-5 text-sm font-semibold underline underline-offset-4 hover:text-gray-500"
                            >
                                Try loading notes again
                            </button>
                        </div>
                    )}

                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

                        <div>
                            <h3 className="text-lg font-semibold">
                                All Notes
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                                {search
                                    ? `${visibleNotes.length} ${visibleNotes.length === 1 ? 'result' : 'results'} for “${search}”`
                                    : 'Your thoughts, organised.'}
                            </p>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    aria-label="Search notes"
                                    placeholder="Search notes..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full rounded-xl border border-stone-200 bg-[#fffefa] py-3 pl-10 pr-10 text-sm outline-none shadow-[0_2px_8px_rgba(55,45,28,0.045)] transition placeholder:text-gray-400 focus:border-stone-400 focus:shadow-[0_0_0_4px_rgba(28,25,23,0.05)] dark:border-white/10 dark:bg-[#151515] dark:shadow-none dark:placeholder:text-gray-500 dark:focus:border-white"
                                />
                                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-stone-300 px-1.5 py-0.5 font-sans text-[10px] text-gray-400 sm:block dark:border-white/15">/</kbd>
                            </div>

                            <select
                                aria-label="Sort notes"
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                                className="rounded-xl border border-stone-200 bg-[#fffefa] px-3 py-3 text-sm outline-none transition focus:border-stone-400 dark:border-white/10 dark:bg-[#151515] dark:focus:border-white"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="az">A → Z</option>
                            </select>

                            <div className="flex rounded-xl border border-stone-200 bg-[#fffefa] p-1 dark:border-white/10 dark:bg-[#151515]">
                                <button
                                    type="button"
                                    onClick={() => setView('grid')}
                                    aria-label="Grid view"
                                    aria-pressed={view === 'grid'}
                                    className={`rounded-lg p-2 transition ${view === 'grid' ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'text-gray-400 hover:text-stone-900 dark:hover:text-white'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    aria-label="List view"
                                    aria-pressed={view === 'list'}
                                    className={`rounded-lg p-2 transition ${view === 'list' ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'text-gray-400 hover:text-stone-900 dark:hover:text-white'}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>

                    </div>

                    {notesLoading ? (
                        <div role="status" aria-label="Loading your notes" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {[0, 1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} i={i} />)}
                            <span className="sr-only">Loading your notes…</span>
                        </div>
                    ) : loadError ? null : visibleNotes.length === 0 ? (

                        /* Empty State */
                        <div className="dash-in flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 px-6 text-center shadow-[0_8px_28px_rgba(55,45,28,0.045)] dark:border-white/15 dark:bg-[#151515]/80 dark:shadow-none" style={{ background: 'linear-gradient(to bottom, rgba(255,254,250,0.9), rgba(249,246,239,0.9))' }}>

                            <div className="float-y mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f5f5] text-3xl text-gray-700 shadow-[0_8px_20px_rgba(55,45,28,0.1)] dark:bg-white/10 dark:text-amber-200">
                                ▤
                            </div>

                            <h3 className="text-lg font-semibold">
                                {search ? 'No notes found' : 'Nothing here yet'}
                            </h3>

                            <p className="mt-2 max-w-xs text-sm leading-6 text-gray-400">
                                {search
                                    ? 'Try searching with a different keyword.'
                                    : 'Your workspace is waiting. Create your first note and get your thoughts organised.'
                                }
                            </p>

                            {!search && (
                                <button
                                    onClick={handleNewNote}
                                    className="mt-6 text-sm font-semibold underline underline-offset-4 transition hover:text-gray-500"
                                >
                                    Create your first note
                                </button>
                            )}

                        </div>

                    ) : (

                        <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid grid-cols-1 gap-4'}>

                            {visibleNotes.map((note, i) => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    index={i}
                                    onEdit={handleEditNote}
                                    onDelete={handleDeleteNote}
                                />
                            ))}

                        </div>

                    )}

                </section>

                {/* Footer */}
                <footer className="mt-16 border-t border-stone-300/80 pt-6 text-center text-xs text-gray-400 dark:border-white/10">
                    Made for your thoughts. © 2026 Notes.
                </footer>

            </main>

            {/* Create / Edit Note Modal */}
            {showModal && (

                <div
                    className="fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget && !isSaving) handleCloseModal();
                    }}
                >

                    <form
                        onSubmit={handleCreateNote}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="note-modal-title"
                        className="modal-in my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-black/10 bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-7 dark:border-white/10 dark:bg-[#151515]"
                    >

                        <Feedback message={modalError} onDismiss={() => setModalError('')} />

                        <div className="mb-7 flex items-center justify-between">
                            <div>
                                <h2 id="note-modal-title" className="text-xl font-semibold">
                                    {editingNoteId ? 'Edit Note' : <>Create a <span className="font-serif italic">note</span></>}
                                </h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    {editingNoteId
                                        ? 'Make changes to your note.'
                                        : "Capture what's on your mind."
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="Close note editor"
                                disabled={isSaving}
                                className="text-2xl text-gray-400 transition hover:rotate-90 hover:text-black dark:hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-2 flex items-center justify-between">
                            <label htmlFor="note-title" className="block text-sm font-medium">
                                Title
                            </label>
                            <span className="text-[11px] text-gray-400">{title.length}/160</span>
                        </div>

                        <input
                            id="note-title"
                            autoFocus
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Give your note a title"
                            maxLength={160}
                            className="mb-5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(28,25,23,0.06)] dark:border-white/10 dark:bg-[#202020] dark:focus:border-white/60 dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
                            required
                        />

                        <div className="mb-2 flex items-center justify-between">
                            <label htmlFor="note-description" className="block text-sm font-medium">
                                Description
                            </label>
                            <span className="text-[11px] text-gray-400">
                                {countWords(description)} {countWords(description) === 1 ? 'word' : 'words'}
                            </span>
                        </div>

                        <textarea
                            id="note-description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Start writing..."
                            rows="5"
                            maxLength={10000}
                            className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-black focus:shadow-[0_0_0_4px_rgba(28,25,23,0.06)] dark:border-white/10 dark:bg-[#202020] dark:focus:border-white/60 dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
                        />

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-white/5"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {isSaving ? 'Saving…' : editingNoteId ? 'Save Changes' : 'Create Note'}
                            </button>
                        </div>

                    </form>

                </div>

            )}

        </div>
    );
};

export default Dashboard;