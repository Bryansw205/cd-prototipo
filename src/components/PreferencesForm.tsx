import { useState } from "react";
import { UserPreferences } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Settings, DollarSign, Heart, ShieldAlert, Coffee, Utensils, Coins } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface PreferencesFormProps {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
}

const availableCategories = [
  "Saludable",
  "Italiana",
  "Mexicana",
  "Japonesa",
  "Comida rápida",
  "Vegetariana",
  "Vegana",
  "Rápida",
  "Snack",
];

const commonRestrictions = [
  "Sin gluten",
  "Sin lactosa",
  "Vegetariano",
  "Vegano",
  "Sin azúcar",
  "Bajo en sodio",
  "Sin nueces",
  "Halal",
  "Kosher",
];

export function PreferencesForm({ preferences, setPreferences }: PreferencesFormProps) {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  const toggleCategory = (category: string) => {
    const updated = localPreferences.favoriteCategories.includes(category)
      ? localPreferences.favoriteCategories.filter((c) => c !== category)
      : [...localPreferences.favoriteCategories, category];
    
    setLocalPreferences({ ...localPreferences, favoriteCategories: updated });
  };

  const toggleRestriction = (restriction: string) => {
    const updated = localPreferences.restrictions.includes(restriction)
      ? localPreferences.restrictions.filter((r) => r !== restriction)
      : [...localPreferences.restrictions, restriction];
    
    setLocalPreferences({ ...localPreferences, restrictions: updated });
  };

  const handleBudgetChange = (newBudget: number) => {
    setLocalPreferences({ ...localPreferences, budgetPerMeal: newBudget });
  };

  const handleSwitchChange = (field: 'allowEatingWhileWalking' | 'allowEatingInClass', value: boolean) => {
    setLocalPreferences({ ...localPreferences, [field]: value });
  };

  const handleSave = () => {
    setPreferences(localPreferences);
    toast.success("Preferencias guardadas correctamente", {
      description: "Vuelve a 'Sugerencias' para ver las opciones actualizadas",
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="mb-1">Preferencias</h2>
        <p className="text-sm text-gray-600">Personaliza tus sugerencias</p>
      </div>

      {/* Favorite Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="size-4 text-red-500" />
            Tipos de comida favorita
          </CardTitle>
          <CardDescription className="text-xs">Selecciona tus favoritos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <Badge
                key={category}
                variant={localPreferences.favoriteCategories.includes(category) ? "default" : "outline"}
                className={`cursor-pointer transition-colors text-xs ${
                  localPreferences.favoriteCategories.includes(category)
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "hover:bg-orange-50"
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-4 text-amber-500" />
            Restricciones alimentarias
          </CardTitle>
          <CardDescription className="text-xs">Tus restricciones dietéticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {commonRestrictions.map((restriction) => (
              <Badge
                key={restriction}
                variant={localPreferences.restrictions.includes(restriction) ? "default" : "outline"}
                className={`cursor-pointer transition-colors text-xs ${
                  localPreferences.restrictions.includes(restriction)
                    ? "bg-red-600 hover:bg-red-700"
                    : "hover:bg-red-50"
                }`}
                onClick={() => toggleRestriction(restriction)}
              >
                {restriction}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="size-4 text-green-600" />
            Presupuesto por comida
          </CardTitle>
          <CardDescription className="text-xs">Cuánto estás dispuesto a gastar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Label htmlFor="budget" className="text-sm">
              Máximo:
            </Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="5"
              value={localPreferences.budgetPerMeal}
              onChange={(e) =>
                handleBudgetChange(Number(e.target.value))
              }
              className="max-w-24 text-sm"
            />
            <span className="text-sm text-gray-600">soles</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Presupuesto promedio</p>
            <p className="text-sm text-green-700">S/ {localPreferences.budgetPerMeal}</p>
          </div>
        </CardContent>
      </Card>

      {/* Eating Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Utensils className="size-4 text-blue-600" />
            Preferencias de consumo
          </CardTitle>
          <CardDescription className="text-xs">Cómo prefieres comer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Coffee className="size-4 text-gray-600" />
              <div>
                <Label htmlFor="walking" className="cursor-pointer text-sm">
                  Puedo comer caminando
                </Label>
                <p className="text-xs text-gray-500">Acepto comida portable</p>
              </div>
            </div>
            <Switch
              id="walking"
              checked={localPreferences.allowEatingWhileWalking}
              onCheckedChange={(checked) =>
                handleSwitchChange('allowEatingWhileWalking', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Utensils className="size-4 text-gray-600" />
              <div>
                <Label htmlFor="class" className="cursor-pointer text-sm">
                  Puedo comer en clase/trabajo
                </Label>
                <p className="text-xs text-gray-500">Acepto comida discreta</p>
              </div>
            </div>
            <Switch
              id="class"
              checked={localPreferences.allowEatingInClass}
              onCheckedChange={(checked) =>
                handleSwitchChange('allowEatingInClass', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pt-2">
        <Button onClick={handleSave} className="w-full bg-orange-600 hover:bg-orange-700">
          <Settings className="size-4 mr-2" />
          Guardar preferencias
        </Button>
      </div>
    </div>
  );
}