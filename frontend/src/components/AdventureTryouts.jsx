    import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentDashboard } from './StudentDashboardContext';
import Tryout from './Tryout';

/* ───────────────────────────── QUEST CARD DATA ───────────────────────────── */
const QUESTS = [
    {
        id: 'math',
        title: 'Math Magic',
        description: 'Master the world of numbers! Fractions, decimals, and fun word problems await you in this quest.',
        questions: 20,
        time: '15 Mins',
        difficulty: 'Easy Peasy',
        difficultyIcon: 'sentiment_satisfied',
        difficultyColor: 'bg-green-100 text-green-700',
        gradient: 'from-blue-400 to-indigo-600',
        icon: 'calculate',
        questionsColor: 'bg-blue-100 text-blue-700',
        unlocked: true,
    },
    {
        id: 'science',
        title: 'Science Lab',
        description: 'Discover how the world works. From tiny atoms to giant galaxies, test your inner Einstein!',
        questions: 35,
        time: '25 Mins',
        difficulty: 'Master Mind',
        difficultyIcon: 'psychology',
        difficultyColor: 'bg-purple-100 text-purple-700',
        gradient: 'from-emerald-400 to-teal-600',
        icon: 'biotech',
        questionsColor: 'bg-teal-100 text-teal-700',
        unlocked: true,
    },
    {
        id: 'english',
        title: 'Word Wonders',
        description: 'Enhance your vocabulary and grammar. Become a master of the English language through creative quests.',
        questions: 25,
        time: '20 Mins',
        difficulty: 'Challenger',
        difficultyIcon: 'bolt',
        difficultyColor: 'bg-yellow-100 text-yellow-700',
        gradient: 'from-orange-400 to-pink-600',
        icon: 'menu_book',
        questionsColor: 'bg-orange-100 text-orange-700',
        unlocked: true,
    },
    {
        id: 'history',
        title: 'History Hikers',
        description: 'Travel back in time! Explore ancient civilizations and famous leaders who shaped our world.',
        questions: 30,
        time: '30 Mins',
        difficulty: 'Easy Peasy',
        difficultyIcon: 'sentiment_satisfied',
        difficultyColor: 'bg-green-100 text-green-700',
        gradient: 'from-amber-600 to-amber-900',
        icon: 'explore',
        questionsColor: 'bg-amber-100 text-amber-700',
        unlocked: true,
    },
    {
        id: 'geography',
        title: 'Geo Giants',
        description: 'Mountains, rivers, and capitals. How well do you know your planet? Test your geography skills!',
        questions: 15,
        time: '15 Mins',
        difficulty: 'Challenger',
        difficultyIcon: 'bolt',
        difficultyColor: 'bg-yellow-100 text-yellow-700',
        gradient: 'from-cyan-500 to-blue-700',
        icon: 'public',
        questionsColor: 'bg-cyan-100 text-cyan-700',
        unlocked: true,
    },
];

/* ───────────────────────────── GOOGLE MATERIAL SYMBOLS ───────────────────────────── */
const MaterialIcon = ({ name, className = '', filled = false, style = {} }) => (
    <span
        className={`material-symbols-outlined ${filled ? 'fill-icon' : ''} ${className}`}
        style={{ fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", ...style }}
    >
        {name}
    </span>
);

/* ───────────────────────────── QUEST CARD ───────────────────────────── */
const QuestCard = ({ quest, onStart }) => {
    return (
        <div className="adventure-card flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300/50 transition-all duration-300 group">
            {/* Card Header Gradient */}
            <div
                className={`h-40 bg-gradient-to-br ${quest.gradient} relative overflow-hidden p-6 flex flex-col justify-end`}
            >
                <div
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30"
                >
                    {quest.time}
                </div>
                <MaterialIcon
                    name={quest.icon}
                    className="text-white/20 absolute -bottom-4 -right-4 group-hover:rotate-0 transition-transform duration-500"
                    style={{ fontSize: '5rem', transform: 'rotate(12deg)' }}
                />
                <h3 className="text-white text-2xl font-black relative z-10">{quest.title}</h3>
            </div>

            {/* Card Body */}
            <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex flex-wrap gap-2">
                    <span
                        className={`${quest.questionsColor} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}
                    >
                        <MaterialIcon name="format_list_numbered" style={{ fontSize: '14px' }} />
                        {quest.questions} Questions
                    </span>
                    <span
                        className={`${quest.difficultyColor} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}
                    >
                        <MaterialIcon name={quest.difficultyIcon} style={{ fontSize: '14px' }} />
                        {quest.difficulty}
                    </span>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2 flex-1">{quest.description}</p>
                <button
                    onClick={() => onStart(quest)}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 group-hover:scale-[1.02] shadow-lg shadow-amber-200/40 cursor-pointer"
                >
                    Start Quest
                    <MaterialIcon name="play_circle" />
                </button>
            </div>
        </div>
    );
};

/* ───────────────────────────── LOCKED CARD ───────────────────────────── */
const LockedCard = () => (
    <div className="flex flex-col bg-slate-100 rounded-2xl overflow-hidden border border-dashed border-slate-300 relative group opacity-80 min-h-[320px]">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/10 backdrop-blur-[2px]">
            <div className="bg-white p-4 rounded-full shadow-lg text-amber-400 mb-2">
                <MaterialIcon name="lock" filled className="text-4xl" style={{ fontSize: '2.5rem' }} />
            </div>
            <p className="text-slate-900 font-bold">Unlocks at Level 5</p>
        </div>
        <div className="h-40 bg-slate-300"></div>
        <div className="p-6 flex flex-col gap-4 grayscale">
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
        </div>
    </div>
);

/* ───────────────────────────── MAIN PAGE COMPONENT ───────────────────────────── */
const AdventureTryouts = () => {
    const navigate = useNavigate();
    const { profile, stats } = useStudentDashboard();
    const [activeQuest, setActiveQuest] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState('CBSE');
    const [selectedClass, setSelectedClass] = useState('Class 6');

    const studentName = profile?.name || 'Explorer';
    const level = stats?.achievements || 4;
    const xp = 1250;
    const maxXp = 2000;
    const streak = 3;

    const handleStartQuest = useCallback((quest) => {
        setActiveQuest(quest);
        // Scroll to tryout section
        setTimeout(() => {
            document.getElementById('tryout-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    const handleBackToQuests = useCallback(() => {
        setActiveQuest(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden" style={{ background: '#f8f7f6', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ───── Google Material Symbols import ───── */}
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                rel="stylesheet"
            />

            {/* ═══════════════ MAIN CONTENT ═══════════════ */}
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-10 py-8">

                {/* ── Hero Section ── */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm uppercase tracking-widest">
                        <MaterialIcon name="star" style={{ fontSize: '18px' }} />
                        Level Up Your Brain
                    </div>
                    <div className="flex flex-wrap justify-between items-end gap-4">
                        <div className="flex flex-col gap-2 max-w-2xl">
                            <h1 className="text-slate-900 text-4xl md:text-5xl font-black leading-tight tracking-tight">
                                Adventure Tryouts!
                            </h1>
                            <p className="text-slate-600 text-lg font-medium">
                                Pick a subject quest, earn badges, and climb the ranks. Are you ready, explorer?
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-amber-400/20 p-4 rounded-xl border border-amber-400/30">
                            <div className="bg-amber-400 p-2 rounded-lg text-white">
                                <MaterialIcon name="trophy" filled />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-500 uppercase">Current Rank</p>
                                <p className="font-bold text-slate-900">Star Explorer</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-wrap gap-3 mb-10 pb-6 border-b border-slate-200">
                    <button className="flex h-11 items-center justify-center gap-x-2 rounded-full bg-amber-400 text-slate-900 px-6 font-bold shadow-lg shadow-amber-300/20 cursor-pointer">
                        <MaterialIcon name="school" style={{ fontSize: '20px' }} />
                        {selectedBoard}
                        <MaterialIcon name="expand_more" style={{ fontSize: '20px' }} />
                    </button>
                    <button className="flex h-11 items-center justify-center gap-x-2 rounded-full bg-white text-slate-700 px-6 font-bold border border-slate-200 hover:border-amber-400 transition-all cursor-pointer">
                        <MaterialIcon name="grade" style={{ fontSize: '20px' }} />
                        {selectedClass}
                        <MaterialIcon name="expand_more" style={{ fontSize: '20px' }} />
                    </button>
                    <div className="h-11 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
                    <button className="flex h-11 items-center justify-center gap-x-2 rounded-full bg-white text-slate-700 px-6 font-bold border border-slate-200 hover:border-amber-400 transition-all cursor-pointer">
                        All Subjects
                    </button>
                    <button className="flex h-11 items-center justify-center gap-x-2 rounded-full bg-white text-slate-700 px-6 font-bold border border-slate-200 hover:border-amber-400 transition-all cursor-pointer">
                        Difficulty: Any
                    </button>
                </div>

                {/* ── Active Quest / Tryout Section ── */}
                {activeQuest && (
                    <div id="tryout-section" className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={handleBackToQuests}
                                className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 transition-all hover:bg-amber-100 cursor-pointer"
                            >
                                <MaterialIcon name="arrow_back" style={{ fontSize: '18px' }} />
                                Back to Quests
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <span className={`inline-flex w-8 h-8 rounded-lg items-center justify-center bg-gradient-to-br ${activeQuest.gradient} text-white`}>
                                    <MaterialIcon name={activeQuest.icon} style={{ fontSize: '18px' }} />
                                </span>
                                {activeQuest.title}
                            </h2>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
                            <Tryout />
                        </div>
                    </div>
                )}

                {/* ── Quests Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {QUESTS.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} onStart={handleStartQuest} />
                    ))}
                    <LockedCard />
                </div>

                {/* ── Load More ── */}
                <div className="mt-12 text-center">
                    <button className="bg-white text-slate-900 border border-slate-200 font-bold px-8 py-3 rounded-full hover:bg-slate-50 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer">
                        Load More Quests
                        <MaterialIcon name="expand_more" />
                    </button>
                </div>
            </main>

            {/* ── Explorer Status Floating Sidebar ── */}
            <div className="fixed left-8 bottom-8 hidden xl:flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xl z-40 w-64">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                    Explorer Status
                </h4>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>LEVEL {level}</span>
                        <span>{xp.toLocaleString()} / {maxXp.toLocaleString()} XP</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                            style={{ width: `${(xp / maxXp) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <MaterialIcon name="local_fire_department" filled />
                        </div>
                        <p className="text-sm font-bold">{streak} Day Streak!</p>
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="mt-auto border-t border-slate-200 py-10 bg-white">
                <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-amber-400 rounded flex items-center justify-center text-white">
                            <MaterialIcon name="auto_stories" filled style={{ fontSize: '14px' }} />
                        </div>
                        <span className="font-bold text-slate-900">EEC Adventure Study</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-slate-500">
                        <a className="hover:text-amber-500 transition-colors cursor-pointer">Privacy Policy</a>
                        <a className="hover:text-amber-500 transition-colors cursor-pointer">Terms of Quest</a>
                        <a className="hover:text-amber-500 transition-colors cursor-pointer">Help Center</a>
                    </div>
                    <div className="text-slate-400 text-sm">
                        © 2024 EEC Labs. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* ── Inline Styles for Material Symbols ── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .fill-icon {
          font-variation-settings: 'FILL' 1;
        }
        .adventure-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .adventure-card:hover {
          transform: translateY(-4px);
        }
      `}</style>
        </div>
    );
};

export default AdventureTryouts;
