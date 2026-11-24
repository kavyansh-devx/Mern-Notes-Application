import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const WORDS = ['ideas', 'plans', 'dreams', 'moments', 'secrets', 'lists'];
const POP = ['idea ✦', 'todo', 'dream', 'plan', 'remember', 'note ✦', 'later', 'maybe…', 'yes!'];
const MARQUEE = ['Ideas', 'Journals', 'Plans', 'Lists', 'Dreams', 'Drafts', 'Reminders', 'Thoughts', 'Goals', 'Recipes'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const cardBase =
    'rounded-2xl border border-stone-200/80 bg-[#fffefa] dark:border-white/10 dark:bg-[#151515]';

/* ---------- Note content variants ---------- */
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
            {[
                ['Call mom', true],
                ['Finish project', false],
                ['Sleep early', false],
            ].map(([t, d]) => (
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
        <p className="font-serif text-base italic leading-6 text-stone-700 dark:text-gray-200">
            “Ideas are fragile. Write them down.”
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gray-400">— Every note, ever</p>
    </div>
);

const StickyNote = () => (
    <div className="rounded-2xl bg-amber-200 p-4 text-stone-800 dark:bg-amber-300">
        <p className="text-xs font-bold">Don’t forget!</p>
        <p className="mt-2 font-serif text-sm italic leading-5">Drink water, take breaks, and call it a day at 6.</p>
    </div>
);

const TagsNote = () => (
    <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Tags</p>
        <div className="mt-3 flex max-w-44 flex-wrap gap-1.5">
            {['#ideas', '#work', '#life', '#read', '#goals'].map((t) => (
                <span key={t} className="rounded-full border border-stone-300 px-2.5 py-1 text-[10px] text-stone-600 dark:border-white/15 dark:text-gray-300">
                    {t}
                </span>
            ))}
        </div>
    </div>
);

const PillNote = ({ children }) => (
    <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium">{children}</div>
);

const NOTES = [
    { id: 1, pos: 'left-[4%] top-[14%]', w: 'w-36 sm:w-48', depth: 34, rot: -6, anim: 'float-a', show: 'hidden sm:block', body: <TextNote title="Grocery run" text="Oat milk, coffee beans, lemons, fresh basil…" dot="bg-amber-400" /> },
    { id: 2, pos: 'right-[4%] top-[16%]', w: 'w-36 sm:w-48', depth: 22, rot: 5, anim: 'float-b', show: 'hidden sm:block', body: <TextNote title="Book ideas ✦" text="A story about a lighthouse keeper who collects letters." dot="bg-emerald-400" /> },
    { id: 3, pos: 'left-[8%] bottom-[16%]', w: 'w-36 sm:w-44', depth: 46, rot: -3, anim: 'float-c', show: 'hidden sm:block', body: <TextNote title="Weekend plan" text="Hike, brunch, read by the window." dot="bg-sky-400" /> },
    { id: 4, pos: 'right-[7%] bottom-[14%]', w: 'w-36 sm:w-44', depth: 28, rot: 4, anim: 'float-a', show: 'hidden sm:block', body: <CheckNote /> },
    { id: 5, pos: 'left-[30%] top-[7%]', w: 'w-44', depth: 16, rot: 2, anim: 'float-b', show: 'hidden lg:block', body: <TextNote title="3 AM thought" text="What if every idea had a home?" dot="bg-violet-400" /> },
    { id: 6, pos: 'right-[28%] top-[8%]', w: 'w-44', depth: 40, rot: -4, anim: 'float-c', show: 'hidden lg:block', plain: true, body: <StickyNote /> },
    { id: 7, pos: 'left-[3%] top-[46%]', w: 'w-48', depth: 26, rot: 3, anim: 'float-b', show: 'hidden md:block', body: <TagsNote /> },
    { id: 8, pos: 'right-[3%] top-[47%]', w: 'w-52', depth: 38, rot: -3, anim: 'float-a', show: 'hidden md:block', body: <QuoteNote /> },
    { id: 9, pos: 'left-[26%] bottom-[9%]', w: 'w-48', depth: 20, rot: 3, anim: 'float-c', show: 'hidden lg:block', body: <TextNote title="Reading list" text="Atomic Habits, Deep Work, The Creative Act." dot="bg-rose-400" /> },
    { id: 10, pos: 'right-[26%] bottom-[10%]', w: 'w-44', depth: 32, rot: -5, anim: 'float-b', show: 'hidden lg:block', body: <TextNote title="Meeting notes" text="Ship the design by Friday. Review at 4pm." dot="bg-teal-400" /> },
    { id: 11, pos: 'left-[19%] top-[32%]', w: 'w-auto', depth: 52, rot: -4, anim: 'float-a', show: 'hidden xl:block', pill: true, body: <PillNote><span className="text-emerald-500">●</span> Saved just now</PillNote> },
    { id: 12, pos: 'right-[18%] top-[34%]', w: 'w-auto', depth: 44, rot: 4, anim: 'float-c', show: 'hidden xl:block', pill: true, body: <PillNote><span>✦</span> 128 notes</PillNote> },
    { id: 13, pos: 'left-[17%] bottom-[34%]', w: 'w-auto', depth: 30, rot: 3, anim: 'float-b', show: 'hidden xl:block', pill: true, body: <PillNote><span>⌕</span> Search anything</PillNote> },
    { id: 14, pos: 'right-[16%] bottom-[33%]', w: 'w-auto', depth: 36, rot: -3, anim: 'float-a', show: 'hidden xl:block', pill: true, body: <PillNote><span>☾</span> Dark mode</PillNote> },
];

/* ---------- Draggable wrapper ---------- */
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
            style={{
                transform: `translate(calc(var(--mx) * ${note.depth}px), calc(var(--my) * ${note.depth}px))`,
                transition: 'transform .35s ease-out',
            }}
        >
            <div
                data-note
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                style={{
                    transform: `translate(${pos.x}px, ${pos.y}px) rotate(${note.rot + tilt}deg) scale(${drag ? 1.08 : 1})`,
                    transition: drag ? 'none' : 'transform .5s cubic-bezier(.2,.8,.2,1)',
                    touchAction: 'none',
                }}
                className={`${note.w} select-none ${drag ? 'cursor-grabbing' : 'cursor-grab'}`}
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

/* ---------- Magnetic button ---------- */
const Magnetic = ({ to, children, className }) => {
    const ref = useRef(null);
    const onMove = (e) => {
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => {
        ref.current.style.transform = 'translate(0,0)';
    };
    return (
        <Link
            ref={ref}
            to={to}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ transition: 'transform .25s cubic-bezier(.2,.8,.2,1), background-color .2s, box-shadow .2s' }}
            className={className}
        >
            {children}
        </Link>
    );
};

const Home = () => {
    const rootRef = useRef(null);
    const [wordIdx, setWordIdx] = useState(0);
    const [pops, setPops] = useState([]);
    const [caught, setCaught] = useState(0);
    const [time, setTime] = useState(new Date());

    const sparkles = useMemo(
        () =>
            Array.from({ length: 28 }, (_, i) => ({
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
        const t = setInterval(() => setWordIdx((i) => (i + 1) % WORDS.length), 2400);
        const c = setInterval(() => setTime(new Date()), 1000);
        return () => {
            clearInterval(t);
            clearInterval(c);
        };
    }, []);

    const handleMove = (e) => {
        const el = rootRef.current;
        if (!el) return;
        el.style.setProperty('--px', `${e.clientX}px`);
        el.style.setProperty('--py', `${e.clientY}px`);
        el.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5).toFixed(3));
        el.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };

    const handleClick = (e) => {
        if (e.target.closest('a, [data-note]')) return;
        const id = Date.now() + Math.random();
        const word = POP[Math.floor(Math.random() * POP.length)];
        setPops((p) => [...p, { id, x: e.clientX, y: e.clientY, word }]);
        setCaught((c) => c + 1);
        setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1400);
    };

    const marqueeItems = [...MARQUEE, ...MARQUEE];

    return (
        <div
            ref={rootRef}
            onMouseMove={handleMove}
            onClick={handleClick}
            style={{ '--mx': 0, '--my': 0, '--px': '50vw', '--py': '40vh' }}
            className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#f3f0e9] text-stone-900 dark:bg-[#090909] dark:text-white"
        >
            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(26px);} to { opacity:1; transform:translateY(0);} }
                @keyframes letterIn { from { opacity:0; transform:translateY(40px) rotate(6deg); filter:blur(8px);} to { opacity:1; transform:translateY(0) rotate(0); filter:blur(0);} }
                @keyframes wordIn { from { opacity:0; transform:translateY(16px); filter:blur(6px);} to { opacity:1; transform:translateY(0); filter:blur(0);} }
                @keyframes floatA { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-14px);} }
                @keyframes floatB { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-10px);} }
                @keyframes floatC { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-18px);} }
                @keyframes blob { 0%,100% { transform:translate(0,0) scale(1);} 33% { transform:translate(40px,-30px) scale(1.1);} 66% { transform:translate(-30px,30px) scale(.95);} }
                @keyframes ring { from { transform:translate(-50%,-50%) scale(0); opacity:.55;} to { transform:translate(-50%,-50%) scale(1); opacity:0;} }
                @keyframes popUp { 0% { opacity:0; transform:translate(-50%,-30%) scale(.8);} 20% { opacity:1;} 100% { opacity:0; transform:translate(-50%,-190%) scale(1);} }
                @keyframes shine { from { background-position:200% 0;} to { background-position:-200% 0;} }
                @keyframes arrow { 0%,100% { transform:translateX(0);} 50% { transform:translateX(4px);} }
                @keyframes spin { from { transform:translate(-50%,-50%) rotate(0);} to { transform:translate(-50%,-50%) rotate(360deg);} }
                @keyframes spinRev { from { transform:translate(-50%,-50%) rotate(360deg);} to { transform:translate(-50%,-50%) rotate(0);} }
                @keyframes twinkle { 0%,100% { opacity:.08; transform:scale(.7);} 50% { opacity:.6; transform:scale(1.15);} }
                @keyframes marquee { from { transform:translateX(0);} to { transform:translateX(-50%);} }
                .fade-up { opacity:0; animation: fadeUp .9s cubic-bezier(.2,.7,.2,1) forwards; }
                .letter { display:inline-block; opacity:0; animation: letterIn .9s cubic-bezier(.2,.7,.2,1) forwards; }
                .word-in { display:inline-block; animation: wordIn .7s cubic-bezier(.2,.7,.2,1) both; }
                .float-a { animation: floatA 7s ease-in-out infinite; }
                .float-b { animation: floatB 8s ease-in-out infinite; }
                .float-c { animation: floatC 9s ease-in-out infinite; }
                .blob { animation: blob 18s ease-in-out infinite; }
                .ring { animation: ring 1s ease-out forwards; }
                .pop-word { animation: popUp 1.4s ease-out forwards; }
                .orbit { animation: spin 90s linear infinite; }
                .orbit-rev { animation: spinRev 120s linear infinite; }
                .twinkle { animation: twinkle var(--d,4s) ease-in-out infinite; }
                .marquee { animation: marquee 40s linear infinite; }
                .shine { background: linear-gradient(110deg, currentColor 40%, #a8a29e 50%, currentColor 60%); background-size:200% 100%; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation: shine 7s linear infinite; }
                .btn-arrow { display:inline-block; }
                a:hover .btn-arrow { animation: arrow .8s ease-in-out infinite; }
                .vertical { writing-mode: vertical-rl; }
                @media (prefers-reduced-motion: reduce) {
                    .float-a,.float-b,.float-c,.blob,.shine,.word-in,.orbit,.orbit-rev,.twinkle,.marquee,.ring,.pop-word { animation:none; }
                    .fade-up,.letter { animation:none; opacity:1; }
                }
            `}</style>

            {/* ---------- Background layers ---------- */}
            <div className="pointer-events-none absolute inset-0">
                <div className="blob absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-200/10" />
                <div className="blob absolute -bottom-24 -right-24 h-120 w-120 rounded-full bg-stone-300/60 blur-3xl dark:bg-white/5" style={{ animationDelay: '-7s' }} />
                <div className="blob absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl dark:bg-rose-200/5" style={{ animationDelay: '-12s' }} />

                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-40 dark:opacity-[0.12]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(120,113,108,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,0.14) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                    }}
                />

                {/* Giant outlined watermark */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transform: 'translate(calc(var(--mx) * -30px), calc(var(--my) * -30px))', transition: 'transform .4s ease-out' }}
                >
                    <span
                        className="select-none text-[26vw] font-bold leading-none tracking-tighter"
                        style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(120,113,108,0.16)' }}
                    >
                        notes
                    </span>
                </div>

                {/* Orbit rings */}
                <svg className="orbit absolute left-1/2 top-1/2 h-184 w-184 text-stone-400/40 dark:text-white/10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.12" strokeDasharray="0.8 1.6">
                    <circle cx="50" cy="50" r="49" />
                </svg>
                <svg className="orbit-rev absolute left-1/2 top-1/2 h-128 w-lg text-stone-400/50 dark:text-white/10" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.15" strokeDasharray="0.4 2">
                    <circle cx="50" cy="50" r="49" />
                    <circle cx="50" cy="1" r="1.4" fill="currentColor" stroke="none" />
                </svg>
                <svg className="orbit absolute left-1/2 top-1/2 h-240 w-240 text-stone-400/30 dark:text-white/6" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.1">
                    <circle cx="50" cy="50" r="49" />
                    <circle cx="99" cy="50" r="0.9" fill="currentColor" stroke="none" />
                </svg>

                {/* Sparkles */}
                {sparkles.map((s) => (
                    <span
                        key={s.id}
                        className="twinkle absolute text-stone-500 dark:text-white"
                        style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, animationDelay: `${s.delay}s`, '--d': `${s.dur}s` }}
                    >
                        {s.star ? '✦' : '•'}
                    </span>
                ))}

                {/* Cursor spotlight */}
                <div
                    className="absolute inset-0 dark:hidden"
                    style={{ background: 'radial-gradient(420px circle at var(--px) var(--py), rgba(251,191,36,0.22), transparent 65%)' }}
                />
                <div
                    className="absolute inset-0 hidden dark:block"
                    style={{ background: 'radial-gradient(420px circle at var(--px) var(--py), rgba(255,255,255,0.08), transparent 65%)' }}
                />

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

            {/* ---------- Top bar ---------- */}
            <div className="fade-up pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 text-[10px] uppercase tracking-[0.25em] text-gray-400 sm:text-[11px]" style={{ animationDelay: '1300ms' }}>
                <span>notes. © 2026</span>
                <span className="hidden sm:block">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Vol. 01
                </span>
            </div>

            {/* Side vertical text */}
            <p className="vertical fade-up pointer-events-none absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 rotate-180 text-[10px] uppercase tracking-[0.4em] text-gray-400 md:block" style={{ animationDelay: '1400ms' }}>
                Write · Think · Remember
            </p>
            <p className="vertical fade-up pointer-events-none absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 text-[10px] uppercase tracking-[0.4em] text-gray-400 md:block" style={{ animationDelay: '1400ms' }}>
                Your personal space
            </p>

            {/* ---------- Draggable notes ---------- */}
            {NOTES.map((n) => (
                <DraggableNote key={n.id} note={n} />
            ))}

            {/* ---------- Center content ---------- */}
            <main className="pointer-events-none relative z-20 px-6 text-center">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-8xl">
                    {'notes'.split('').map((l, i) => (
                        <span key={i} className="letter" style={{ animationDelay: `${150 + i * 90}ms` }}>
                            {l}
                        </span>
                    ))}
                    <span className="letter text-gray-400" style={{ animationDelay: '650ms' }}>.</span>
                </h1>

                <p className="fade-up mt-5 text-[11px] uppercase tracking-[0.35em] text-gray-400" style={{ animationDelay: '800ms' }}>
                    Capture · Organise · Revisit
                </p>

                <h2 className="fade-up mt-8 text-xl text-stone-600 dark:text-gray-300 md:text-3xl" style={{ animationDelay: '950ms' }}>
                    A quiet place for your
                    <br />
                    <span key={wordIdx} className="word-in shine font-serif text-4xl italic text-stone-900 dark:text-white md:text-6xl">
                        {WORDS[wordIdx]}
                    </span>
                    <span className="text-gray-400">.</span>
                </h2>

                <div className="fade-up pointer-events-auto mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '1150ms' }}>
                    <Magnetic
                        to="/login"
                        className="w-48 rounded-full bg-stone-900 px-10 py-4 text-sm font-medium text-white shadow-[0_6px_14px_rgba(41,37,36,0.18),0_16px_36px_rgba(41,37,36,0.2)] hover:bg-stone-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        Login
                    </Magnetic>

                    <Magnetic
                        to="/register"
                        className="w-48 rounded-full border border-stone-300 bg-[#fffefa]/70 px-10 py-4 text-sm font-medium backdrop-blur hover:border-stone-500 hover:bg-[#fffefa] active:scale-95 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                        Register <span className="btn-arrow">→</span>
                    </Magnetic>
                </div>
            </main>

            {/* ---------- Hint / counter ---------- */}
            <p className="fade-up pointer-events-none absolute bottom-14 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.25em] text-gray-400" style={{ animationDelay: '1500ms' }}>
                {caught === 0 ? 'Drag the notes · Click anywhere' : `✦ ${caught} ${caught === 1 ? 'idea' : 'ideas'} caught`}
            </p>

            {/* ---------- Bottom marquee ---------- */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 overflow-hidden border-t border-stone-300/80 bg-[#f3f0e9]/60 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-[#090909]/60">
                <div className="marquee flex w-max gap-10">
                    {[...marqueeItems, ...marqueeItems].map((w, i) => (
                        <span key={i} className="flex items-center gap-10 text-[11px] uppercase tracking-[0.3em] text-gray-400">
                            {w}
                            <span className="text-stone-300 dark:text-white/20">✦</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ---------- Click ripples ---------- */}
            {pops.map((p) => (
                <div key={p.id} className="pointer-events-none fixed z-40" style={{ left: p.x, top: p.y }}>
                    <span className="ring absolute h-24 w-24 rounded-full border border-stone-400/70 dark:border-white/40" />
                    <span className="pop-word absolute whitespace-nowrap font-serif text-lg italic text-stone-700 dark:text-gray-200">
                        {p.word}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default Home;