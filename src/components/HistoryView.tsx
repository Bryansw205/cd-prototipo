import { MealHistory } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ThumbsUp, ThumbsDown, X, Clock, DollarSign, TrendingUp, Calendar, Coins } from "lucide-react";
import { Separator } from "./ui/separator";

interface HistoryViewProps {
  history: MealHistory[];
}

export function HistoryView({ history }: HistoryViewProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin historial todavía</CardTitle>
          <CardDescription>
            Acepta o rechaza sugerencias para comenzar a construir tu historial
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Calendar className="size-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            Tu historial te ayudará a entender tus patrones alimenticios
          </p>
        </CardContent>
      </Card>
    );
  }

  const acceptedMeals = history.filter((h) => h.accepted);
  const rejectedMeals = history.filter((h) => !h.accepted);
  const likedMeals = history.filter((h) => h.liked === true);
  
  const totalSpent = acceptedMeals.reduce((sum, h) => sum + h.foodOption.price, 0);
  const avgPrice = acceptedMeals.length > 0 ? totalSpent / acceptedMeals.length : 0;

  // Get category preferences from accepted meals
  const categoryCount: Record<string, number> = {};
  acceptedMeals.forEach((h) => {
    categoryCount[h.foodOption.category] = (categoryCount[h.foodOption.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="mb-1">Historial</h2>
        <p className="text-sm text-gray-600">Análisis de tus decisiones</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-blue-600" />
              <p className="text-lg sm:text-xl text-blue-600">{history.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">Aceptadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ThumbsUp className="size-4 text-green-600" />
              <p className="text-lg sm:text-xl text-green-600">{acceptedMeals.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">Favoritas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ThumbsUp className="size-4 text-orange-600" />
              <p className="text-lg sm:text-xl text-orange-600">{likedMeals.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">Gasto promedio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Coins className="size-4 text-purple-600" />
              <p className="text-lg sm:text-xl text-purple-600">S/ {avgPrice.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Tus categorías favoritas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Basado en tus comidas aceptadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topCategories.map(([category, count]) => (
                <Badge key={category} className="bg-orange-600 text-xs sm:text-sm">
                  {category} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Historial completo</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Todas tus decisiones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((entry, idx) => (
              <div key={entry.id}>
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={entry.foodOption.image}
                      alt={entry.foodOption.name}
                      className="w-full h-full object-cover"
                    />
                    {entry.accepted ? (
                      entry.liked ? (
                        <div className="absolute top-1 right-1 bg-orange-600 text-white rounded-full p-1">
                          <ThumbsUp className="size-2" />
                        </div>
                      ) : (
                        <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-1">
                          <ThumbsUp className="size-2" />
                        </div>
                      )
                    ) : (
                      <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1">
                        <X className="size-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm sm:text-base">{entry.foodOption.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{entry.foodOption.restaurant}</p>
                      </div>
                      <Badge variant={entry.accepted ? "default" : "outline"} className="text-xs sm:text-sm">
                        {entry.accepted ? "Sí" : "No"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{entry.suggestedFor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="size-3 text-green-600" />
                        <span>S/ {entry.foodOption.price}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      {new Date(entry.timestamp).toLocaleString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                
                {idx < history.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-4">
          <div className="text-center space-y-1">
            <p className="text-xs sm:text-sm">💡 Insight</p>
            <p className="text-xs sm:text-sm text-gray-700">
              {acceptedMeals.length > 0
                ? `Has aceptado ${acceptedMeals.length} comidas. ${likedMeals.length > 0 ? `¡${likedMeals.length} te encantaron!` : "Marca favoritas para mejorar."}`
                : "Acepta sugerencias para obtener insights."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}