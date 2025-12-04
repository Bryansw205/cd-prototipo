import { useState, useRef, useEffect } from "react";
import { Bot, Ghost, Send, Loader2, User, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";


const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

// --- COMPONENTES UI ---

const Button = ({ className = "", variant = "primary", size = "default", ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm",
    ghost: "hover:bg-gray-100 text-gray-700",
    outline: "border border-input bg-transparent hover:bg-gray-100 text-gray-900",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    icon: "h-9 w-9",
  };
  
  const variantStyles = variants[variant as keyof typeof variants] || variants.primary;
  const sizeStyles = sizes[size as keyof typeof sizes] || sizes.default;

  return (
    <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props} />
  );
};

const Input = ({ className = "", ...props }: any) => {
  return (
    <input
      className={`flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

// --- INTERFACES ---

export interface UserProfile {
  name: string;
  email?: string;
  dietaryPreferences?: string[];
  allergies?: string[];
  [key: string]: any;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isError?: boolean;
}

interface AIAssistantProps {
  profile?: UserProfile;
  setProfile?: (profile: UserProfile) => void;
  onClose?: () => void;
}

// --- COMPONENTE PRINCIPAL ---

export default function AIAssistant({ 
  profile = { name: "Invitado", dietaryPreferences: [] }, 
  setProfile, 
  onClose 
}: AIAssistantProps) {
  // Configuración del mensaje inicial según la imagen adjunta
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `¡Hola${profile.name ? `, ${profile.name}` : ""}! 👋 Soy Ghosthy, tu asistente virtual de nutrición.\nPuedo ayudarte con:\n\n• Recomendaciones personalizadas de comida\n• Consejos nutricionales\n• Sugerencias según tu agenda\n• Información sobre restaurantes cercanos\n• Tips de alimentación saludable\n\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "--:--";
    }
  };

  // --- LÓGICA ROBUSTA CON RETRIES Y FALLBACKS ---
  const generateAIResponse = async (userInput: string): Promise<string> => {
    let apiKey = GEMINI_API_KEY;
    
    try {
        // @ts-ignore
        if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        }
    } catch (e) {}

    if (!apiKey) throw new Error("Faltan credenciales.");

    // PROMPT ACTUALIZADO: PERSONALIDAD DE NUTRICIÓN (SIN FANTASMAS)
    const promptText = `
        ROL: Eres "Ghosthy", un asistente virtual experto en nutrición y bienestar para la plataforma "Ghosthy".
        
        DIRECTRICES DE PERSONALIDAD:
        1. Eres profesional, amable y empático.
        2. IMPORTANTE: Aunque te llamas "Ghosthy", NO hagas chistes de fantasmas, ni uses palabras como "espeluznante", "miedo" o emojis de fantasmas. Actúa como un nutricionista humano y profesional.
        3. Tus respuestas deben ser prácticas, basadas en hábitos saludables.
        
        PERFIL DEL USUARIO:
        Nombre: ${profile.name || "Invitado"}
        Datos conocidos: ${JSON.stringify(profile)}
        
        CONSULTA ACTUAL: "${userInput}"
        
        INSTRUCCIÓN: Responde a la consulta de forma concisa y útil. Usa emojis neutros o de comida (🥗, 🍎, 💪) si es necesario para dar calidez, pero mantén el profesionalismo.
    `;

    // Lista de modelos a probar en orden
    const MODELS_TO_TRY = [
        "gemini-3-pro-preview",
        "gemini-pro",
        "gemini-2.5-pro",
        "gemini-2.5-flash"
    ];

    let lastError = null;

    // Iteramos sobre los modelos disponibles
    for (const modelName of MODELS_TO_TRY) {
        try {
            // 1. INTENTO CON SDK
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(promptText);
                const response = await result.response;
                return response.text();
            } catch (sdkError: any) {
                 // Si falla el SDK, probamos REST para este mismo modelo
                 console.warn(`SDK falló con ${modelName}, probando REST...`);
                 
                 const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: promptText }] }]
                        })
                    }
                );
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error?.message || `REST Error: ${response.status}`);
                }

                return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
            }

        } catch (error: any) {
            console.warn(`Fallo con ${modelName}: ${error.message}`);
            lastError = error;
        }
    }

    throw new Error(`No se pudo conectar con ningún modelo. Último error: ${lastError?.message}`);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error(error);
      
      let errorMsg = error.message;
      if (errorMsg.includes("404")) errorMsg = "Modelo no encontrado (404).";
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `🚫 Error: ${errorMsg}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[90vh] md:h-[80vh] w-full md:max-w-md mx-auto bg-white rounded-none md:rounded-xl shadow-xl overflow-hidden border-gray-200 font-sans relative">
      <style>
        {`
          .ai-messages-container::-webkit-scrollbar-thumb {
            background: #F97316 !important;
          }
          .ai-messages-container::-webkit-scrollbar-thumb:hover {
            background: #EA580C !important;
          }
        `}
      </style>
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-orange-600 p-4 text-white flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
                <Ghost size={20} className="text-white" />
            </div>
            <div>
                <h3 className="font-bold text-sm">Ghosthy</h3>
                <p className="text-[10px] text-orange-100 opacity-90">Asistente de Nutrición</p>
            </div>
        </div>
        <div className="flex gap-2">
            {onClose && (
                <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            )}
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto ai-messages-container bg-slate-50 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.isError 
                    ? "bg-red-100 text-red-600 border border-red-200"
                    : message.role === "user"
                        ? "bg-slate-700 text-white"
                        : "bg-orange-600 text-white"
                }`}
              >
                {message.isError ? <X size={14} /> : (message.role === "user" ? <User size={14} /> : <Ghost size={14} />)}
              </div>
              
              <div
                className={`flex flex-col max-w-[80%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 shadow-sm text-sm ${
                    message.isError
                        ? "bg-red-50 text-red-800 border border-red-200 rounded-tl-none"
                        : message.role === "user"
                            ? "bg-orange-500 text-black rounded-tr-none"
                            : "bg-orange-500 text-gray-800 border border-gray-200 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-sm">
                <Ghost size={14} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 className="size-4 text-orange-600 animate-spin" />
                <span className="text-xs text-gray-500 animate-pulse">Ghosthy está analizando tu consulta...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Área de Input */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <Input
            value={inputMessage}
            onChange={(e: any) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta sobre nutrición, dietas, calorías..."
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm h-9"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`rounded-full size-12 p-0 flex items-center justify-center transition-all ${
                !inputMessage.trim() || isLoading 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-orange-600 hover:bg-orange-700 hover:scale-105 active:scale-95"
            }`}
          >
            {isLoading ? (
              <Loader2 className="size-6 animate-spin text-white" />
            ) : (
              <Send className="size-6 text-white ml-0.5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-2">
           Ghosthy es una IA en desarrollo • Puede cometer errores
        </p>
      </div>
    </div>
  );
}