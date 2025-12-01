import { useState, useEffect } from "react";
import { CalendarView } from "./components/CalendarView";
import { MealSuggestions } from "./components/MealSuggestions";
import { PreferencesForm } from "./components/PreferencesForm";
import { HistoryView } from "./components/HistoryView";
import { ProfileForm, UserProfile } from "./components/ProfileForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { UtensilsCrossed, Calendar, Settings, History } from "lucide-react";
import { Toaster } from "./components/ui/sonner";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string;
  date: string; // YYYY-MM-DD
  recurrence?: "none" | "weekly" | "monthly";
}

export interface FoodOption {
  id: string;
  name: string;
  restaurant: string;
  type: "normal" | "rápida" | "snack";
  deliveryTime: number; // minutes
  price: number;
  category: string;
  portable: boolean;
  image: string;
}

export interface UserPreferences {
  favoriteCategories: string[];
  restrictions: string[];
  budgetPerMeal: number;
  allowEatingWhileWalking: boolean;
  allowEatingInClass: boolean;
}

export interface MealHistory {
  id: string;
  foodOption: FoodOption;
  timestamp: string;
  accepted: boolean;
  liked: boolean | null;
  suggestedFor: string; // time slot
}

const defaultPreferences: UserPreferences = {
  favoriteCategories: [],
  restrictions: [],
  budgetPerMeal: 50,
  allowEatingWhileWalking: true,
  allowEatingInClass: false,
};

const defaultProfile: UserProfile = {
  name: "",
  age: "",
  weight: "",
  height: "",
  location: "",
};

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [history, setHistory] = useState<MealHistory[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem("ghosthy-events");
    const savedPreferences = localStorage.getItem("ghosthy-preferences");
    const savedHistory = localStorage.getItem("ghosthy-history");
    const savedProfile = localStorage.getItem("ghosthy-profile");

    if (savedEvents) setEvents(JSON.parse(savedEvents));
    else {
      // Set default demo events for today
      const today = new Date().toISOString().split("T")[0];
      const demoEvents: CalendarEvent[] = [
        { id: "1", title: "Reunión de equipo", startTime: "09:00", endTime: "10:30", date: today },
        { id: "2", title: "Clase de programación", startTime: "11:00", endTime: "13:00", date: today },
        { id: "3", title: "Trabajo individual", startTime: "13:20", endTime: "14:00", date: today },
        { id: "4", title: "Presentación proyecto", startTime: "15:00", endTime: "16:30", date: today },
        { id: "5", title: "Gimnasio", startTime: "18:00", endTime: "19:00", date: today },
      ];
      setEvents(demoEvents);
      localStorage.setItem("ghosthy-events", JSON.stringify(demoEvents));
    }

    if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("ghosthy-events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("ghosthy-preferences", JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem("ghosthy-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("ghosthy-profile", JSON.stringify(profile));
  }, [profile]);

  const addToHistory = (entry: MealHistory) => {
    setHistory([entry, ...history]);
  };

  const handlePreferencesSave = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-20 overflow-x-hidden">
      <Toaster position="top-center" richColors />
      <div className="container mx-auto p-3 max-w-md overflow-x-hidden">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <UtensilsCrossed className="size-8 text-orange-600" />
            <h1 className="text-orange-600">GhosThy</h1>
          </div>
          <p className="text-sm text-gray-600">
            Tu asistente inteligente de alimentación
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsContent value="suggestions" className="mt-0">
            {/* Personalized Greeting - only shown in Suggestions tab */}
            <div className="text-center mb-4">
              <p className="text-lg font-normal">
                ¡Hola{profile.name ? `, ${profile.name}` : ""}!
              </p>
            </div>
            <MealSuggestions
              key={refreshKey}
              events={events}
              preferences={preferences}
              profile={profile}
              setProfile={setProfile}
              onAccept={addToHistory}
              onReject={addToHistory}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <CalendarView events={events} setEvents={setEvents} />
          </TabsContent>

          <TabsContent value="preferences" className="mt-0">
            <PreferencesForm 
              preferences={preferences} 
              setPreferences={handlePreferencesSave} 
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <HistoryView history={history} />
          </TabsContent>

          {/* Bottom Navigation */}
          <TabsList className="fixed bottom-0 left-0 right-0 grid w-full grid-cols-4 h-16 rounded-none border-t bg-white shadow-lg">
            <TabsTrigger value="suggestions" className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600">
              <UtensilsCrossed className="size-5" />
              <span className="text-xs">Sugerencias</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600">
              <Calendar className="size-5" />
              <span className="text-xs">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600">
              <Settings className="size-5" />
              <span className="text-xs">Preferencias</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2 px-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600">
              <History className="size-5" />
              <span className="text-xs">Historial</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}