/**
 * Captioning View Component
 * Main view for live video captioning
 */

import { createElement } from '../utils/dom-helpers.js';
import { createDraggableContainer } from './DraggableContainer.js';
import { createLiveCaption } from './LiveCaption.js';
import vlmService from '../services/vlm-service.js';
import speechService from '../services/speech-service.js';
import { PROMPTS } from '../utils/constants.js';

export function createCaptioningView(videoElement) {
    const container = createElement('div', {
        className: 'absolute inset-0 text-white'
    });

    const innerContainer = createElement('div', {
        className: 'relative w-full h-full'
    });

    // State
    let isRunning = false;
    let isProcessing = false;
    let currentPrompt = PROMPTS.default;

    // Create components
    const liveCaptionComponent = createLiveCaption();

    // Create microphone button
    const micButton = createElement('button', {
        className: 'mic-button',
        innerHTML: `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
        `,
        style: {
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            zIndex: '50'
        }
    });

    // Add styles for mic button states
    const style = document.createElement('style');
    style.textContent = `
        .mic-button:hover {
            background-color: rgba(255, 255, 255, 0.3) !important;
            transform: translateX(-50%) scale(1.05) !important;
        }
        .mic-button.listening {
            background-color: rgba(239, 68, 68, 0.5) !important;
            border-color: rgba(239, 68, 68, 0.8) !important;
            animation: pulse 1.5s infinite;
        }
        .mic-button.processing {
            background-color: rgba(59, 130, 246, 0.5) !important;
            border-color: rgba(59, 130, 246, 0.8) !important;
            cursor: wait;
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
    `;
    document.head.appendChild(style);

    // Draggable containers
    const captionDraggable = createDraggableContainer({
        initialPosition: 'top-center',
        children: [liveCaptionComponent]
    });

    // Interaction Logic
    async function processInteraction(text) {
        if (isProcessing) return;
        isProcessing = true;
        micButton.classList.add('processing');
        micButton.classList.remove('listening');

        liveCaptionComponent.updateCaption(`Usuario: ${text}`, false);

        try {
            // Capture frame and run inference
            if (videoElement && videoElement.readyState >= 2) {
                const result = await vlmService.runInference(
                    videoElement,
                    text, // Use spoken text as prompt
                    (streamedText) => {
                        // Optional: Show streaming response
                    }
                );

                if (result) {
                    liveCaptionComponent.updateCaption(`IA: ${result}`, false);
                    speechService.speak(result, () => {
                        // After speaking, maybe listen again?
                        // For now, let user click to speak again
                    });
                }
            }
        } catch (error) {
            console.error('Error processing:', error);
            liveCaptionComponent.showError('Error al procesar');
        } finally {
            isProcessing = false;
            micButton.classList.remove('processing');
        }
    }

    // Mic Button Click Handler
    micButton.addEventListener('click', () => {
        if (isProcessing) return;

        if (speechService.isListening) {
            speechService.stopListening();
            micButton.classList.remove('listening');
        } else {
            // Stop speaking if currently speaking
            speechService.synthesis.cancel();

            micButton.classList.add('listening');
            liveCaptionComponent.updateCaption('Escuchando...', true);

            speechService.startListening(
                (result) => {
                    // On partial result
                    liveCaptionComponent.updateCaption(result.interim || result.final, true);
                },
                () => {
                    // On end (silence or stop)
                    micButton.classList.remove('listening');
                    // We need to get the final text. 
                    // The speech service callback architecture might need a slight tweak to pass final text on end, 
                    // or we rely on the last final result from onResult.
                    // Let's assume the last onResult gave us the text.
                    // Actually, let's modify the flow:
                    // The onResult provides the text. If it's final, we process it.
                }
            );
        }
    });

    // Modify SpeechService usage in the click handler slightly
    // We need to capture the text to process it.
    let lastRecognizedText = '';

    const originalStartListening = speechService.startListening.bind(speechService);
    speechService.startListening = (onResult, onEnd) => {
        lastRecognizedText = '';
        originalStartListening((res) => {
            if (res.final) {
                lastRecognizedText = res.final;
                // If we want to stop immediately after one sentence:
                speechService.stopListening();
                processInteraction(res.final);
            }
            onResult(res);
        }, onEnd);
    };


    // Assemble
    innerContainer.appendChild(captionDraggable);
    innerContainer.appendChild(micButton);
    container.appendChild(innerContainer);

    // Cleanup function
    container.cleanup = () => {
        speechService.stopListening();
        speechService.synthesis.cancel();
        if (captionDraggable.cleanup) {
            captionDraggable.cleanup();
        }
        style.remove();
    };

    return container;
}
