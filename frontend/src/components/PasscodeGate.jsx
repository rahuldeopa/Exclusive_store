import { useState } from 'react';
import { motion } from 'framer-motion';
import { validatePasscode } from '../services/api';

/**
 * PasscodeGate Component
 * Implements the Premium Artistic Design System:
 * Pure black backdrop, burnt orange accents, and editorial typography.
 */
export default function PasscodeGate({ onUnlock }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (passcode.length === 0) return;
    setError('');
    setLoading(true);

    try {
      const result = await validatePasscode(passcode);

      if (!result.ok) {
        setError(result.data?.message || 'Invalid passcode');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }

      setPasscode('');
      onUnlock(result.data?.data?.content, passcode);
    } catch (err) {
      setError('Unable to connect. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      console.error('Passcode validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    setPasscode(val);
    if (error) setError('');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f5f3f0] dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#f5f3f0] flex items-center justify-center overflow-hidden transition-colors duration-500">
      {/* Premium Grain Overlay - Adds tactile, handcrafted feel */}
      <div className="grain-overlay" />

      {/* Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#ff6b35]/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#ff6b35]/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating Artistic Elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full border border-[#ff6b35]/20 backdrop-blur-md shadow-xl shadow-[#ff6b35]/5"
        animate={{ rotate: 360, y: [0, -15, 0] }}
        transition={{
          rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-[#ff6b35]/30 shadow-inner" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-20 w-40 h-40 rounded-full border border-[#ff6b35]/20 backdrop-blur-md shadow-xl shadow-[#ff6b35]/10"
        animate={{ rotate: -360, y: [0, 20, 0] }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#ff6b35]/30 shadow-inner" />
        </div>
      </motion.div>

      {/* Main Access Card */}
      <motion.div
        className="relative z-10 w-full max-w-lg mx-4"
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="glass-panel-light rounded-3xl overflow-hidden transition-colors duration-500 border-slate-800 dark:border-[#2a2a2a]"
          animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="relative px-8 py-12 md:px-12 md:py-16">
            {/* Header */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-[#ff6b35] shadow-xl shadow-[#ff6b35]/30 ring-4 ring-[#0a0a0a]"
                animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-light mb-3 text-[#0a0a0a] dark:text-[#f5f3f0] tracking-tight font-serif">
                Premium Access
              </h1>
              <p className="text-[#888888] text-xs md:text-sm uppercase tracking-[0.3em] font-bold">
                Artistic • Exclusive • Private
              </p>
            </motion.div>

            {/* Access Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="relative">
                <label
                  htmlFor="passcode"
                  className="block text-[#888888] text-[10px] uppercase tracking-widest mb-3 font-bold pl-1"
                >
                  Access Code
                </label>
                <div className="relative group">
                  <input
                    id="passcode"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    value={passcode}
                    onChange={handleInputChange}
                    placeholder="ENTER CODE"
                    disabled={loading}
                    autoFocus
                    aria-label="Passcode input"
                    className="w-full bg-white/40 dark:bg-[#1a1a1a]/50 border-b-2 border-[#464646] text-[#0a0a0a] dark:text-[#f5f3f0] placeholder-[#555555] px-0 py-4 focus:outline-none focus:border-[#ff6b35] transition-all duration-500 font-mono text-center text-lg md:text-xl tracking-[0.4em]"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] bg-[#ff6b35] transition-all duration-500" style={{ width: `${(passcode.length / 6) * 100}%`, maxWidth: '100%' }} />
                </div>
              </div>

              {error && (
                <motion.div
                  className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 px-4 py-3 rounded-xl text-sm text-[#ff8c5a] shadow-sm"
                  role="alert"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={!passcode || loading}
                className="relative w-full px-8 py-4 bg-[#ff6b35] hover:bg-[#ff8c5a] text-white font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl shadow-[0_12px_24px_rgba(255,107,53,0.25)] hover:translate-y-[-2px] overflow-hidden group active:scale-95"
                whileHover={!loading && passcode ? { scale: 1.01 } : {}}
              >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.svg
                        className="w-5 h-5"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </motion.svg>
                      <span className="tracking-wider">Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <span className="tracking-widest">Enter</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div
              className="mt-10 pt-8 border-t border-[#2a2a2a] text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <p className="text-[#888888] text-xs uppercase mb-2 font-bold select-none tracking-widest">
                Exclusive Digital Content
              </p>
              <p className="text-[#555555] text-xs font-medium select-none">
                Premium music & video collection
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
