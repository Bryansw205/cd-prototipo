import { useState, useEffect } from "react";
import { CalendarEvent, FoodOption, UserPreferences, MealHistory } from "../App";
import { UserProfile } from "./ProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, DollarSign, MapPin, ThumbsUp, ThumbsDown, X, Check, Bike, Flame, Leaf, Coins, User, Bot, Ghost } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ProfileForm } from "./ProfileForm";
import AIAssistant from "./AIAssistant";
import { toast } from "sonner@2.0.3";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

interface MealSuggestionsProps {
  events: CalendarEvent[];
  preferences: UserPreferences;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onAccept: (entry: MealHistory) => void;
  onReject: (entry: MealHistory) => void;
}

// Mock food catalog
const foodCatalog: FoodOption[] = [
  {
    id: "1",
    name: "Bowl de Pollo Teriyaki",
    restaurant: "Healthy Bowls",
    type: "normal",
    deliveryTime: 25,
    price: 45,
    category: "Saludable",
    portable: false,
    image: "https://images.unsplash.com/photo-1672959202028-51e3b71255bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYm93bCUyMGZvb2R8ZW58MXx8fHwxNzYzNjk2NDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "2",
    name: "Sándwich de Pollo y Aguacate",
    restaurant: "Café Central",
    type: "rápida",
    deliveryTime: 15,
    price: 35,
    category: "Rápida",
    portable: true,
    image: "https://images.unsplash.com/photo-1590301155505-471f05cd02db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGx1bmNofGVufDF8fHx8MTc2MzY5NjQ0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "3",
    name: "Mix de Frutas y Granola",
    restaurant: "Snack Bar",
    type: "snack",
    deliveryTime: 10,
    price: 20,
    category: "Snack",
    portable: true,
    image: "https://images.unsplash.com/photo-1692024427699-394c2e19d101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVpdCUyMHNuYWNrfGVufDF8fHx8MTc2MzY5NjQ0OHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "4",
    name: "Pasta Carbonara",
    restaurant: "La Trattoria",
    type: "normal",
    deliveryTime: 30,
    price: 55,
    category: "Italiana",
    portable: false,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2h8ZW58MXx8fHwxNzYzNjExMDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "5",
    name: "Ensalada César con Pollo",
    restaurant: "Green Garden",
    type: "rápida",
    deliveryTime: 20,
    price: 40,
    category: "Saludable",
    portable: true,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGJvd2x8ZW58MXx8fHwxNzYzNTcxODAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "6",
    name: "Burger Clásica con Papas",
    restaurant: "Burger House",
    type: "rápida",
    deliveryTime: 20,
    price: 50,
    category: "Comida rápida",
    portable: true,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmcmllc3xlbnwxfHx8fDE3NjM2NTU1MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "7",
    name: "Yogurt con Frutas",
    restaurant: "Fresh Corner",
    type: "snack",
    deliveryTime: 8,
    price: 15,
    category: "Snack",
    portable: true,
    image: "https://images.unsplash.com/photo-1692024427699-394c2e19d101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVpdCUyMHNuYWNrfGVufDF8fHx8MTc2MzY5NjQ0OHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "8",
    name: "Tacos al Pastor",
    restaurant: "Taquería El Primo",
    type: "rápida",
    deliveryTime: 18,
    price: 30,
    category: "Mexicana",
    portable: true,
    image: "https://images.unsplash.com/photo-1590301155505-471f05cd02db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGx1bmNofGVufDF8fHx8MTc2MzY5NjQ0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "9",
    name: "Sushi Roll Variado",
    restaurant: "Sakura Sushi",
    type: "normal",
    deliveryTime: 35,
    price: 65,
    category: "Japonesa",
    portable: false,
    image: "https://images.unsplash.com/photo-1672959202028-51e3b71255bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYm93bCUyMGZvb2R8ZW58MXx8fHwxNzYzNjk2NDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "10",
    name: "Barrita de Cereal",
    restaurant: "Quick Bites",
    type: "snack",
    deliveryTime: 5,
    price: 8,
    category: "Snack",
    portable: true,
    image: "https://images.unsplash.com/photo-1692024427699-394c2e19d101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVpdCUyMHNuYWNrfGVufDF8fHx8MTc2MzY5NjQ0OHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "11",
    name: "Wrap Vegetariano",
    restaurant: "Green Life",
    type: "rápida",
    deliveryTime: 15,
    price: 25,
    category: "Vegetariana",
    portable: true,
    image: "https://images.unsplash.com/photo-1590301155505-471f05cd02db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGx1bmNofGVufDF8fHx8MTc2MzY5NjQ0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "12",
    name: "Menú Ejecutivo Premium",
    restaurant: "Restaurante El Dorado",
    type: "normal",
    deliveryTime: 40,
    price: 85,
    category: "Saludable",
    portable: false,
    image: "https://images.unsplash.com/photo-1672959202028-51e3b71255bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYm93bCUyMGZvb2R8ZW58MXx8fHwxNzYzNjk2NDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function MealSuggestions({ events, preferences, profile, setProfile, onAccept, onReject }: MealSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Array<{ slot: any; food: FoodOption }>>([]);
  const [rejectedFoodIds, setRejectedFoodIds] = useState<Set<string>>(new Set());
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  useEffect(() => {
    generateSuggestions();
    setRejectedFoodIds(new Set()); // Reset rejected foods when events or preferences change
  }, [events, preferences]);

  const generateSuggestions = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayEvents = events.filter((e) => e.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const freeSlots = getFreeSlots(todayEvents);
    const newSuggestions = freeSlots.map((slot) => {
      const food = selectFoodForSlot(slot, new Set());
      return { slot, food };
    });

    setSuggestions(newSuggestions);
  };

  const getFreeSlots = (todayEvents: CalendarEvent[]) => {
    const slots: { start: string; end: string; duration: number }[] = [];

    if (todayEvents.length > 0) {
      const firstEvent = todayEvents[0];
      if (firstEvent.startTime > "08:00") {
        const duration = getMinutesDifference("08:00", firstEvent.startTime);
        if (duration >= 10) {
          slots.push({ start: "08:00", end: firstEvent.startTime, duration });
        }
      }
    }

    for (let i = 0; i < todayEvents.length - 1; i++) {
      const currentEnd = todayEvents[i].endTime;
      const nextStart = todayEvents[i + 1].startTime;
      const duration = getMinutesDifference(currentEnd, nextStart);

      if (duration >= 10) {
        slots.push({ start: currentEnd, end: nextStart, duration });
      }
    }

    if (todayEvents.length > 0) {
      const lastEvent = todayEvents[todayEvents.length - 1];
      if (lastEvent.endTime < "20:00") {
        const duration = getMinutesDifference(lastEvent.endTime, "20:00");
        if (duration >= 10) {
          slots.push({ start: lastEvent.endTime, end: "20:00", duration });
        }
      }
    }

    return slots;
  };

  const getMinutesDifference = (start: string, end: string) => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const selectFoodForSlot = (slot: { duration: number }, excludedIds: Set<string> = new Set()) => {
    let type: "normal" | "rápida" | "snack";
    if (slot.duration < 20) {
      type = "snack";
    } else if (slot.duration < 40) {
      type = "rápida";
    } else {
      type = "normal";
    }

    // Filter by type, budget, and exclude already rejected foods
    const validOptions = foodCatalog.filter(
      (food) => food.type === type && food.price <= preferences.budgetPerMeal && !excludedIds.has(food.id)
    );

    // Prefer favorite categories
    const favoriteOptions = validOptions.filter((food) => preferences.favoriteCategories.includes(food.category));
    const options = favoriteOptions.length > 0 ? favoriteOptions : validOptions;

    // Return random option or fallback to first available (even if over budget)
    if (options.length > 0) {
      return options[Math.floor(Math.random() * options.length)];
    }
    
    // Fallback: try without budget restriction
    const fallbackOptions = foodCatalog.filter(
      (food) => food.type === type && !excludedIds.has(food.id)
    );
    return fallbackOptions.length > 0 ? fallbackOptions[0] : foodCatalog[0];
  };

  const handleAccept = (suggestion: { slot: any; food: FoodOption }, liked: boolean) => {
    const entry: MealHistory = {
      id: Date.now().toString(),
      foodOption: suggestion.food,
      timestamp: new Date().toISOString(),
      accepted: true,
      liked,
      suggestedFor: `${suggestion.slot.start} - ${suggestion.slot.end}`,
    };
    onAccept(entry);
    toast.success("Pedido ordenado con éxito", {
      description: `${suggestion.food.name} llegará en ${suggestion.food.deliveryTime} minutos`,
    });
  };

  const handleReject = (suggestionIndex: number) => {
    const suggestion = suggestions[suggestionIndex];
    
    // Add to history
    const entry: MealHistory = {
      id: Date.now().toString(),
      foodOption: suggestion.food,
      timestamp: new Date().toISOString(),
      accepted: false,
      liked: null,
      suggestedFor: `${suggestion.slot.start} - ${suggestion.slot.end}`,
    };
    onReject(entry);

    // Add rejected food to the exclusion set
    const newRejectedIds = new Set(rejectedFoodIds);
    newRejectedIds.add(suggestion.food.id);
    setRejectedFoodIds(newRejectedIds);

    // Generate a new suggestion for this slot
    const newFood = selectFoodForSlot(suggestion.slot, newRejectedIds);
    
    // Update the suggestion
    const newSuggestions = [...suggestions];
    newSuggestions[suggestionIndex] = { slot: suggestion.slot, food: newFood };
    setSuggestions(newSuggestions);
    
    toast.info("Sugerencia actualizada", {
      description: "Te mostramos otra opción",
    });
  };

  const getSlotTypeLabel = (duration: number) => {
    if (duration < 20) return "Snack rápido";
    if (duration < 40) return "Comida rápida";
    return "Comida normal";
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay sugerencias disponibles</CardTitle>
          <CardDescription>
            Agrega eventos a tu agenda para recibir sugerencias de comida personalizadas
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4 relative overflow-x-hidden">
      {/* Floating Profile Button */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogTrigger asChild>
          <button
            className="fixed top-20 right-4 z-50 rounded-full size-14 bg-orange-600 hover:bg-orange-700 shadow-lg flex items-center justify-center text-white transition-colors"
          >
            <User className="size-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mi Perfil</DialogTitle>
            <DialogDescription>
              Configura tu información personal y preferencias
            </DialogDescription>
          </DialogHeader>
          <ProfileForm 
            profile={profile} 
            setProfile={setProfile} 
            onClose={() => setIsProfileDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Floating AI Assistant Button - Bottom Right */}
      {isAIDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
              <AIAssistant 
                profile={profile} 
                setProfile={setProfile}
                onClose={() => setIsAIDialogOpen(false)}
              />
           </div>
        </div>
      )}

      {/* Trigger Button - Toggle Manual */}
      <Button
        className="fixed bottom-20 right-4 size-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg z-50"
        size="icon"
        onClick={() => setIsAIDialogOpen(!isAIDialogOpen)}
      >
        <Ghost className="size-6" />
      </Button>

      <div className="text-center mb-4">
        <h2 className="mb-1">Sugerencias de hoy</h2>
        <p className="text-sm text-gray-600">Basadas en tu agenda</p>
      </div>

      <Carousel className="w-full max-w-sm sm:max-w-md mx-auto">
        <CarouselContent>
          {suggestions.map((suggestion, idx) => (
            <CarouselItem key={idx}>
              <div className="p-1">
              <Card className="overflow-hidden">
                <div className="relative h-40">
                  <ImageWithFallback
                    src={suggestion.food.image}
                    alt={suggestion.food.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-600 text-white text-xs">
                      {getSlotTypeLabel(suggestion.slot.duration)}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">{suggestion.food.name}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">{suggestion.food.restaurant}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Time slot */}
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Momento sugerido</p>
                        <p className="text-sm">
                          {suggestion.slot.start} - {suggestion.slot.end}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{suggestion.slot.duration} min</Badge>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Bike className="size-4 text-gray-500" />
                      <span className="text-xs sm:text-sm">{suggestion.food.deliveryTime} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coins className="size-4 text-green-600" />
                      <span className="text-xs sm:text-sm">S/ {suggestion.food.price}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {suggestion.food.portable ? <Flame className="size-4 text-orange-500" /> : <Leaf className="size-4 text-green-500" />}
                      <span className="text-xs sm:text-sm">{suggestion.food.portable ? "Portable" : "Para sentarse"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-4 text-gray-500" />
                      <span className="text-xs sm:text-sm">{suggestion.food.category}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(idx)}
                      className="text-xs sm:text-sm"
                    >
                      <X className="size-3 mr-1" />
                      No
                    </Button>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm"
                      onClick={() => handleAccept(suggestion, true)}
                    >
                      <ThumbsUp className="size-3 mr-1" />
                      Ordenar
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <p className="text-center text-xs text-amber-800">
            💡 Las sugerencias se ajustan según tu agenda
          </p>
        </CardContent>
      </Card>
    </div>
  );
}