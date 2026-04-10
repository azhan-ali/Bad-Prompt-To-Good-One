import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Copy, Check, Trash2, Settings, Fingerprint, RefreshCcw, History, X, AlertTriangle, RotateCcw } from 'lucide-react';
import './index.css';

const MAX_CHARS = 2000;
const HISTORY_KEY = 'prompt_buddy_history';
const MAX_HISTORY = 20;

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTone, setSelectedTone] = useState('Standard Developer');
  const [copyState, setCopyState] = useState('idle');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hasError, setHasError] = useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore corrupt storage */ }
  }, []);

  const saveHistory = (input, output, tone) => {
    const entry = { id: Date.now(), input, output, tone, date: new Date().toLocaleString() };
    const updated = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch { /* full storage */ }
  };

  const deleteHistoryItem = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  };

  const buildPromptText = useCallback((tone, raw) => {
    return `You are an expert Prompt Engineer. The user is providing a rough prompt, often written in "Roman Hindi/Urdu" (Hinglish), with spelling mistakes, grammatical errors, and missing context.
Your goal is to parse their intent and write a highly optimized, professional, and clear English prompt that the user can pass into an AI coding assistant (like Antigravity or GitHub Copilot).

Tone/Category: ${tone}
Raw User Input: "${raw}"

Rules for the enhanced prompt:
1. Make it clear and structured.
2. Outline the exact task based on their intent.
3. If they mention specific tech stacks, emphasize them.
4. If it's a bug fix, phrase it as debugging. If it's building a feature, structure it as a feature request.
5. Provide ONLY the final enhanced prompt. Do not add any introductory or concluding text like "Here is your prompt:". Just the raw prompt ready to be copy-pasted.`;
  }, []);

  const handleEnhance = async () => {
    if (!inputText.trim()) return;

    if (!apiKey || apiKey === 'undefined' || apiKey.includes('your_api_key')) {
      setOutputText('API Key not found! Make sure VITE_GEMINI_API_KEY is set in your Vercel Environment Variables (or .env locally). Redeploy after adding it.');
      setHasError(true);
      return;
    }

    setIsProcessing(true);
    setOutputText('');
    setHasError(false);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: buildPromptText(selectedTone, inputText),
      });

      const generatedText = response.text || 'Failed to generate prompt.';
      setOutputText(generatedText);
      setHasError(false);
      saveHistory(inputText, generatedText, selectedTone);
    } catch (error) {
      console.error(error);
      setHasError(true);
      setOutputText(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (inputText.trim()) handleEnhance();
  };

  const copyToClipboard = async () => {
    if (!outputText || hasError) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('idle');
    }
  };

  const loadFromHistory = (entry) => {
    setInputText(entry.input);
    setOutputText(entry.output);
    setSelectedTone(entry.tone);
    setShowHistory(false);
    setHasError(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) setInputText(val);
  };

  const charPercent = (inputText.length / MAX_CHARS) * 100;

  return (
    <>
      {/* Animated Background */}
      <div className="bg-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="pattern-overlay"></div>

      <header className="app-header">
        <div className="hero-badge fade-in-up">
          <Sparkles size={14} style={{color: 'var(--accent-color)'}} />
          Boost your dev workflow with <span>AI power</span>
        </div>
        <h1 className="app-title fade-in-up delay-1"><span className="text-gradient">Prompt</span> <span className="font-cursive">Buddy!</span></h1>
        <p className="app-subtitle fade-in-up delay-2">Convert your rough Hinglish tech ideas into supercharged English AI prompts.</p>
      </header>

      <main className="main-container fade-in-up delay-3">
        
        {/* Settings Bar */}
        <div className="glass-panel controls-bar" style={{ borderRadius: '16px', padding: '0.75rem 1.5rem', width: '100%' }}>
          <div className="select-wrapper">
            <Settings size={18} />
            <select 
              className="styled-select"
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
            >
              <option value="Standard Developer">Standard Developer Flow</option>
              <option value="UI/UX Focus">UI/UX & Design Focus</option>
              <option value="Bug Fixing">Bug Fixing & Debugging</option>
              <option value="Architecture/Planning">Architecture & Planning</option>
              <option value="Feature Building">Feature Building</option>
              <option value="Innovative Ideas Thinking">Innovative Ideas Thinking</option>
              <option value="Normal Talk">Normal Talk</option>
            </select>
          </div>
          <button
            className="btn btn-icon"
            onClick={() => setShowHistory(!showHistory)}
            title="Prompt History"
            style={{ position: 'relative' }}
          >
            <History size={18} />
            {history.length > 0 && <span className="history-badge">{history.length}</span>}
          </button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="glass-panel history-panel">
            <div className="history-header">
              <span className="history-title"><History size={16} /> Prompt History</span>
              <div className="card-actions">
                {history.length > 0 && (
                  <button className="btn btn-icon btn-danger-subtle" onClick={clearHistory} title="Clear all history">
                    <Trash2 size={16} />
                  </button>
                )}
                <button className="btn btn-icon" onClick={() => setShowHistory(false)} title="Close">
                  <X size={16} />
                </button>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="history-empty">No history yet. Enhance a prompt to get started!</div>
            ) : (
              <div className="history-list">
                {history.map(entry => (
                  <div key={entry.id} className="history-item" onClick={() => loadFromHistory(entry)}>
                    <div className="history-item-top">
                      <span className="history-item-tone">{entry.tone}</span>
                      <div style={{display:'flex',gap:'0.25rem',alignItems:'center'}}>
                        <span className="history-item-date">{entry.date}</span>
                        <button
                          className="btn btn-icon btn-danger-subtle"
                          onClick={(e) => { e.stopPropagation(); deleteHistoryItem(entry.id); }}
                          title="Delete this entry"
                          style={{padding:'0.25rem'}}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="history-item-text">{entry.input}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid-container">
          
          {/* Input Panel */}
          <div className="card glass-panel">
            <div className="card-header">
              <div className="card-title">
                <Fingerprint size={20} className="card-title-icon" />
                Raw Input (Roman/Hinglish)
              </div>
              <div className="card-actions">
                <button 
                  className="btn btn-icon" 
                  onClick={() => setInputText('')}
                  title="Clear input"
                  disabled={!inputText}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <div className="textarea-wrapper">
                <textarea 
                  className="styled-textarea"
                  placeholder="Apna bekar sa prompt yaha daalo... (e.g. 'ek mast sa login page banao jisme dark mode ho aur react use ho')"
                  value={inputText}
                  onChange={handleInputChange}
                  spellCheck="false"
                  maxLength={MAX_CHARS}
                ></textarea>
              </div>
              
              <div className="input-footer">
                <div className={`char-counter ${charPercent > 90 ? 'char-warn' : ''}`}>
                  <div className="char-bar">
                    <div className="char-bar-fill" style={{ width: `${Math.min(charPercent, 100)}%` }}></div>
                  </div>
                  <span>{inputText.length}/{MAX_CHARS}</span>
                </div>
                <button 
                  className={`btn btn-primary ${isProcessing ? 'processing-btn' : ''}`}
                  onClick={handleEnhance}
                  disabled={isProcessing || !inputText.trim()}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCcw size={18} className="spinner" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Enhance Prompt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="card glass-panel">
            <div className="card-header">
              <div className="card-title">
                <Sparkles size={20} className="card-title-icon" style={{color: '#c084fc'}} />
                Supercharged Prompt
              </div>
              <div className="card-actions">
                {hasError && outputText && (
                  <button
                    className="btn btn-icon"
                    onClick={handleRetry}
                    title="Retry"
                    disabled={isProcessing}
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
                <button 
                  className="btn btn-icon" 
                  onClick={copyToClipboard}
                  title={copyState === 'copied' ? 'Copied!' : 'Copy to clipboard'}
                  disabled={!outputText || hasError}
                >
                  {copyState === 'copied' ? <Check size={18} style={{color: 'var(--success-color)'}} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {isProcessing ? (
                <div className="skeleton-container">
                  <div className="skeleton-line skeleton-line-full"></div>
                  <div className="skeleton-line skeleton-line-80"></div>
                  <div className="skeleton-line skeleton-line-60"></div>
                  <div className="skeleton-line skeleton-line-90"></div>
                  <div className="skeleton-line skeleton-line-70"></div>
                </div>
              ) : hasError && outputText ? (
                <div className="error-container">
                  <AlertTriangle size={32} style={{color: '#f87171', marginBottom: '0.5rem'}} />
                  <div className="error-text">{outputText}</div>
                  <button className="btn btn-primary" onClick={handleRetry} style={{marginTop: '1rem'}}>
                    <RotateCcw size={16} /> Retry
                  </button>
                </div>
              ) : outputText ? (
                <div className="output-area">{outputText}</div>
              ) : (
                <div className="output-placeholder">
                  <Sparkles size={48} style={{ opacity: 0.2 }} />
                  <p>Aapka super prompt yaha dikhega!</p>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Copy Toast */}
        <div className={`copy-toast ${copyState === 'copied' ? 'copy-toast-show' : ''}`}>
          <Check size={16} /> Copied to clipboard!
        </div>
      </main>
    </>
  );
}

export default App;
