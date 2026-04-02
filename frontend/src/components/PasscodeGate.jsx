import { useState } from 'react';
import { motion } from 'framer-motion';
import { validatePasscode } from '../services/api';

/**
 * PasscodeGate Component
 * Premium music store authentication with vinyl-inspired design
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
        setTimeout(() => setIsShaking(false), 500); // Reset shake after animation
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
    // Only allow alphanumeric to match typical short passcodes
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    setPasscode(val);
    if (error) setError('');
    
    // Auto submit if it looks like a complete PIN (e.g., 6 chars)
    if (val.length === 6) {
      setTimeout(() => {
        handleSubmit();
      }, 50); // slight delay to state updates
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-linear-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center overflow-hidden transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_50%)]"></div>
      </div>

      {/* Floating abstract rings */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-linear-to-br from-blue-400/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 border border-white/60 dark:border-white/5 backdrop-blur-md shadow-xl shadow-blue-500/5"
        animate={{
          rotate: 360,
          y: [0, -15, 0],
        }}
        transition={{
          rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/60 dark:bg-white/10 shadow-inner"></div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-20 w-40 h-40 rounded-full bg-linear-to-br from-indigo-300/20 to-purple-300/20 dark:from-indigo-500/10 dark:to-purple-500/10 border border-white/60 dark:border-white/5 backdrop-blur-md shadow-xl shadow-indigo-500/10"
        animate={{
          rotate: -360,
          y: [0, 20, 0],
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 shadow-inner"></div>
        </div>
      </motion.div>

      {/* Sound wave visualization */}
      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 px-4 opacity-40">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-linear-to-t from-blue-300 to-indigo-300 rounded-t"
            animate={{
              height: ['20%', `${Math.random() * 80 + 20}%`, '20%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.05,
              ease: 'easeInOut',
            }}
          ></motion.div>
        ))}
      </div>

      {/* Main content card */}
      <motion.div
        className="relative z-10 w-full max-w-lg mx-4"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          className="glass-panel-light rounded-3xl overflow-hidden transition-colors duration-500"
          animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-blue-50/40 dark:from-white/5 dark:to-indigo-500/5 pointer-events-none"></div>

          <div className="relative px-8 py-12 md:px-12 md:py-16">
            {/* Header with music icon */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {/* Music note icon */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 dark:shadow-blue-900/40 ring-4 ring-white dark:ring-slate-800"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                Premium Access
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base uppercase tracking-[0.2em] font-semibold">
                Music • Videos • Exclusive Content
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div>
                <label
                  htmlFor="passcode"
                  className="block text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider mb-3 font-bold"
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
                    autoCapitalize="characters"
                    value={passcode}
                    onChange={handleInputChange}
                    placeholder="Enter your code"
                    disabled={loading}
                    autoFocus
                    aria-label="Passcode input"
                    className="w-full bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-6 py-4 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-300 font-mono text-center text-lg md:text-xl tracking-[0.3em] md:tracking-[0.5em] uppercase"
                  />
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {error && (
                <motion.div
                  className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 rounded-xl text-sm text-red-600 dark:text-red-400 shadow-sm"
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
                className="relative w-full px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.2)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.3)] dark:shadow-[0_8px_20px_rgba(79,70,229,0.4)] overflow-hidden group"
                whileHover={!loading && passcode ? { scale: 1.02 } : {}}
                whileTap={!loading && passcode ? { scale: 0.98 } : {}}
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
                      <span>Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter</span>
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
              className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <p className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-2 font-bold select-none">
                🎵 Exclusive Digital Content
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-medium select-none">
                Premium music & video collection
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Subtle underglow */}
        <div className="absolute inset-x-10 -bottom-6 -z-10 bg-blue-500/10 dark:bg-blue-500/20 blur-2xl h-12 rounded-full"></div>
      </motion.div>
    </div>
  );
}