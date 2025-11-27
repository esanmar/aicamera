/**
 * Pantalla de Bienvenida CCASA
 */

import { createElement } from '../utils/dom-helpers.js';
import { createGlassContainer } from './GlassContainer.js';
import { createGlassButton } from './GlassButton.js';
import { createHfIcon } from './HfIcon.js';
import { GLASS_EFFECTS } from '../utils/constants.js';

export function createWelcomeScreen(onStart) {
    const wrapper = createElement('div', {
        className: 'absolute inset-0 flex items-center justify-center p-8 text-white'
    });

    const content = createElement('div', {
        className: 'max-w-2xl w-full space-y-8'
    });

    // Tarjeta principal con logotipo
    const titleCard = createGlassContainer({
        className: 'rounded-3xl shadow-2xl hover-scale-105 transition-transform text-center',
        role: 'banner',
        children: []
    });

    const titleContent = createElement('div', {
        className: 'p-8 space-y-4'
    });

    const logo = createElement('img', {
        src: 'https://ccasa.eus/image/layout_set_logo?img_id=1611483&t=1764213428468',
        alt: 'Logo CCASA',
        className: 'mx-auto mb-4 w-36 h-auto'
    });

    const title = createElement('h1', {
        className: 'text-4xl font-bold mb-2 text-black',
        text: 'CCASA Online Video Análisis'
    });

    const subtitle = createElement('p', {
        className: 'text-lg text-[#666666]',
        html: `Análisis de vídeo en tiempo real con 
            <a href="https://huggingface.co/onnx-community/FastVLM-0.5B-ONNX"
               class="underline text-[#CC0000] hover:opacity-80"
               target="_blank"
               rel="noopener noreferrer">
               FastVLM-0.5B
            </a>`
    });

    titleContent.appendChild(logo);
    titleContent.appendChild(title);
    titleContent.appendChild(subtitle);
    titleCard.appendChild(titleContent);

    // Estado de la cámara
    const statusCard = createGlassContainer({
        bgColor: GLASS_EFFECTS.COLORS.SUCCESS_BG,
        className: 'rounded-2xl shadow-2xl hover-scale-105 transition-transform',
        role: 'status',
        ariaLabel: 'Estado de la cámara',
        children: []
    });

    const statusContent = createElement('div', {
        className: 'p-4'
    });

    const statusFlex = createElement('div', {
        className: 'flex items-center justify-center space-x-2'
    });

    const statusDot = createElement('div', {
        className: 'status-indicator'
    });

    const statusText = createElement('p', {
        className: 'font-medium text-[#CC0000]',
        text: 'Cámara lista'
    });

    statusFlex.appendChild(statusDot);
    statusFlex.appendChild(statusText);
    statusContent.appendChild(statusFlex);
    statusCard.appendChild(statusContent);

    // Cómo funciona
    const howItWorksCard = createGlassContainer({
        className: 'rounded-2xl shadow-2xl hover-scale-105 transition-transform',
        role: 'region',
        children: []
    });

    const howItWorksContent = createElement('div', {
        className: 'p-6'
    });

    const howItWorksTitle = createElement('h2', {
        className: 'text-lg font-semibold mb-4 text-center text-black',
        text: 'Cómo funciona:',
        attributes: { id: 'how-it-works-title' }
    });

    const stepsList = createElement('div', {
        className: 'space-y-3'
    });

    // Paso 1
    const step1 = createElement('div', {
        className: 'flex items-start space-x-3'
    });
    const badge1 = createElement('div', {
        className: 'numbered-badge',
        text: '1'
    });
    const step1Text = createElement('p', {
        className: 'text-[#666666]',
        html: `Vas a cargar un modelo multimodal que se ejecuta en tu navegador.`
    });
    step1.appendChild(badge1);
    step1.appendChild(step1Text);

    // Paso 2
    const step2 = createElement('div', {
        className: 'flex items-start space-x-3'
    });
    const badge2 = createElement('div', {
        className: 'numbered-badge',
        text: '2'
    });
    const step2Text = createElement('p', {
        className: 'text-[#666666]'
    });
    const hfIcon = createHfIcon();
    step2Text.innerHTML = `
        Todo se ejecuta localmente 
        No se envían datos a ningún servidor.`;
    step2Text.insertBefore(hfIcon, step2Text.firstChild.nextSibling);
    step2.appendChild(badge2);
    step2.appendChild(step2Text);

    // Paso 3
    const step3 = createElement('div', {
        className: 'flex items-start space-x-3'
    });
    const badge3 = createElement('div', {
        className: 'numbered-badge',
        text: '3'
    });
    const step3Text = createElement('p', {
        className: 'text-[#666666]',
        text: 'Haz clic en el botón para comenzar.'
    });
    step3.appendChild(badge3);
    step3.appendChild(step3Text);

    stepsList.appendChild(step1);
    stepsList.appendChild(step2);
    stepsList.appendChild(step3);
    howItWorksContent.appendChild(howItWorksTitle);
    howItWorksContent.appendChild(stepsList);
    howItWorksCard.appendChild(howItWorksContent);

    // Botón inicio
    const buttonContainer = createElement('div', {
        className: 'flex flex-col items-center space-y-4'
    });

    const startButton = createGlassButton({
        className: 'px-8 py-4 rounded-2xl bg-[#CC0000] text-white font-semibold text-lg hover:bg-red-800',
        onClick: onStart,
        ariaLabel: 'Iniciar análisis de vídeo',
        children: [
            createElement('span', {
                className: 'font-semibold text-lg',
                text: 'Iniciar análisis'
            })
        ]
    });

    const hint = createElement('p', {
        className: 'text-sm text-[#666666] opacity-80',
        text: 'El modelo se cargará cuando pulses el botón'
    });

    buttonContainer.appendChild(startButton);
    buttonContainer.appendChild(hint);

    content.appendChild(titleCard);
    content.appendChild(statusCard);
    content.appendChild(howItWorksCard);
    content.appendChild(buttonContainer);
    wrapper.appendChild(content);

    return wrapper;
}
