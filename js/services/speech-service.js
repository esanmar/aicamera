/**
 * Speech Service
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS)
 */

class SpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.onResultCallback = null;
        this.onEndCallback = null;
        this.language = 'es-ES'; // Spanish by default

        this.initRecognition();
    }

    initRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false; // Stop after one sentence
            this.recognition.interimResults = true;
            this.recognition.lang = this.language;

            this.recognition.onresult = (event) => {
                console.log('Speech recognition result event:', event);
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                console.log('Transcripts:', { final: finalTranscript, interim: interimTranscript });

                if (this.onResultCallback) {
                    this.onResultCallback({ final: finalTranscript, interim: interimTranscript });
                }
            };

            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                this.isListening = false;
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                this.isListening = false;
            };
        } else {
            console.error('Speech recognition not supported in this browser.');
        }
    }

    startListening(onResult, onEnd) {
        console.log('Starting listening...');
        if (!this.recognition) return;
        if (this.isListening) {
            console.log('Already listening');
            return;
        }

        this.onResultCallback = onResult;
        this.onEndCallback = onEnd;

        try {
            this.recognition.start();
            this.isListening = true;
            console.log('Recognition started');
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    }

    stopListening() {
        if (!this.recognition) return;
        this.recognition.stop();
        this.isListening = false;
    }

    speak(text, onEnd) {
        if (!this.synthesis) return;

        // Cancel any current speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.language;

        // Try to find a Spanish voice
        const voices = this.synthesis.getVoices();
        const spanishVoice = voices.find(voice => voice.lang.includes('es'));
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }

        utterance.onend = () => {
            if (onEnd) onEnd();
        };

        this.synthesis.speak(utterance);
    }
}

const speechService = new SpeechService();
export default speechService;


