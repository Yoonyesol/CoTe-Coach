import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Trophy, Zap, Target, Loader2, Lock, Sparkles, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { clsx } from 'clsx';
import { AuthError } from '@supabase/supabase-js';

const LandingPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 실시간 필드 에러 상태
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const { signInWithPassword, signUp } = useAuthStore();

    const validateEmail = (val: string) => {
        if (!val) return '이메일을 입력해 주세요.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return '올바른 이메일 형식이 아닙니다.';
        return '';
    };

    const validatePassword = (val: string) => {
        if (!val) return '비밀번호를 입력해 주세요.';
        if (val.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/.test(val)) {
            return '영문, 숫자, 특수문자를 각각 최소 하나씩 포함해야 합니다.';
        }
        return '';
    };

    // 실시간 검증 효과
    useEffect(() => {
        if (email) setEmailError(validateEmail(email));
        else setEmailError('');
    }, [email]);

    useEffect(() => {
        if (password) setPasswordError(validatePassword(password));
        else setPasswordError('');
    }, [password]);

    useEffect(() => {
        if (!isLoginMode && confirmPassword) {
            setConfirmError(password !== confirmPassword ? '비밀번호가 일치하지 않습니다.' : '');
        } else {
            setConfirmError('');
        }
    }, [confirmPassword, password, isLoginMode]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const eErr = validateEmail(email);
        const pErr = validatePassword(password);
        setEmailError(eErr);
        setPasswordError(pErr);

        if (eErr || pErr) return;

        if (!isLoginMode) {
            if (password !== confirmPassword) {
                setConfirmError('비밀번호가 일치하지 않습니다.');
                return;
            }
        }

        setIsLoading(true);
        try {
            const { error: authError } = isLoginMode
                ? await signInWithPassword(email, password)
                : await signUp(email, password);

            if (authError) throw authError;

            if (!isLoginMode) {
                setIsSignUpSuccess(true);
            }
        } catch (err: unknown) {
            if (err instanceof AuthError) {
                setError(err.message);
            } else {
                setError(isLoginMode ? '로그인 중 오류가 발생했습니다.' : '회원가입 중 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSignUpSuccess) {
        return (
            <div className="min-h-screen bg-base-900 flex items-center justify-center p-6 font-sans text-white font-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card bg-white/5 border-white/10 p-12 rounded-[3rem] max-w-lg w-full text-center relative overflow-hidden backdrop-blur-2xl shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-coral via-wheat to-misty" />
                    <div className="w-24 h-24 bg-sage/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-sage" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tighter text-white">SUCCESS!</h2>
                    <p className="text-xl text-white/60 mb-8 font-medium leading-relaxed">
                        가입이 완료되었습니다! 🚀<br />
                        입력하신 이메일로 발송된 <span className="text-coral font-bold">인증 링크</span>를 클릭하신 후 서비스 이용이 가능합니다.
                    </p>
                    <button
                        onClick={() => {
                            setIsSignUpSuccess(false);
                            setIsLoginMode(true);
                        }}
                        className="w-full py-5 bg-white text-base-900 rounded-2xl font-black hover:bg-white/90 transition-all shadow-xl active:scale-95"
                    >
                        GO TO LOGIN
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-white">
            <style>
                {`
                    input:-webkit-autofill,
                    input:-webkit-autofill:hover, 
                    input:-webkit-autofill:focus, 
                    input:-webkit-autofill:active  {
                        -webkit-box-shadow: 0 0 0 50px #1e252b inset !important;
                        -webkit-text-fill-color: white !important;
                        transition: background-color 5000s ease-in-out 0s;
                    }
                    input {
                        caret-color: #FF6B6B !important;
                    }
                `}
            </style>
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-coral/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-misty/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl w-full text-center relative z-10"
            >
                {/* Logo & Badge */}
                <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                    <span className="w-2 h-2 bg-coral rounded-full animate-pulse" />
                    <span className="text-xs font-black text-white/60 tracking-widest uppercase">The Next Gen Algorithm Coach</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
                    MASTER THE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral via-wheat to-misty">CODE ABILITY.</span>
                </h1>

                <p className="text-xl text-white/40 max-w-2xl mx-auto mb-12 font-medium leading-relaxed" style={{ textWrap: 'balance' }}>
                    당신의 성장을 시각화하고 캐릭터를 키우며 즐겁게 코딩테스트 준비를 해보세요.
                    CoTe Coach가 당신의 페이스메이커가 되어드립니다.
                </p>

                {/* Main Auth Card */}
                <div className="max-w-md mx-auto">
                    <div className="glass-card bg-white/5 border-white/10 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
                        <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginMode(true);
                                    setError(null);
                                    setEmailError('');
                                    setPasswordError('');
                                }}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl text-sm font-black transition-all font-black",
                                    isLoginMode ? "bg-white text-base-900 shadow-lg" : "text-white/40 hover:text-white"
                                )}
                            >
                                LOGIN
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginMode(false);
                                    setError(null);
                                    setEmailError('');
                                    setPasswordError('');
                                }}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl text-sm font-black transition-all font-black",
                                    !isLoginMode ? "bg-coral text-white shadow-lg" : "text-white/40 hover:text-white"
                                )}
                            >
                                SIGN UP
                            </button>
                        </div>

                        <form onSubmit={handleAuth} className="px-2">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-coral transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="이메일"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoComplete="email"
                                            className={clsx(
                                                "w-full bg-white/5 border py-5 pl-12 pr-6 rounded-2xl outline-none focus:ring-2 focus:ring-coral/50 transition-all font-bold placeholder:text-white/20",
                                                emailError ? "border-coral/50" : "border-white/10 focus:border-coral"
                                            )}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {emailError && (
                                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-coral font-bold text-left pl-4">
                                                {emailError}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-1">
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-coral transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="비밀번호"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete={isLoginMode ? "current-password" : "new-password"}
                                            className={clsx(
                                                "w-full bg-white/5 border py-5 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-coral/50 transition-all font-bold placeholder:text-white/20",
                                                passwordError ? "border-coral/50" : "border-white/10 focus:border-coral"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-coral hover:text-coral-dark transition-colors z-20"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {passwordError && (
                                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-coral font-bold text-left pl-4 leading-tight">
                                                {passwordError}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence>
                                    {!isLoginMode && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="space-y-1 overflow-hidden"
                                        >
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-coral transition-colors" />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="비밀번호 확인"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    autoComplete="new-password"
                                                    className={clsx(
                                                        "w-full bg-white/5 border py-5 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-coral/50 transition-all font-bold placeholder:text-white/20",
                                                        confirmError ? "border-coral/50" : "border-white/10 focus:border-coral"
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-coral hover:text-coral-dark transition-colors z-20"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {confirmError && (
                                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-coral font-bold text-left pl-4 font-black">
                                                    {confirmError}
                                                </motion.p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                disabled={isLoading || (emailError !== '' || passwordError !== '' || (!isLoginMode && confirmError !== ''))}
                                className={clsx(
                                    "w-full py-5 rounded-2xl font-black transition-all f-black flex items-center justify-center gap-2 group/btn active:scale-95 disabled:opacity-30 shadow-xl mt-6 font-black",
                                    isLoginMode ? "bg-white text-base-900 hover:bg-base-50" : "bg-coral text-white hover:bg-coral-dark"
                                )}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        {isLoginMode ? "LET'S START" : "CREATE ACCOUNT"}
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {!isLoginMode && (
                            <p className="mt-6 text-[11px] text-white/30 font-bold leading-relaxed px-4 text-center font-black">
                                <Sparkles className="w-3 h-3 inline mr-1 text-wheat text-center" />
                                가입 시 이메일 인증이 필요합니다. <br />
                                비밀번호는 8자 이상, 영문/숫자/특수문자 조합이 필수입니다.
                            </p>
                        )}
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                            >
                                <p className="text-coral text-sm font-black">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
                    {[
                        { icon: <Zap className="text-coral" />, title: "Real-time Stats", desc: "문제 풀이 시간을 정밀하게 측정하고 분석합니다." },
                        { icon: <Target className="text-misty" />, title: "Daily Mission", desc: "매일매일 주어지는 추천 문제로 꾸준함을 유지하세요." },
                        { icon: <Trophy className="text-wheat" />, title: "Gemification", desc: "경험치를 얻고 캐릭터를 성장시키며 상점을 이용하세요." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-left group"
                        >
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h4 className="text-white font-black mb-3">{feature.title}</h4>
                            <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
