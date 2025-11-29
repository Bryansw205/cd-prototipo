import { useState, useRef, useEffect } from "react";
import { UserProfile } from "./ProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot, Send, Loader2, Sparkles, User } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIAssistantProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onClose?: () => void;
}

export function AIAssistant({ profile, setProfile, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `¡Hola${profile.name ? `, ${profile.name}` : ""}! 👋 Soy tu asistente virtual de Chef Fantasma. Puedo ayudarte con:\n\n• Recomendaciones personalizadas de comida\n• Consejos nutricionales\n• Sugerencias según tu agenda\n• Información sobre restaurantes cercanos\n• Tips de alimentación saludable\n\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // Simulate AI response (replace with actual AI integration)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiResponse = generateAIResponse(inputMessage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Error al procesar tu mensaje", {
        description: "Por favor intenta nuevamente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Simple response logic (replace with actual AI API call)
    if (input.includes("comida") || input.includes("comer") || input.includes("almuerzo") || input.includes("cena")) {
      return "Para darte las mejores recomendaciones de comida, considera:\n\n1. Revisa tu agenda para ver cuánto tiempo tienes disponible\n2. Verifica tu presupuesto establecido en Preferencias\n3. Las sugerencias se actualizan automáticamente según tus espacios libres\n\n¿Te gustaría que te sugiera algo específico según tu situación actual?";
    }

    if (input.includes("nutrición") || input.includes("saludable") || input.includes("dieta")) {
      return "Para mantener una alimentación saludable:\n\n✓ Come cada 3-4 horas para mantener tu energía\n✓ Incluye proteínas, carbohidratos y grasas saludables\n✓ Mantente hidratado durante el día\n✓ Evita saltarte comidas, especialmente el desayuno\n\n¿Tienes alguna restricción alimentaria que deba considerar?";
    }

    if (input.includes("presupuesto") || input.includes("precio") || input.includes("económico")) {
      return "Para optimizar tu presupuesto:\n\n• Ajusta tu presupuesto máximo en la pestaña Preferencias\n• Busca opciones de comida rápida o snacks para momentos cortos\n• Considera restaurantes con menús ejecutivos\n• Las sugerencias se filtran automáticamente según tu presupuesto\n\n¿Quieres que te muestre opciones económicas?";
    }

    if (input.includes("agenda") || input.includes("calendario") || input.includes("tiempo")) {
      return "Según tu agenda:\n\n📅 Los espacios libres se detectan automáticamente\n⏱️ Menos de 20 min → Snack\n⏱️ 20-40 min → Comida rápida\n⏱️ Más de 40 min → Comida normal\n\nPuedes ver tus espacios libres en la pestaña Agenda. ¿Necesitas ayuda para organizar tu día?";
    }

    if (input.includes("hola") || input.includes("hi") || input.includes("buenos días") || input.includes("buenas tardes")) {
      return `¡Hola${profile.name ? `, ${profile.name}` : ""}! 😊 ¿En qué puedo ayudarte hoy? Puedo darte consejos sobre alimentación, recomendaciones de comidas, o ayudarte a organizar mejor tu día.`;
    }

    if (input.includes("gracias") || input.includes("thank")) {
      return "¡De nada! 😊 Estoy aquí para ayudarte. Si tienes más preguntas sobre alimentación, agenda o nutrición, no dudes en preguntarme.";
    }

    // Default response
    return "Entiendo tu consulta. Para ayudarte mejor, puedo:\n\n🍽️ Sugerir opciones de comida según tu agenda\n📊 Darte consejos nutricionales\n💰 Ayudarte a optimizar tu presupuesto\n📅 Recomendarte cómo organizar tus comidas\n\n¿Sobre qué tema específico te gustaría saber más?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Messages Area */}
      <div 
        className="flex-1 p-4 overflow-y-auto ai-messages-container" 
        ref={messagesContainerRef}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9333ea #f3f4f6'
        }}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-orange-600 text-white"
                    : "bg-purple-600 text-white"
                }`}
              >
                {message.role === "user" ? (
                  <User className="size-4" />
                ) : (
                  <Bot className="size-4" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`flex-1 max-w-[85%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-orange-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-900 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p
                  className={`text-xs text-gray-500 mt-1 px-2 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="size-4" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                <Loader2 className="size-4 text-purple-600 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 px-4"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 Presiona Enter para enviar
        </p>
      </div>
    </div>
  );
}