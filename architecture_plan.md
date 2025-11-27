# Plan de Arquitectura para Agente Conversacional (AICamera)

## Objetivo
Transformar la aplicación de subtitulado de video en tiempo real (`aicamera`) en un agente conversacional multimodal que acepte entrada de voz y video, y responda con texto y voz en español.

## Arquitectura Propuesta

La arquitectura se basará en la estructura existente de **Vanilla JavaScript** y **ES Modules**, manteniendo la ejecución **completamente en el navegador** (WebGPU/Transformers.js) para el procesamiento de video, y utilizando APIs nativas del navegador para voz (Web Speech API).

### Componentes Clave y Modificaciones

| Componente | Archivo(s) | Función Original | Modificación/Nueva Función |
| :--- | :--- | :--- | :--- |
| **Entrada de Voz (STT)** | `js/services/speech-service.js` | Implementado (Web Speech API) | **Integración:** Conectar la transcripción final del STT como el *prompt principal* para la lógica conversacional. |
| **Entrada de Video (VLM)** | `js/services/vlm-service.js` | Genera subtítulos en tiempo real. | **Adaptación:** El VLM se usará para generar una *descripción de contexto* del frame actual, que se concatenará con el *prompt de voz* del usuario. |
| **Lógica Conversacional (Nuevo)** | `js/services/llm-service.js` (Nuevo) | N/A | **Núcleo del Agente:** Recibirá el *prompt combinado* (Voz del usuario + Contexto del VLM) y generará una respuesta conversacional. Se utilizará un modelo LLM ligero (e.g., `gpt-4.1-mini` o similar) a través de una API (simulada o real, dependiendo de la viabilidad en el navegador). **Opción 1 (Prioritaria):** Usar un LLM local con `transformers.js` si es viable. **Opción 2 (Alternativa):** Usar una API externa (simulada por ahora, ya que el proyecto original es *in-browser*). |
| **Salida de Voz (TTS)** | `js/services/speech-service.js` | Implementado (Web Speech API) | **Integración:** Recibir la respuesta de texto del LLM y reproducirla usando `speak()`. |
| **Flujo de Control** | `js/main.js` | Controla el ciclo de subtitulado. | **Reestructuración:** Implementar un nuevo ciclo de *conversación* que orqueste: **1.** Escucha (STT) -> **2.** Captura de Frame (VLM) -> **3.** Generación de Respuesta (LLM) -> **4.** Habla (TTS). |
| **Interfaz de Usuario** | `index.html`, `js/components/*` | Muestra subtítulos y entrada de prompt. | **Ajuste:** Reemplazar el botón de "Start Live Captioning" por un botón de "Hablar/Escuchar" (Micrófono). Mostrar la transcripción del usuario y la respuesta del agente. |

## Flujo de Interacción (Conversación)

1.  **Usuario Inicia:** El usuario presiona un botón de micrófono.
2.  **STT Activo:** `SpeechService.startListening()` transcribe la voz del usuario.
3.  **STT Finaliza:** Se obtiene la transcripción final del usuario (`user_prompt`).
4.  **Captura de Contexto:** Se captura el frame de video actual y se envía al VLM con un prompt de contexto (`"Describe lo que ves en una frase corta"`). Se obtiene `vlm_context`.
5.  **Generación de Prompt Combinado:** `combined_prompt = "Contexto visual: " + vlm_context + ". Pregunta del usuario: " + user_prompt`.
6.  **LLM Procesa:** El `LLMService` recibe `combined_prompt` y genera una respuesta conversacional en español (`agent_response`).
7.  **Salida de Texto:** `agent_response` se muestra en la interfaz.
8.  **Salida de Voz:** `SpeechService.speak(agent_response)` reproduce la respuesta.
9.  **Agente Espera:** El agente espera la siguiente interacción del usuario.

## Tareas Pendientes (Fases Siguientes)

1.  **Creación de `llm-service.js`:** Definir la clase para manejar la interacción con el LLM.
2.  **Modificación de `vlm-service.js`:** Adaptar la función de subtitulado para generar una descripción de contexto a demanda.
3.  **Refactorización de `main.js`:** Implementar el nuevo flujo de conversación.
4.  **Ajustes de UI:** Modificar `index.html` y componentes para el nuevo modo conversacional.
5.  **Localización:** Asegurar que todos los textos de la UI estén en español.
