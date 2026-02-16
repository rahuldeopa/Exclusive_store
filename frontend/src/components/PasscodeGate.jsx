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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await validatePasscode(passcode);

      if (!result.ok) {
        setError(result.data?.message || 'Invalid passcode');
        return;
      }

      setPasscode('');
      onUnlock(result.data?.data?.content, passcode);
    } catch (err) {
      setError('Unable to connect. Please try again.');
      console.error('Passcode validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setPasscode(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="relative w-full min-h-screen bg-linear-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating vinyl records */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-linear-to-br from-purple-500/20 to-pink-500/20 border-4 border-purple-400/30"
        animate={{
          rotate: 360,
          y: [0, -20, 0],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-black/40"></div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-20 w-40 h-40 rounded-full bg-linear-to-br from-cyan-500/20 to-blue-500/20 border-4 border-cyan-400/30"
        animate={{
          rotate: -360,
          y: [0, 15, 0],
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/40"></div>
        </div>
      </motion.div>

      {/* Sound wave visualization */}
      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 px-4 opacity-20">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-linear-to-t from-purple-500 to-pink-500 rounded-t"
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
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none"></div>

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
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-linear-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Premium Access
              </h1>
              <p className="text-gray-300 text-sm md:text-base uppercase tracking-[0.3em] font-light">
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
                  className="block text-gray-300 text-sm uppercase tracking-wider mb-3 font-medium"
                >
                  Access Code
                </label>
                <div className="relative group">
                  <input
                    id="passcode"
                    type="password"
                    value={passcode}
                    onChange={handleInputChange}
                    placeholder="Enter your code"
                    disabled={loading}
                    autoFocus
                    aria-label="Passcode input"
                    className="w-full bg-white/5 border-2 border-white/10 text-white placeholder-gray-500 px-6 py-4 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300 font-mono text-lg tracking-wider"
                  />
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {error && (
                <motion.div
                  className="bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl text-sm text-red-300 backdrop-blur-sm"
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
                className="relative w-full px-8 py-4 bg-linear-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 overflow-hidden group"
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
              className="mt-10 pt-8 border-t border-white/10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-2">
                🎵 Exclusive Digital Content
              </p>
              <p className="text-gray-500 text-xs">
                Premium music & video collection
              </p>
            </motion.div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 blur-3xl opacity-60 rounded-3xl"></div>
      </motion.div>
    </div>
  );
}