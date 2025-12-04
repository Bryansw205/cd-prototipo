import { useState, useRef, useEffect } from "react";
import { Ghost, Send, Loader2, User, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- COMPONENTES UI INTERNOS ---

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

  const generateAIResponse = async (userInput: string): Promise<string> => {
    let apiKey = "";
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        }
    } catch (e) {}

    if (!apiKey) throw new Error("Faltan credenciales (API Key no encontrada).");

    const promptText = `
        ROL: Eres "Ghosthy", un asistente virtual experto en nutrición y bienestar para la plataforma "Ghosthy".
        DIRECTRICES DE PERSONALIDAD:
        1. Eres profesional, amable y empático.
        2. IMPORTANTE: Aunque te llamas "Ghosthy", NO hagas chistes de fantasmas. Actúa como un nutricionista humano y profesional.
        3. Tus respuestas deben ser prácticas, basadas en hábitos saludables.
        PERFIL DEL USUARIO:
        Nombre: ${profile.name || "Invitado"}
        Datos conocidos: ${JSON.stringify(profile)}
        CONSULTA ACTUAL: "${userInput}"
        INSTRUCCIÓN: Responde a la consulta de forma concisa y útil. Usa emojis neutros o de comida (🥗, 🍎, 💪) si es necesario para dar calidez, pero mantén el profesionalismo.
    `;

    const MODELS = ["gemini-1.5-flash", "gemini-pro", "gemini-2.5-flash"];
    
    for (const modelName of MODELS) {
        try {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(promptText);
                const response = await result.response;
                return response.text();
            } catch (sdkError) {
                 const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
                    }
                );
                const data = await response.json();
                if (!response.ok) throw new Error("REST Error");
                return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
            }
        } catch (e) {
            continue; 
        }
    }
    throw new Error("No se pudo conectar con Ghosthy.");
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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `🚫 ${error.message}`,
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
    // CAMBIO 1: h-[80vh] fijo para todo el contenedor y flex-col
    <div className="flex flex-col h-[80vh] w-full md:max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 font-sans relative">
      <style>
        {`
          /* Estilo robusto para el scrollbar */
          .ai-messages-container {
            scrollbar-width: thin; /* Firefox */
            scrollbar-color: #ea580c #f1f5f9; /* Firefox: thumb track */
          }
          .ai-messages-container::-webkit-scrollbar {
            width: 8px; /* Ancho fijo */
          }
          .ai-messages-container::-webkit-scrollbar-track {
            background: #f1f5f9; /* Fondo gris claro */
          }
          .ai-messages-container::-webkit-scrollbar-thumb {
            background-color: #ea580c; /* Naranja fuerte */
            border-radius: 4px; /* Bordes redondeados */
          }
          .ai-messages-container::-webkit-scrollbar-thumb:hover {
            background-color: #c2410c; /* Naranja más oscuro al pasar mouse */
          }
        `}
      </style>
      <Toaster position="top-center" />
      
      {/* CAMBIO 2: shrink-0 evita que el header se aplaste */}
      <div className="bg-orange-600 p-4 text-white flex items-center justify-between z-10 shrink-0 shadow-md">
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
                <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-all">
                    <X size={20} />
                </button>
            )}
        </div>
      </div>

      {/* CAMBIO 3: flex-1 y min-h-0 son CRÍTICOS para el scroll interno y evitar deformación */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto ai-messages-container bg-slate-50 overscroll-contain">
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
                  className={`rounded-2xl px-4 py-2 shadow-sm text-sm break-words ${
                    message.isError
                        ? "bg-red-50 text-red-800 border border-red-200 rounded-tl-none"
                        : message.role === "user"
                            ? "bg-orange-500 text-black rounded-tr-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
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

      {/* CAMBIO 4: shrink-0 en el footer para que no se aplaste */}
      <div className="p-3 bg-white border-t border-gray-100 shrink-0">
        <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <Input
            value={inputMessage}
            onChange={(e: any) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta sobre nutrición..."
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