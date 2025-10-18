"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Terminal, Shield, AlertTriangle } from 'lucide-react'

interface CodeFragment {
    id: number
    code: string
    x: number
    y: number
    speed: number
    type: 'safe' | 'virus' | 'firewall'
}

interface EasterEggGameProps {
    isOpen: boolean
    onClose: () => void
}

const GAME_WIDTH = 16
const GAME_HEIGHT = 25
const CODE_FRAGMENTS = [
    'init()', 'decrypt()', 'access()', 'bypass()', 'inject()', 'compile()',
    'execute()', 'parse()', 'encode()', 'decode()', 'encrypt()', 'hack()',
    'breach()', 'exploit()', 'payload()', 'shell()', 'root()', 'admin()'
]

export function EasterEggGame({ isOpen, onClose }: EasterEggGameProps) {
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [codeFragments, setCodeFragments] = useState<CodeFragment[]>([])
    const [currentInput, setCurrentInput] = useState('')
    const [health, setHealth] = useState(100)
    const [level, setLevel] = useState(1)
    const [nextId, setNextId] = useState(0)
    const [combo, setCombo] = useState(0)
    const [showAlert, setShowAlert] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem('aurafx-matrix-highscore')
        if (saved) {
            setHighScore(parseInt(saved))
        }
    }, [])

    // Generate random code fragment
    const generateCodeFragment = useCallback(() => {
        const types: Array<'safe' | 'virus' | 'firewall'> = ['safe', 'safe', 'safe', 'virus', 'firewall'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomCode = CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)];

        return {
            id: nextId,
            code: randomCode,
            x: Math.floor(Math.random() * (GAME_WIDTH - 6)) + 1,
            y: 0,
            speed: Math.random() * 0.3 + 0.3 + (level * 0.05),
            type: randomType
        };
    }, [nextId, level]);

    // Reset game
    const resetGame = () => {
        setScore(0)
        setHealth(100)
        setLevel(1)
        setGameOver(false)
        setIsPlaying(true)
        setCodeFragments([])
        setCurrentInput('')
        setCombo(0)
        setNextId(0)
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    // Game loop
    useEffect(() => {
        if (!isPlaying || gameOver) return

        const gameInterval = setInterval(() => {
            setCodeFragments(prev => {
                const updated = prev.map(fragment => ({
                    ...fragment,
                    y: fragment.y + fragment.speed
                }));

                // Check for fragments that hit the bottom
                const hitBottom = updated.filter(f => f.y >= GAME_HEIGHT - 1);
                if (hitBottom.length > 0) {
                    const damage = hitBottom.reduce((acc, f) =>
                        acc + (f.type === 'virus' ? 20 : f.type === 'firewall' ? 10 : 5), 0
                    );
                    setHealth(prev => {
                        const newHealth = Math.max(0, prev - damage);
                        if (newHealth <= 0) {
                            setGameOver(true);
                            setIsPlaying(false);
                        }
                        return newHealth;
                    });
                    setCombo(0);
                }

                // Remove fragments that hit the bottom
                return updated.filter(f => f.y < GAME_HEIGHT);
            });

            // Level progression
            setScore(prev => {
                const newScore = prev + 1;
                if (newScore > 0 && newScore % 100 === 0) {
                    setLevel(l => l + 1);
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 2000);
                }
                return newScore;
            });
        }, 150);

        return () => clearInterval(gameInterval);
    }, [isPlaying, gameOver]);

    // Generate new fragments
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const generateInterval = setInterval(() => {
            setCodeFragments(prev => [...prev, generateCodeFragment()]);
            setNextId(prev => prev + 1);
        }, Math.max(800, 2500 - (level * 150)));

        return () => clearInterval(generateInterval);
    }, [isPlaying, gameOver, generateCodeFragment, level]);

    // Handle input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setCurrentInput(input);

        // Check if input matches any falling fragment
        const matchingFragment = codeFragments.find(f =>
            f.code.toLowerCase().startsWith(input.toLowerCase()) &&
            f.y > GAME_HEIGHT - 8
        );

        if (matchingFragment && input.toLowerCase() === matchingFragment.code.toLowerCase()) {
            // Fragment caught!
            setCodeFragments(prev => prev.filter(f => f.id !== matchingFragment.id));
            setCurrentInput('');

            const points = matchingFragment.type === 'virus' ? 30 :
                matchingFragment.type === 'firewall' ? 20 : 10;
            const comboBonus = combo * 5;

            setScore(prev => {
                const newScore = prev + points + comboBonus;
                if (newScore > highScore) {
                    setHighScore(newScore);
                    localStorage.setItem('aurafx-matrix-highscore', newScore.toString());
                }
                return newScore;
            });

            setCombo(prev => prev + 1);

            // Heal for catching viruses
            if (matchingFragment.type === 'virus') {
                setHealth(prev => Math.min(100, prev + 10));
            }
        }
    };

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999999999] bg-black flex items-center justify-center p-4"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 2147483647
                }}
                onClick={onClose}
            >
                {/* YouTube Video Background - Full Screen */}
                <div className="absolute inset-0 opacity-50">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&loop=1&playlist=dQw4w9WgXcQ&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&start=0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        style={{
                            pointerEvents: 'none',
                            transform: 'scale(1.5)',
                            transformOrigin: 'center',
                            width: '100vw',
                            height: '100vh'
                        }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-black/95 border border-green-500/30 rounded-lg overflow-hidden max-w-4xl w-full h-[90vh] shadow-2xl shadow-green-500/20"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Matrix Rain Effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-green-500/10 text-xs font-mono animate-pulse"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${3 + Math.random() * 4}s`
                                }}
                            >
                                {CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)]}
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="relative flex items-center justify-between p-4 border-b border-green-500/30 bg-black/50">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-5 h-5 text-green-500" />
                            <div>
                                <h3 className="font-mono text-green-500 text-sm">MATRIX_TERMINAL_v2.0</h3>
                                <p className="font-mono text-green-500/60 text-xs">// TOP SECRET // ACCESS GRANTED //</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-green-500/60 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="relative flex items-center justify-between p-3 bg-black/50 border-b border-green-500/30">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-green-500/60 text-xs">SCORE:</span>
                                <span className="font-mono text-green-500 text-sm">{score.toString().padStart(6, '0')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-3 h-3 text-yellow-500" />
                                <span className="font-mono text-yellow-500 text-sm">{highScore}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-green-500/60 text-xs">LEVEL:</span>
                                <span className="font-mono text-green-500 text-sm">{level}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-green-500/60 text-xs">COMBO:</span>
                                <span className="font-mono text-cyan-500 text-sm">x{combo}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                    style={{ width: `${health}%` }}
                                    animate={{ width: `${health}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <span className="font-mono text-blue-500 text-xs">{health}%</span>
                        </div>
                    </div>

                    {/* Game Board */}
                    <div className="relative p-4 bg-black/70">
                        <div
                            className="relative mx-auto font-mono text-xs"
                            style={{
                                width: GAME_WIDTH * 40,
                                height: GAME_HEIGHT * 20,
                            }}
                        >
                            {/* Grid Lines */}
                            <div className="absolute inset-0 opacity-10">
                                {Array.from({ length: GAME_HEIGHT }).map((_, y) => (
                                    <div
                                        key={y}
                                        className="absolute w-full border-t border-green-500/20"
                                        style={{ top: y * 20 }}
                                    />
                                ))}
                            </div>

                            {/* Code Fragments */}
                            {codeFragments.map(fragment => (
                                <motion.div
                                    key={fragment.id}
                                    className={`absolute font-mono text-xs ${fragment.type === 'virus' ? 'text-red-500' :
                                        fragment.type === 'firewall' ? 'text-yellow-500' :
                                            'text-green-500'
                                        }`}
                                    style={{
                                        left: fragment.x * 40,
                                        top: fragment.y * 20,
                                    }}
                                    animate={{
                                        textShadow: fragment.type === 'virus' ?
                                            ['0 0 5px rgba(239, 68, 68, 0.5)', '0 0 10px rgba(239, 68, 68, 0.8)', '0 0 5px rgba(239, 68, 68, 0.5)'] :
                                            fragment.type === 'firewall' ?
                                                ['0 0 5px rgba(245, 158, 11, 0.5)', '0 0 10px rgba(245, 158, 11, 0.8)', '0 0 5px rgba(245, 158, 11, 0.5)'] :
                                                ['0 0 5px rgba(34, 197, 94, 0.5)', '0 0 10px rgba(34, 197, 94, 0.8)', '0 0 5px rgba(34, 197, 94, 0.5)']
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {fragment.code}
                                </motion.div>
                            ))}

                            {/* Input Area */}
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500">&gt;</span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={currentInput}
                                        onChange={handleInputChange}
                                        className="bg-transparent text-green-500 font-mono text-sm outline-none w-48"
                                        placeholder="TYPE_CODE..."
                                        disabled={!isPlaying || gameOver}
                                    />
                                    <motion.div
                                        className="w-1 h-4 bg-green-500"
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Level Up Alert */}
                        <AnimatePresence>
                            {showAlert && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-cyan-500/20 border border-cyan-500 rounded px-4 py-2"
                                >
                                    <span className="font-mono text-cyan-500 text-sm">LEVEL {level} UNLOCKED</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Game Over Overlay */}
                        <AnimatePresence>
                            {gameOver && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/90 flex items-center justify-center"
                                >
                                    <div className="text-center">
                                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                        <div className="font-mono text-red-500 text-xl mb-2">SYSTEM BREACHED</div>
                                        <div className="font-mono text-green-500 mb-4">Final Score: {score}</div>
                                        <button
                                            onClick={resetGame}
                                            className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-500 rounded hover:bg-green-500/30 transition-colors font-mono text-sm"
                                        >
                                            REINITIALIZE
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Start Screen */}
                        <AnimatePresence>
                            {!isPlaying && !gameOver && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/90 flex items-center justify-center"
                                >
                                    <div className="text-center">
                                        <Terminal className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                        <div className="font-mono text-green-500 text-lg mb-2">MATRIX HACKER</div>
                                        <div className="font-mono text-green-500/60 text-xs mb-2">TYPE FALLING CODES</div>
                                        <div className="font-mono text-red-500/60 text-xs mb-2">AVOID VIRUSES (RED)</div>
                                        <div className="font-mono text-yellow-500/60 text-xs mb-4">BREAK FIREWALLS (YELLOW)</div>
                                        <button
                                            onClick={resetGame}
                                            className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-500 rounded hover:bg-green-500/30 transition-colors font-mono text-sm"
                                        >
                                            INITIATE HACK
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Instructions */}
                    <div className="relative p-3 bg-black/50 border-t border-green-500/30">
                        <div className="font-mono text-green-500/60 text-xs text-center">
                            [TYPE THE FALLING CODES BEFORE THEY HIT BOTTOM] • [CATCH VIRUSES FOR BONUS POINTS]
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}