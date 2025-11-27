/**
 * Speech Service
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS)
 */

class SpeechService {
    constructor() {
        this.recognition = null;
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

    async speak(text, onEnd) {
        console.log('Speaking:', text);

        try {
            // Call the TTS API
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voiceName: 'Kora' // Spanish female voice
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('TTS API error:', error);
                throw new Error(error.error || 'Failed to generate speech');
            }

            const data = await response.json();

            // Convert base64 to audio and play
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioData = atob(data.audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);

            for (let i = 0; i < audioData.length; i++) {
                view[i] = audioData.charCodeAt(i);
            }

            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            source.onended = () => {
                console.log('Audio finished playing');
                if (onEnd) onEnd();
            };

            source.start(0);
            console.log('Playing audio...');

        } catch (error) {
            console.error('Error in speak:', error);
            if (onEnd) onEnd();
        }
    }
}

const speechService = new SpeechService();
export default speechService;


