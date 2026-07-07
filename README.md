# 🤖 App Asistente de Decisión

> Una aplicación inteligente impulsada por Gemini AI para ayudarte a evaluar decisiones complejas mediante listas de pros y contras ponderados, tablas comparativas y análisis FODA.

<div align="center">
  <img src="https://github.com/user-attachments/assets/529c7b49-4ab0-439b-8749-c911b20756ec" alt="Asistente de Decisión" width="100%" />
</div>

---

## 🚀 Características Principales

* **Metodologías de Análisis:** Permite evaluar dilemas mediante Pros y Contras, Matriz FODA (SWOT) y Tablas Comparativas.
* **Análisis Inteligente:** Integración directa con modelos generativos de lenguaje para procesar solicitudes y contextos complejos.
* **Entorno Seguro:** Configuración protegida mediante variables de entorno para llaves de API.
* **Interfaz Reactiva:** Estructura ágil y tipado fuerte utilizando Vite y TypeScript.

Visualiza tu aplicación en AI Studio: https://ai.studio/apps/df167647-dd2a-4019-b6a7-be5e89898989b6aa

---

## 🛠️ Ejecución Local (Run Locally)

### Requisitos previos
Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### Pasos para configurar el proyecto:

1. **Clonar el repositorio e ingresar a la carpeta:**
   ```bash
   git clone [https://github.com/Leonelst/App-Asistente-de-decisi-n-.git](https://github.com/Leonelst/App-Asistente-de-decisi-n-.git)
   cd App-Asistente-de-decisi-n-

2. **Instalar las dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   * Duplica el archivo `.env.ejemplo` en tu computadora y cámbiale el nombre a `.env.local`.
   * Abre el archivo `.env.local` y coloca tu clave de API de Gemini:
     ```env
     GEMINI_API_KEY=tu_clave_aqui
     ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *Una vez ejecutado, abre tu navegador en la dirección local que te indique la terminal (usualmente `http://localhost:5173`).*

---

### Herramientas que usa este repositorio:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white)
