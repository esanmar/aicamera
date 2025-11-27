# Agente Conversacional Multimodal (AICamera Mejorado)

Este proyecto es una mejora del repositorio original `esanmar/aicamera`, transformándolo de una aplicación de subtitulado de video en tiempo real a un **Agente Conversacional Multimodal** que interactúa con el usuario utilizando entrada de voz y video, y responde con texto y voz en español.

## Características Principales

El agente combina tres tecnologías clave que se ejecutan completamente en el navegador:

1.  **Entrada de Voz (STT):** Utiliza la API de Reconocimiento de Voz del Navegador (Web Speech API) para transcribir la pregunta del usuario en español.
2.  **Entrada de Video (VLM):** Emplea el modelo **FastVLM-0.5B** (Vision-Language Model) a través de `transformers.js` y WebGPU para obtener un **contexto visual** del *frame* actual de la cámara.
3.  **Lógica Conversacional (LLM Simulado):** Combina la transcripción de voz del usuario y el contexto visual del VLM para generar una respuesta conversacional. **Nota:** Para mantener la naturaleza *in-browser* del proyecto original, la generación de texto del LLM está **simulada** con una lógica *placeholder* en el archivo `js/services/llm-service.js`. Para una funcionalidad completa, este servicio debería ser reemplazado por una llamada a una API de LLM externa (como OpenAI, Gemini, etc.).
4.  **Salida de Voz (TTS):** Utiliza la API de Síntesis de Voz del Navegador (Web Speech API) para vocalizar la respuesta del agente en español.

## Cambios Implementados

Se realizaron modificaciones significativas en la arquitectura y los componentes de la aplicación:

| Archivo Modificado | Propósito del Cambio |
| :--- | :--- |
| `js/services/vlm-service.js` | Se eliminó el bloqueo de inferencia continua (`inferenceLock`) para permitir la ejecución del VLM a demanda, solo cuando el usuario termina de hablar. |
| `js/services/llm-service.js` | **Nuevo archivo.** Implementa la lógica de simulación del LLM, recibiendo el *prompt* combinado (Voz + Contexto Visual) y devolviendo una respuesta conversacional. |
| `js/components/CaptioningView.js` | **Refactorización completa.** Se reemplazó el bucle de subtitulado continuo por un **flujo de conversación** activado por el botón de micrófono. Este flujo orquesta STT, VLM, LLM y TTS. |
| `js/components/LiveCaption.js` | Se modificó para mostrar el historial de la conversación (Tú: / Agente:) en lugar de solo el subtítulo en tiempo real. |
| `js/components/LoadingScreen.js` | Textos traducidos al español. |
| `js/components/WelcomeScreen.js` | Textos actualizados para reflejar el nuevo propósito de "Agente Conversacional". |
| `js/utils/constants.js` | Textos de la interfaz traducidos y adaptados al nuevo flujo. |

## Instrucciones de Despliegue Permanente

Dado que esta es una aplicación web estática (HTML, CSS, JavaScript), el despliegue es sencillo y no requiere un servidor backend.

### 1. Preparación de Archivos

Todos los archivos necesarios para el despliegue se encuentran en el directorio `aicamera/`.

### 2. Opciones de Hosting Estático

Puede desplegar este proyecto utilizando cualquier servicio de *hosting* estático. Las opciones recomendadas incluyen:

| Servicio de Hosting | Instrucciones de Despliegue |
| :--- | :--- |
| **GitHub Pages** | Suba el contenido del directorio `aicamera/` a la rama `gh-pages` de su repositorio o a la raíz de la rama `main` (si está configurado). |
| **Netlify** | Arrastre y suelte la carpeta `aicamera/` o conéctela a su repositorio de GitHub/GitLab/Bitbucket. El directorio de publicación es la raíz (`/`). |
| **Vercel** | Conecte su repositorio. El directorio raíz del proyecto es la carpeta `aicamera/`. |

### 3. Requisitos del Navegador

Para que el agente funcione correctamente, el navegador del usuario debe cumplir con los siguientes requisitos:

*   **Soporte WebGPU:** Necesario para la ejecución del modelo FastVLM (VLM).
*   **Soporte Web Speech API:** Necesario para el Reconocimiento de Voz (STT) y la Síntesis de Voz (TTS).
*   **Permiso de Cámara y Micrófono:** Debe ser concedido por el usuario al iniciar la aplicación.

## Próximos Pasos (Mejoras Futuras)

Para convertir el agente simulado en un agente completamente funcional, el siguiente paso sería:

*   **Integración Real de LLM:** Reemplazar la lógica *placeholder* en `js/services/llm-service.js` con una llamada a una API de LLM (por ejemplo, utilizando `fetch` a un *endpoint* de OpenAI o un servicio propio).
*   **Manejo de Errores Robusto:** Mejorar el manejo de errores para fallos en la conexión de la cámara, la carga del modelo o la transcripción de voz.
