
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../service/api';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Feedback } from '../components/Feedback';
import { getErrorMessage } from '../service/errors';

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

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

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

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        (note.description || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f3f0e9] text-stone-900 transition-colors dark:bg-[#090909] dark:text-white">

            {/* Mobile Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-200/80 bg-[#fcfbf8]/95 px-4 py-3 pr-16 backdrop-blur md:hidden dark:border-white/10 dark:bg-[#151515]/95">
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
            <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-stone-200/80 bg-[#fcfbf8] px-7 py-8 shadow-[8px_0_30px_rgba(55,45,28,0.035)] md:flex md:flex-col dark:border-white/10 dark:bg-[#151515] dark:shadow-none">

                <div className="mb-16">
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

                <div className="flex items-center gap-3 rounded-xl bg-black px-4 py-3 text-sm text-white">
                    <span className="text-lg">▤</span>
                    All Notes
                    <span className="ml-auto text-xs text-gray-400">
                        {notes.length}
                    </span>
                </div>

                <div className="mt-auto border-t border-black/10 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
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
            <main className="px-4 py-6 sm:px-5 md:ml-64 md:px-12 md:py-10 lg:px-16">

                {/* Header */}
                <header className="flex items-start justify-between gap-3 border-b border-stone-300/80 pb-6 sm:items-center sm:gap-5 md:pb-8">

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
                        className="shrink-0 rounded-xl bg-stone-900 px-3.5 py-2.5 text-sm font-medium text-white shadow-[0_5px_12px_rgba(41,37,36,0.12),0_12px_28px_rgba(41,37,36,0.12)] transition hover:bg-stone-800 active:scale-95 sm:px-5 sm:py-3 dark:bg-black dark:shadow-lg dark:shadow-black/10 dark:hover:bg-gray-800"
                    >
                        <span className="sm:hidden">+</span>
                        <span className="hidden sm:inline">+ New Note</span>
                    </button>

                </header>

                <Feedback message={errorMessage} onDismiss={() => setErrorMessage('')} />

                {/* Stats */}
                <section className="my-9 grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl border border-stone-200/80 bg-[#fffefa] p-6 shadow-[0_2px_6px_rgba(55,45,28,0.04),0_12px_28px_rgba(55,45,28,0.055)] dark:border-white/10 dark:bg-[#151515] dark:shadow-none">
                        <p className="text-sm text-gray-500">Total Notes</p>
                        <h3 className="mt-3 text-3xl font-semibold">
                            {notes.length}
                        </h3>
                    </div>

                    <div className="rounded-2xl border border-stone-200/80 bg-[#fffefa] p-6 shadow-[0_2px_6px_rgba(55,45,28,0.04),0_12px_28px_rgba(55,45,28,0.055)] dark:border-white/10 dark:bg-[#151515] dark:shadow-none">
                        <p className="text-sm text-gray-500">Your Workspace</p>
                        <h3 className="mt-3 text-xl font-semibold">
                            Personal
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

                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

                        <div>
                            <h3 className="text-lg font-semibold">
                                All Notes
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Your thoughts, organised.
                            </p>
                        </div>

                        <input
                            type="text"
                            aria-label="Search notes"
                            placeholder="Search notes..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-[#fffefa] px-4 py-3 text-sm outline-none shadow-[0_2px_8px_rgba(55,45,28,0.045)] transition placeholder:text-gray-400 focus:border-stone-400 sm:w-64 dark:border-white/10 dark:bg-[#151515] dark:shadow-none dark:placeholder:text-gray-500 dark:focus:border-white"
                        />

                    </div>

                    {/* Empty State */}
                    {notesLoading ? (
                        <div role="status" className="flex min-h-50 items-center justify-center rounded-2xl border border-stone-200/80 bg-[#fffefa] text-sm text-gray-500 dark:border-white/10 dark:bg-[#151515] dark:text-gray-400">
                            Loading your notes…
                        </div>
                    ) : loadError ? null : filteredNotes.length === 0 ? (

                        <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-linear-to-b from-[#fffefa] to-[#f9f6ef] px-6 text-center shadow-[0_8px_28px_rgba(55,45,28,0.045)] dark:border-white/15 dark:bg-[#151515] dark:bg-none dark:shadow-none">

                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f5f5] text-3xl text-gray-700 dark:bg-white/10 dark:text-amber-200">
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">

                            {filteredNotes.map(note => (

                                <article
                                    key={note._id}
                                    className="group rounded-2xl border border-stone-200/80 bg-[#fffefa] p-6 shadow-[0_2px_6px_rgba(55,45,28,0.035),0_10px_26px_rgba(55,45,28,0.05)] transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(55,45,28,0.07),0_20px_40px_rgba(55,45,28,0.09)] dark:border-white/10 dark:bg-[#151515] dark:shadow-none dark:hover:shadow-black/30"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleEditNote(note)}
                                            aria-label={`Edit note: ${note.title}`}
                                            className="min-w-0 flex-1 wrap-break-word text-left text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                        >
                                            {note.title}
                                        </button>

                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleDeleteNote(note._id);
                                            }}
                                            aria-label={`Delete note: ${note.title}`}
                                            className="shrink-0 rounded px-2 text-gray-400 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:hover:text-white"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleEditNote(note)}
                                        aria-label={`Edit note: ${note.title}`}
                                        className="mt-3 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                    >
                                        <span className="block min-h-12 wrap-break-word text-sm leading-6 text-gray-500">
                                            {note.description || 'No description'}
                                        </span>
                                        <span className="mt-6 block border-t border-black/5 pt-4 text-xs text-gray-400">
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
                <footer className="mt-16 border-t border-stone-300/80 pt-6 text-center text-xs text-gray-400">
                    Made for your thoughts. © 2026 Notes.
                </footer>

            </main>

            {/* Create / Edit Note Modal */}
            {showModal && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget && !isSaving) handleCloseModal();
                    }}
                >

                    <form
                        onSubmit={handleCreateNote}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="note-modal-title"
                        className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-black/10 bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-7 dark:border-white/10 dark:bg-[#151515]"
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
                            className="mb-5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black dark:border-white/10 dark:bg-[#202020]"
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
                            className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black dark:border-white/10 dark:bg-[#202020]"
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
                                className="flex-1 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
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
