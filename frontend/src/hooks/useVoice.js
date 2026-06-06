import { useState, useRef, useCallback, useEffect } from 'react';

const RECOGNITION_LANG = 'en-US';

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useVoice() {
  const [micOn, setMicOn] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const micOnRef = useRef(false);
  const bufferRef = useRef('');
  const cancelRef = useRef(false);

  const isSupported = typeof window !== 'undefined' && !!getSpeechRecognition();

  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  const toggleMic = useCallback(() => {
    return new Promise((resolve) => {
      const SpeechRecognition = getSpeechRecognition();
      if (!SpeechRecognition) { resolve(''); return; }

      // --- STOP RECORDING ---
      if (micOnRef.current) {
        cancelRef.current = true;
        const rec = recognitionRef.current;
        if (rec) {
          rec.onend = () => {
            recognitionRef.current = null;
            const result = bufferRef.current;
            bufferRef.current = '';
            setTranscript('');
            resolve(result);
          };
          rec.onresult = null;
          rec.onerror = null;
          try { rec.stop(); } catch (_) {}
        } else {
          const result = bufferRef.current;
          bufferRef.current = '';
          setTranscript('');
          resolve(result);
        }
        setMicOn(false);
        micOnRef.current = false;
        return;
      }

      // --- START RECORDING ---
      cancelRef.current = false;
      bufferRef.current = '';
      setTranscript('');

      if (synthRef.current?.speaking) {
        synthRef.current.cancel();
        setAiSpeaking(false);
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = RECOGNITION_LANG;

      rec.onresult = (event) => {
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) {
            finalChunk += r[0].transcript;
          }
        }
        if (finalChunk) {
          bufferRef.current = (bufferRef.current + ' ' + finalChunk).trim();
        }
        const last = event.results[event.results.length - 1];
        const display = bufferRef.current || last?.[0]?.transcript || '';
        setTranscript(display);
      };

      rec.onerror = () => {
        if (micOnRef.current) {
          setMicOn(false);
          micOnRef.current = false;
        }
      };

      rec.onend = () => {
        if (!cancelRef.current && micOnRef.current) {
          try {
            const newRec = new SpeechRecognition();
            newRec.continuous = true;
            newRec.interimResults = true;
            newRec.lang = RECOGNITION_LANG;
            newRec.onresult = rec.onresult;
            newRec.onerror = rec.onerror;
            newRec.onend = () => {
              if (!cancelRef.current && micOnRef.current) {
                try { newRec.start(); } catch (_) {}
              }
            };
            recognitionRef.current = newRec;
            newRec.start();
          } catch (_) {}
        }
      };

      recognitionRef.current = rec;
      try {
        rec.start();
        setMicOn(true);
        micOnRef.current = true;
        resolve(''); // starting – return empty, caller checks micOn
      } catch (err) {
        setMicOn(false);
        micOnRef.current = false;
        resolve('');
      }
    });
  }, []);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      const synth = synthRef.current;
      if (!synth) { resolve(); return; }

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      const trySpeak = () => {
        const voices = synth.getVoices();
        const preferred = voices.find(v => v.lang.startsWith('en') && /female|woman|girl/i.test(v.name))
          || voices.find(v => v.lang.startsWith('en'))
          || voices[0];
        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => setAiSpeaking(true);
        utterance.onend = () => { setAiSpeaking(false); resolve(); };
        utterance.onerror = () => { setAiSpeaking(false); resolve(); };

        synth.speak(utterance);
      };

      if (synth.getVoices().length === 0) {
        const fallbackTimer = setTimeout(trySpeak, 300);
        synth.onvoiceschanged = () => {
          synth.onvoiceschanged = null;
          clearTimeout(fallbackTimer);
          trySpeak();
        };
      } else {
        trySpeak();
      }
    });
  }, []);

  const cancelSpeech = useCallback(() => {
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
      setAiSpeaking(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    micOn,
    aiSpeaking,
    transcript,
    toggleMic,
    speak,
    cancelSpeech,
    isSupported
  };
}
