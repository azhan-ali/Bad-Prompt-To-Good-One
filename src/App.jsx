import { useState } from 'react';
import { Sparkles, Copy, Trash2, Settings, Fingerprint, RefreshCcw } from 'lucide-react';
import './index.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTone, setSelectedTone] = useState('Standard Developer');
  
  // Use Vite environment variable for the API key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const handleEnhance = async () => {
    if (!inputText.trim()) return;

    if (!apiKey || apiKey === 'undefined' || apiKey.includes('your_api_key')) {
      setOutputText('⚠️ API Key load nahi hui bavaal! Agar tum Vercel par ho, toh dhyan rakho ki deploy se pehle "VITE_GEMINI_API_KEY" Vercel ke Environment Variables mein daalna zaroori hai. Local pe ho toh server restart maaro.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setOutputText('');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert Prompt Engineer. The user is providing a rough prompt, often written in "Roman Hindi/Urdu" (Hinglish), with spelling mistakes, grammatical errors, and missing context.
Your goal is to parse their intent and write a highly optimized, professional, and clear English prompt that the user can pass into an AI coding assistant (like Antigravity or GitHub Copilot).

Tone/Category: ${selectedTone}
Raw User Input: "${inputText}"

Rules for the enhanced prompt:
1. Make it clear and structured.
2. Outline the exact task based on their intent.
3. If they mention specific tech stacks, emphasize them.
4. If it's a bug fix, phrase it as debugging. If it's building a feature, structure it as a feature request.
5. Provide ONLY the final enhanced prompt. Do not add any introductory or concluding text like "Here is your prompt:". Just the raw prompt ready to be copy-pasted.`
            }]
          }]
        })
      });

      if (!response.ok) {
        let errDetails = '';
        try {
          const errData = await response.json();
          errDetails = errData.error?.message || JSON.stringify(errData);
        } catch(e) {
          errDetails = response.statusText;
        }
        throw new Error(`API Error ${response.status}: ${errDetails}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate prompt.';
      setOutputText(generatedText);
    } catch (error) {
      console.error(error);
      setOutputText(`Oops! Ek error aa gaya.\n\nDetails: ${error.message}\nKya tumne apna API key sahi daala hai yahi batao.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
    }
  };

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
        </div>

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
                  onChange={(e) => setInputText(e.target.value)}
                  spellCheck="false"
                ></textarea>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
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
                <button 
                  className="btn btn-icon" 
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                  disabled={!outputText}
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {outputText ? (
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
      </main>
    </>
  );
}

export default App;
