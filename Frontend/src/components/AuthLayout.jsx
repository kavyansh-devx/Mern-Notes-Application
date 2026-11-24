import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const MARQUEE = ['Ideas', 'Journals', 'Plans', 'Lists', 'Dreams', 'Drafts', 'Reminders', 'Thoughts', 'Goals', 'Recipes'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cardBase = 'rounded-2xl border border-stone-200/80 bg-[#fffefa] dark:border-white/10 dark:bg-[#151515]';

/* ---------- Decorative note contents ---------- */
const Dot = ({ c }) => <span className={`h-2 w-2 rounded-full ${c}`} />;

const TextNote = ({ title, text, dot }) => (
    <div className="p-4">
        <div className="flex items-center gap-2">
            <Dot c={dot} />
            <p className="text-xs font-semibold">{title}</p>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-gray-400">{text}</p>
    </div>
);

const CheckNote = () => (
    <div className="p-4">
        <p className="text-xs font-semibold">To do</p>
        <ul className="mt-3 space-y-2 text-[11px] text-gray-400">
            {[['Call mom', true], ['Finish project', false], ['Sleep early', false]].map(([t, d]) => (
                <li key={t} className="flex items-center gap-2">
                    <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border text-[9px] ${d ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-black' : 'border-stone-300 dark:border-white/20'}`}>
                        {d ? '✓' : ''}
                    </span>
                    <span className={d ? 'line-through opacity-60' : ''}>{t}</span>
                </li>
            ))}
        </ul>
    </div>
);

const QuoteNote = () => (
    <div className="p-5">
        <p className="font-serif text-base italic leading-6 text-stone-700 dark:text-gray-200">“Ideas are fragile. Write them down.”</p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gray-400">— Every note, ever</p>
    </div>
);

const StickyNote = () => (
    <div className="rounded-2xl bg-amber-200 p-4 text-stone-800 dark:bg-amber-300">
        <p className="text-xs font-bold">Don’t forget!</p>
        <p className="mt-2 font-serif text-sm italic leading-5">Drink water, take breaks, call it a day at 6.</p>
    </div>
);

const TagsNote = () => (
    <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Tags</p>
        <div className="mt-3 flex max-w-[11rem] flex-wrap gap-1.5">
            {['#ideas', '#work', '#life', '#read', '#goals'].map((t) => (
                <span key={t} className="rounded-full border border-stone-300 px-2.5 py-1 text-[10px] text-stone-600 dark:border-white/15 dark:text-gray-300">{t}</span>
            ))}
        </div>
    </div>
);

const Pill = ({ children }) => <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium">{children}</div>;

const NOTES = [
    { id: 1, pos: 'left-[5%] top-[18%]', w: 'w-48', depth: 34, rot: -6, anim: 'float-a', show: 'hidden md:block', body: <TextNote title="Grocery run" text="Oat milk, coffee beans, lemons, fresh basil…" dot="bg-amber-400" /> },
    { id: 2, pos: 'right-[5%] top-[20%]', w: 'w-48', depth: 22, rot: 5, anim: 'float-b', show: 'hidden md:block', body: <TextNote title="Book ideas ✦" text="A story about a lighthouse keeper who collects letters." dot="bg-emerald-400" /> },
    { id: 3, pos: 'left-[8%] bottom-[18%]', w: 'w-44', depth: 46, rot: -3, anim: 'float-c', show: 'hidden lg:block', body: <CheckNote /> },
    { id: 4, pos: 'right-[7%] bottom-[16%]', w: 'w-52', depth: 28, rot: 4, anim: 'float-a', show: 'hidden lg:block', body: <QuoteNote /> },
    { id: 5, pos: 'left-[21%] top-[8%]', w: 'w-44', depth: 40, rot: -4, anim: 'float-c', show: 'hidden xl:block', plain: true, body: <StickyNote /> },
    { id: 6, pos: 'right-[21%] bottom-[9%]', w: 'w-48', depth: 20, rot: 3, anim: 'float-b', show: 'hidden xl:block', body: <TagsNote /> },
    { id: 7, pos: 'left-[19%] bottom-[9%]', w: 'w-auto', depth: 52, rot: 4, anim: 'float-a', show: 'hidden xl:block', pill: true, body: <Pill><span className="text-emerald-500">●</span> Saved just now</Pill> },
    { id: 8, pos: 'right-[19%] top-[9%]', w: 'w-auto', depth: 44, rot: -4, anim: 'float-c', show: 'hidden xl:block', pill: true, body: <Pill><span>✦</span> 128 notes</Pill> },
];

/* ---------- Draggable note ---------- */
const DraggableNote = ({ note }) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [tilt, setTilt] = useState(0);
    const [drag, setDrag] = useState(false);
    const start = useRef({ x: 0, y: 0, lastX: 0 });

    const down = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX - pos.x, y: e.clientY - pos.y, lastX: e.clientX };
        setDrag(true);
    };
    const move = (e) => {
        if (!drag) return;
        setPos({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
        setTilt(clamp((e.clientX - start.current.lastX) * 1.4, -14, 14));
        start.current.lastX = e.clientX;
    };
    const up = () => {
        setDrag(false);
        setTilt(0);
    };

    const shadow = drag
        ? 'shadow-[0_20px_50px_rgba(55,45,28,0.25)] dark:shadow-black/70'
        : 'shadow-[0_8px_18px_rgba(55,45,28,0.08),0_20px_40px_rgba(55,45,28,0.09)] dark:shadow-black/40';

    return (
        <div
            className={`absolute ${note.pos} ${note.show} ${drag ? 'z-30' : 'z-10'}`}
            style={{ transform: `translate(calc(var(--mx) * ${note.depth}px), calc(var(--my) * ${note.depth}px))`, transition: 'transform .35s ease-out' }}
        >
            <div
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                style={{
                    transform: `translate(${pos.x}px, ${pos.y}px) rotate(${note.rot + tilt}deg) scale(${drag ? 1.08 : 1})`,
                    transition: drag ? 'none' : 'transform .5s cubic-bezier(.2,.8,.2,1)',
                    touchAction: 'none',
                }}
                className={`pointer-events-auto ${note.w} select-none ${drag ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
                <div
                    className={`${note.anim} ${note.plain ? 'rounded-2xl' : note.pill ? `${cardBase} rounded-full` : cardBase} transition-shadow ${shadow}`}
                    style={{ animationPlayState: drag ? 'paused' : 'running' }}
                >
                    {note.body}
                </div>
            </div>
        </div>
    );
};

/* ---------- Shared form field (with show/hide for passwords) ---------- */
export const Field = ({ label, type = 'text', value, onChange, placeholder, autoComplete, children }) => {
    const [show, setShow] = useState(false);
    const isPw = type === 'password';

    return (
        <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                {label}
            </label>
            <div className="relative">
                <input
                    type={isPw && show ? 'text' : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`w-full rounded-xl border border-stone-200 bg-[#fbfaf6] px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-stone-900 focus:bg-white focus:shadow-[0_0_0_4px_rgba(28,25,23,0.06)] dark:border-white/10 dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white/60 dark:focus:bg-[#252525] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] ${isPw ? 'pr-12' : ''}`}
                />
                {isPw && (
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-label={show ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-stone-900 dark:hover:text-white"
                    >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
};

export const Spinner = () => (
    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]" />
);

/* ---------- Layout ---------- */
const AuthLayout = ({ children, watermark = 'notes' }) => {
    const rootRef = useRef(null);
    const cardRef = useRef(null);
    const [time, setTime] = useState(new Date());

    const sparkles = useMemo(
        () =>
            Array.from({ length: 26 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                top: Math.random() * 100,
                size: 4 + Math.random() * 8,
                delay: Math.random() * 6,
                dur: 3 + Math.random() * 4,
                star: Math.random() > 0.55,
            })),
        []
    );

    useEffect(() => {
        const c = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(c);
    }, []);

    const handleMove = (e) => {
        const el = rootRef.current;
        if (!el) return;
        el.style.setProperty('--px', `${e.clientX}px`);
        el.style.setProperty('--py', `${e.clientY}px`);
        el.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5).toFixed(3));
        el.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };

    const marqueeItems = [...MARQUEE, ...MARQUEE];

    return (
        <div
            ref={rootRef}
            onMouseMove={handleMove}
            style={{ '--mx': 0, '--my': 0, '--px': '50vw', '--py': '40vh' }}
            className="relative min-h-screen w-full overflow-x-hidden bg-[#f3f0e9] text-stone-900 dark:bg-[#090909] dark:text-white"
        >
            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(26px);} to { opacity:1; transform:translateY(0);} }
                @keyframes floatA { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-14px);} }
                @keyframes floatB { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-10px);} }
                @keyframes floatC { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-18px);} }
                @keyframes blob { 0%,100% { transform:translate(0,0) scale(1);} 33% { transform:translate(40px,-30px) scale(1.1);} 66% { transform:translate(-30px,30px) scale(.95);} }
                @keyframes spin { from { transform:translate(-50%,-50%) rotate(0);} to { transform:translate(-50%,-50%) rotate(360deg);} }
                @keyframes spinRev { from { transform:translate(-50%,-50%) rotate(360deg);} to { transform:translate(-50%,-50%) rotate(0);} }
                @keyframes twinkle { 0%,100% { opacity:.08; transform:scale(.7);} 50% { opacity:.6; transform:scale(1.15);} }
                @keyframes marquee { from { transform:translateX(0);} to { transform:translateX(-50%);} }
                @keyframes logoFloat { 0%,100% { transform:translateY(0) rotate(-3deg);} 50% { transform:translateY(-6px) rotate(3deg);} }
                .fade-up { opacity:0; animation: fadeUp .9s cubic-bezier(.2,.7,.2,1) forwards; }
                .float-a { animation: floatA 7s ease-in-out infinite; }
                .float-b { animation: floatB 8s ease-in-out infinite; }
                .float-c { animation: floatC 9s ease-in-out infinite; }
                .blob { animation: blob 18s ease-in-out infinite; }
                .orbit { animation: spin 90s linear infinite; }
                .orbit-rev { animation: spinRev 120s linear infinite; }
                .twinkle { animation: twinkle var(--d,4s) ease-in-out infinite; }
                .marquee { animation: marquee 40s linear infinite; }
                .logo-float { animation: logoFloat 6s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .float-a,.float-b,.float-c,.blob,.orbit,.orbit-rev,.twinkle,.marquee,.logo-float { animation:none; }
                    .fade-up { animation:none; opacity:1; }
                }
            `}</style>

            {/* ---------- Background ---------- */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="blob absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-200/10" />
                <div className="blob absolute -bottom-24 -right-24 h-[30rem] w-[30rem] rounded-full bg-stone-300/60 blur-3xl dark:bg-white/5" style={{ animationDelay: '-7s' }} />
                <div className="blob absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-200/5" style={{ animationDelay: '-12s' }} />

                <div
                    className="absolute inset-0 opacity-40 dark:opacity-[0.12]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(120,113,108,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,0.14) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                    }}
                />

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translate(calc(var(--mx) * -30px), calc(var(--my) * -30px))', transition: 'transform .4s ease-out' }}>
                    <span className="select-none text-[26vw] font-bold leading-none tracking-tighter" style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(120,113,108,0.16)' }}>
                        {watermark}
                    </span>
                </div>

                {/* Orbit rings */}
                <svg className="orbit absolute left-1/2 top-1/2 h-[46rem] w-[46rem] text-stone-400/40 dark:text-white/10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.12" strokeDasharray="0.8 1.6">
                    <circle cx="50" cy="50" r="49" />
                </svg>
                <svg className="orbit-rev absolute left-1/2 top-1/2 h-[32rem] w-[32rem] text-stone-400/50 dark:text-white/10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.15" strokeDasharray="0.4 2">
                    <circle cx="50" cy="50" r="49" />
                    <circle cx="50" cy="1" r="1.4" fill="currentColor" stroke="none" />
                </svg>
                <svg className="orbit absolute left-1/2 top-1/2 h-[60rem] w-[60rem] text-stone-400/30 dark:text-white/[0.06]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.1">
                    <circle cx="50" cy="50" r="49" />
                    <circle cx="99" cy="50" r="0.9" fill="currentColor" stroke="none" />
                </svg>

                {/* Sparkles */}
                {sparkles.map((s) => (
                    <span key={s.id} className="twinkle absolute text-stone-500 dark:text-white" style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, animationDelay: `${s.delay}s`, '--d': `${s.dur}s` }}>
                        {s.star ? '✦' : '•'}
                    </span>
                ))}

                {/* Cursor spotlight */}
                <div className="absolute inset-0 dark:hidden" style={{ background: 'radial-gradient(420px circle at var(--px) var(--py), rgba(251,191,36,0.22), transparent 65%)' }} />
                <div className="absolute inset-0 hidden dark:block" style={{ background: 'radial-gradient(420px circle at var(--px) var(--py), rgba(255,255,255,0.08), transparent 65%)' }} />

                {/* Grain */}
                <div
                    className="absolute inset-0 opacity-[0.05] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-screen"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                    }}
                />

                {/* Corner brackets */}
                {['left-4 top-16 border-l border-t', 'right-4 top-16 border-r border-t', 'left-4 bottom-14 border-b border-l', 'right-4 bottom-14 border-b border-r'].map((c) => (
                    <span key={c} className={`absolute h-5 w-5 border-stone-400/60 dark:border-white/20 ${c}`} />
                ))}
            </div>

            {/* ---------- Draggable notes ---------- */}
            <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
                {NOTES.map((n) => (
                    <DraggableNote key={n.id} note={n} />
                ))}
            </div>

            {/* ---------- Top bar ---------- */}
            <div className="fade-up pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 text-[10px] uppercase tracking-[0.25em] text-gray-400 sm:text-[11px]" style={{ animationDelay: '600ms' }}>
                <Link to="/" className="pointer-events-auto flex items-center gap-2 transition hover:text-stone-900 dark:hover:text-white">
                    <ArrowLeft size={14} />
                    notes.
                </Link>
                <span className="hidden sm:block">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Secure
                </span>
            </div>

            {/* ---------- Content ---------- */}
            <div className="pointer-events-none relative z-20 flex min-h-screen items-center justify-center px-4 py-20">
                <div
                    ref={cardRef}
                    className="pointer-events-auto w-full max-w-md"
                    style={{
                        transform: 'perspective(1400px) rotateY(calc(var(--mx) * 4deg)) rotateX(calc(var(--my) * -4deg))',
                        transition: 'transform .3s ease-out',
                    }}
                >
                    {children}
                </div>
            </div>

            {/* ---------- Bottom marquee ---------- */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 overflow-hidden border-t border-stone-300/80 bg-[#f3f0e9]/60 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-[#090909]/60">
                <div className="marquee flex w-max gap-10">
                    {[...marqueeItems, ...marqueeItems].map((w, i) => (
                        <span key={i} className="flex items-center gap-10 text-[11px] uppercase tracking-[0.3em] text-gray-400">
                            {w}
                            <span className="text-stone-300 dark:text-white/20">✦</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;