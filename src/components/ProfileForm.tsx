import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Scale, Ruler, Calendar, MapPin, Save } from "lucide-react";
import { toast } from "sonner@2.0.3";

export interface UserProfile {
  name: string;
  age: string;
  weight: string;
  height: string;
  location: string;
}

interface ProfileFormProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onClose?: () => void;
}

export function ProfileForm({ profile, setProfile, onClose }: ProfileFormProps) {
  const [localProfile, setLocalProfile] = useState(profile);

  const handleSave = () => {
    setProfile(localProfile);
    toast.success(localProfile.name ? `¡Bienvenido, ${localProfile.name}!` : "Perfil actualizado correctamente", {
      description: "Tus datos han sido guardados",
    });
    if (onClose) onClose();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="mb-1">Mi Perfil</h2>
        <p className="text-sm text-gray-600">Información personal</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-orange-600" />
            Datos personales
          </CardTitle>
          <CardDescription className="text-xs">Completa tu información básica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm flex items-center gap-2 mb-1">
              <User className="size-3" />
              Nombre completo
            </Label>
            <Input
              id="name"
              value={localProfile.name}
              onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
              placeholder="Tu nombre"
              className="text-sm"
            />
          </div>

          <div>
            <Label htmlFor="age" className="text-sm flex items-center gap-2 mb-1">
              <Calendar className="size-3" />
              Edad
            </Label>
            <Input
              id="age"
              type="number"
              value={localProfile.age}
              onChange={(e) => setLocalProfile({ ...localProfile, age: e.target.value })}
              placeholder="Ej: 25"
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="weight" className="text-sm flex items-center gap-2 mb-1">
                <Scale className="size-3" />
                Peso (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                value={localProfile.weight}
                onChange={(e) => setLocalProfile({ ...localProfile, weight: e.target.value })}
                placeholder="70"
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="height" className="text-sm flex items-center gap-2 mb-1">
                <Ruler className="size-3" />
                Talla (cm)
              </Label>
              <Input
                id="height"
                type="number"
                value={localProfile.height}
                onChange={(e) => setLocalProfile({ ...localProfile, height: e.target.value })}
                placeholder="170"
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="text-sm flex items-center gap-2 mb-1">
              <MapPin className="size-3" />
              Ubicación
            </Label>
            <Input
              id="location"
              value={localProfile.location}
              onChange={(e) => setLocalProfile({ ...localProfile, location: e.target.value })}
              placeholder="Lima, Perú"
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-xs text-blue-800 text-center">
            ℹ️ Esta información nos ayuda a personalizar mejor tus sugerencias de comida
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full bg-orange-600 hover:bg-orange-700">
        <Save className="size-4 mr-2" />
        Guardar perfil
      </Button>
    </div>
  );
}