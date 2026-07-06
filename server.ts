import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Helper to check if an API error is transient and retryable (like 503, 429, UNAVAILABLE, etc.)
function isTransientError(error: any): boolean {
  const errStr = String(error?.message || error || "");
  const errStatus = String(error?.status || "");
  const errCode = String(error?.code || error?.status_code || "");
  return (
    errStr.includes("503") ||
    errStr.toLowerCase().includes("unavailable") ||
    errStr.toLowerCase().includes("high demand") ||
    errStr.toLowerCase().includes("overloaded") ||
    errStr.toLowerCase().includes("resource_exhausted") ||
    errStr.includes("429") ||
    errStatus.includes("UNAVAILABLE") ||
    errStatus.includes("RESOURCE_EXHAUSTED") ||
    errCode.includes("503") ||
    errCode.includes("429")
  );
}

// Robust generation helper with retries and a fallback to gemini-3.1-flash-lite
async function generateWithRetryAndFallback(params: {
  contents: string;
  systemInstruction: string;
  responseSchema: any;
  temperature?: number;
}) {
  if (!ai) {
    throw new Error("El servicio de IA no está configurado. Por favor, asegúrese de que GEMINI_API_KEY esté configurada.");
  }

  // List of models to try in sequence if we encounter persistent high demand or transient failures
  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro", "gemini-3.5-flash", "gemini-1.5-pro"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let delay = 800; // start with 800ms delay for retry
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI-STUDIO] Intentando generar contenido con modelo: ${model} (Intento ${attempt}/${maxRetries})`);
        const response = await ai.models.generateContent({
          model: model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: "application/json",
            responseSchema: params.responseSchema,
            temperature: params.temperature ?? 0.7,
          },
        });

        if (response && response.text) {
          console.log(`[AI-STUDIO] Éxito con modelo ${model} en el intento ${attempt}`);
          return response;
        }
        throw new Error("Respuesta vacía o inválida recibida del modelo.");
      } catch (error: any) {
        lastError = error;
        console.warn(`[AI-STUDIO] Error con modelo ${model} (Intento ${attempt}/${maxRetries}):`, error);

        const transient = isTransientError(error);
        if (!transient) {
          console.warn("[AI-STUDIO] Error no transitorio o no reintentable. Probando siguiente modelo directamente.");
          break; // break the retry loop to immediately try the next model in sequence
        }

        if (attempt < maxRetries) {
          console.log(`[AI-STUDIO] Error transitorio detectado. Reintentando en ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        }
      }
    }
  }

  throw lastError || new Error("No se pudo obtener una respuesta válida de la inteligencia artificial tras agotar reintentos y fallbacks.");
}

// API Route for generating analysis
app.post("/api/generate-analysis", async (req, res) => {
  try {
    const { decision, context, type } = req.body;

    if (!decision) {
      return res.status(400).json({ error: "La decisión a tomar es obligatoria." });
    }

    if (!ai) {
      return res.status(500).json({
        error: "El servicio de IA no está configurado. Por favor, asegúrese de que GEMINI_API_KEY esté configurada.",
      });
    }

    let systemInstruction = "";
    let responseSchema: any = null;
    let prompt = "";

    if (type === "pros_cons") {
      systemInstruction =
        "Eres un analista experto en toma de decisiones. Analiza la decisión propuesta e identifica factores pros y contras. Proporciona de 3 a 5 pros y de 3 a 5 contras detallados. Asigna un nivel de importancia sugerido del 1 al 5 para cada uno. Todo el contenido debe ser en español.";
      
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          factors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Identificador único corto, por ejemplo pro_costo o con_tiempo" },
                text: { type: Type.STRING, description: "El factor o argumento principal" },
                type: { type: Type.STRING, description: "Debe ser exactamente 'pro' o 'con'" },
                importance: { type: Type.INTEGER, description: "Nivel de importancia recomendado del 1 (baja) al 5 (alta)" },
                description: { type: Type.STRING, description: "Una breve explicación de por qué este factor es relevante en esta decisión" },
              },
              required: ["id", "text", "type", "importance", "description"],
            },
          },
          summary: { type: Type.STRING, description: "Un resumen del análisis de la decisión" },
          recommendation: { type: Type.STRING, description: "Una sugerencia o conclusión clara basada en el balance de pros y contras" },
        },
        required: ["factors", "summary", "recommendation"],
      };

      prompt = `Analiza la siguiente decisión: "${decision}".\nContexto adicional: ${context || "Ninguno"}`;
    } else if (type === "swot") {
      systemInstruction =
        "Eres un consultor estratégico experto. Analiza la decisión propuesta bajo la metodología FODA (Fortalezas, Oportunidades, Debilidades, Amenazas). Proporciona entre 2 y 4 elementos para cada categoría. Asigna un nivel de importancia del 1 al 5 para cada factor. Todo el contenido debe ser en español.";
      
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          factors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Identificador único corto, ej: foda_f1, foda_d1..." },
                text: { type: Type.STRING, description: "El factor FODA" },
                type: { type: Type.STRING, description: "Debe ser exactamente 'strength' (fortaleza), 'weakness' (debilidad), 'opportunity' (oportunidad) o 'threat' (amenaza)" },
                importance: { type: Type.INTEGER, description: "Nivel de importancia del 1 (baja) al 5 (alta)" },
                description: { type: Type.STRING, description: "Breve explicación de la relevancia estratégica de este factor" },
              },
              required: ["id", "text", "type", "importance", "description"],
            },
          },
          summary: { type: Type.STRING, description: "Un análisis resumido de la situación estratégica" },
          recommendation: { type: Type.STRING, description: "Un plan de acción o recomendación estratégica basada en el FODA" },
        },
        required: ["factors", "summary", "recommendation"],
      };

      prompt = `Realiza un análisis FODA detallado para la siguiente decisión o situación: "${decision}".\nContexto adicional: ${context || "Ninguno"}`;
    } else if (type === "comparison") {
      systemInstruction =
        "Eres un experto en análisis comparativo de opciones. Dada una decisión y el contexto, identifica las 2 o 3 opciones principales involucradas (si no se mencionan explícitamente, infiérelas del dilema). Luego define de 3 a 5 criterios de comparación relevantes y puntúa cada opción de 1 (pésimo) a 10 (excelente) en cada criterio. Asigna un nivel de importancia del 1 al 5 a cada criterio. Todo el contenido debe ser en español.";

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Los nombres de las opciones identificadas (ej: ['Opción A', 'Opción B'])",
          },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Identificador único corto del criterio" },
                name: { type: Type.STRING, description: "El nombre del criterio de comparación (ej. 'Costo', 'Flexibilidad', 'Riesgo')" },
                importance: { type: Type.INTEGER, description: "Nivel de importancia general de este criterio del 1 al 5" },
                optionScores: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      option: { type: Type.STRING, description: "El nombre de la opción (debe coincidir exactamente con uno de los nombres en la lista de opciones)" },
                      score: { type: Type.INTEGER, description: "Puntaje sugerido de 1 a 10" },
                    },
                    required: ["option", "score"],
                  },
                },
                description: { type: Type.STRING, description: "Explicación de por qué se otorgaron estos puntajes" },
              },
              required: ["id", "name", "importance", "optionScores", "description"],
            },
          },
          summary: { type: Type.STRING, description: "Un resumen del análisis comparativo" },
          recommendation: { type: Type.STRING, description: "La opción sugerida como ganadora y una breve justificación" },
        },
        required: ["options", "criteria", "summary", "recommendation"],
      };

      prompt = `Realiza un análisis comparativo de opciones para la decisión: "${decision}".\nContexto adicional o alternativas deseadas: ${context || "Ninguno"}`;
    } else {
      return res.status(400).json({ error: "Tipo de análisis no válido." });
    }

    const response = await generateWithRetryAndFallback({
      contents: prompt,
      systemInstruction: systemInstruction,
      responseSchema: responseSchema,
      temperature: 0.7,
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No se pudo obtener una respuesta válida de la inteligencia artificial.");
    }

    const parsedResult = JSON.parse(textResult.trim());
    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Error en /api/generate-analysis:", error);
    return res.status(500).json({
      error: "Ocurrió un error al procesar el análisis con la IA. " + (error.message || ""),
    });
  }
});

// Vite Middleware & Static Asset Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
