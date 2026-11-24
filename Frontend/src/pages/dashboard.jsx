import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../service/api';
import { LogOut, Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { getErrorMessage } from '../service/errors';

const countWords = (text = '') => text.trim().split(/\s+/).filter(Boolean).length;

const Dashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [showModal, setShowModal] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadError, setLoadError] = useState('');
    const [notesLoading, setNotesLoading] = useState(true);
    const [modalError, setModalError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

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

    /* "n" = new note, "/" = focus search */
    useEffect(() => {
        function onKey(e) {
            if (showModal || e.metaKey || e.ctrlKey || e.altKey) return;
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
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

    return (
        <div className="min-h-screen bg-[#f3f0e9] text-stone-900 dark:bg-[#090909] dark:text-white">

            {/* Mobile Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-200 bg-[#fcfbf8] px-4 py-3 pr-16 md:hidden dark:border-white/10 dark:bg-[#151515]">
                <h1 className="truncate text-lg font-bold tracking-tight">
                    notes<span className="text-gray-400">.</span>
                </h1>
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
            <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-stone-200 bg-[#fcfbf8] px-7 py-8 md:flex md:flex-col dark:border-white/10 dark:bg-[#151515]">

                <div className="mb-14">
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

                <div className="flex items-center gap-3 rounded-xl bg-stone-900 px-4 py-3 text-sm text-white dark:bg-white/10">
                    <span className="text-lg">▤</span>
                    All Notes
                    <span className="ml-auto text-xs text-gray-400">
                        {notes.length}
                    </span>
                </div>

                <div className="mt-auto border-t border-black/10 pt-6 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-medium text-white dark:bg-white/10">
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
            <main className="px-4 py-6 sm:px-5 md:ml-64 md:px-12 md:py-10 lg:px-16">

                {/* Header */}
                <header className="flex items-start justify-between gap-3 border-b border-stone-300 pb-6 sm:items-center sm:gap-5 md:pb-8 dark:border-white/10">

                    <div>
                        <p className="text-xs font-medium tracking-[0.18em] text-gray-400 uppercase">
                            Workspace / Overview
                        </p>

                        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                            Your notes.
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            A little space for everything on your mind.
                        </p>
                    </div>

                    <button
                        onClick={handleNewNote}
                        className="flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 active:scale-95 sm:px-5 sm:py-3 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">New Note</span>
                    </button>

                </header>

                <Feedback message={errorMessage} onDismiss={() => setErrorMessage('')} />

                {/* Stats */}
                <section className="my-8 grid grid-cols-2 gap-4">

                    <div className="rounded-2xl border border-stone-200 bg-[#fffefa] p-5 sm:p-6 dark:border-white/10 dark:bg-[#151515]">
                        <p className="text-sm text-gray-500">Total Notes</p>
                        <h3 className="mt-2 text-3xl font-semibold">
                            {notes.length}
                        </h3>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-[#fffefa] p-5 sm:p-6 dark:border-white/10 dark:bg-[#151515]">
                        <p className="text-sm text-gray-500">Words Written</p>
                        <h3 className="mt-2 text-3xl font-semibold">
                            {totalWords}
                        </h3>
                    </div>

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
                                Your thoughts, organised.
                            </p>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    aria-label="Search notes"
                                    placeholder="Search notes..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full rounded-xl border border-stone-200 bg-[#fffefa] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-stone-400 dark:border-white/10 dark:bg-[#151515] dark:placeholder:text-gray-500 dark:focus:border-white"
                                />
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
                        </div>

                    </div>

                    {notesLoading ? (
                        <div role="status" className="flex min-h-50 items-center justify-center rounded-2xl border border-stone-200 bg-[#fffefa] text-sm text-gray-500 dark:border-white/10 dark:bg-[#151515] dark:text-gray-400">
                            Loading your notes…
                        </div>
                    ) : loadError ? null : visibleNotes.length === 0 ? (

                        <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-[#fffefa] px-6 text-center dark:border-white/15 dark:bg-[#151515]">

                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f5] text-2xl text-gray-700 dark:bg-white/10 dark:text-gray-300">
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                            {visibleNotes.map(note => (

                                <article
                                    key={note._id}
                                    className="group rounded-2xl border border-stone-200 bg-[#fffefa] p-6 transition hover:border-stone-400 dark:border-white/10 dark:bg-[#151515] dark:hover:border-white/30"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleEditNote(note)}
                                            aria-label={`Edit note: ${note.title}`}
                                            className="min-w-0 flex-1 wrap-break-word text-left text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                                        >
                                            {note.title}
                                        </button>

                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleDeleteNote(note._id);
                                            }}
                                            aria-label={`Delete note: ${note.title}`}
                                            className="shrink-0 rounded-md p-1 text-gray-400 transition hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleEditNote(note)}
                                        aria-label={`Edit note: ${note.title}`}
                                        className="mt-3 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                                    >
                                        <span className="line-clamp-4 block min-h-12 wrap-break-word text-sm leading-6 text-gray-500 dark:text-gray-400">
                                            {note.description || 'No description'}
                                        </span>
                                        <span className="mt-6 block border-t border-black/5 pt-4 text-xs text-gray-400 dark:border-white/10">
                                            {note.createdAt
                                                ? new Date(note.createdAt).toLocaleDateString()
                                                : ''
                                            }
                                        </span>
                                    </button>
                                </article>

                            ))}

                        </div>

                    )}

                </section>

                {/* Footer */}
                <footer className="mt-16 border-t border-stone-300 pt-6 text-center text-xs text-gray-400 dark:border-white/10">
                    Made for your thoughts. © 2026 Notes.
                </footer>

            </main>

            {/* Create / Edit Note Modal */}
            {showModal && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-4 sm:px-4 sm:py-6"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget && !isSaving) handleCloseModal();
                    }}
                >

                    <form
                        onSubmit={handleCreateNote}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="note-modal-title"
                        className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-black/10 bg-white p-5 shadow-xl sm:max-h-[calc(100dvh-3rem)] sm:p-7 dark:border-white/10 dark:bg-[#151515]"
                    >

                        <Feedback message={modalError} onDismiss={() => setModalError('')} />

                        <div className="mb-7 flex items-center justify-between">
                            <div>
                                <h2 id="note-modal-title" className="text-xl font-semibold">
                                    {editingNoteId ? 'Edit Note' : 'Create a note'}
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
                                className="text-2xl text-gray-400 hover:text-black dark:hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        <label htmlFor="note-title" className="mb-2 block text-sm font-medium">
                            Title
                        </label>

                        <input
                            id="note-title"
                            autoFocus
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Give your note a title"
                            maxLength={160}
                            className="mb-5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black dark:border-white/10 dark:bg-[#202020] dark:focus:border-white/60"
                            required
                        />

                        <label htmlFor="note-description" className="mb-2 block text-sm font-medium">
                            Description
                        </label>

                        <textarea
                            id="note-description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Start writing..."
                            rows="5"
                            maxLength={10000}
                            className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black dark:border-white/10 dark:bg-[#202020] dark:focus:border-white/60"
                        />

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/5"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
