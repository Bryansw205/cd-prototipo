import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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

// Departamentos y provincias de Perú
const departmentProvinces: Record<string, string[]> = {
  "Lima": ["Lima", "Barranca", "Cajatambo", "Canta", "Cañete", "Huaral", "Huarochirí", "Huaura", "Oyón", "Yauyos"],
  "Arequipa": ["Arequipa", "Camaná", "Caravelí", "Castilla", "Caylloma", "Condesuyos", "Islay", "La Unión"],
  "Cusco": ["Cusco", "Acomayo", "Anta", "Calca", "Canas", "Canchis", "Chumbivilcas", "Espinar", "La Convención", "Paruro", "Paucartambo", "Quispicanchi", "Urubamba"],
  "La Libertad": ["Trujillo", "Ascope", "Bolívar", "Chepén", "Julcán", "Otuzco", "Pacasmayo", "Pataz", "Sánchez Carrión", "Santiago de Chuco", "Gran Chimú", "Virú"],
  "Piura": ["Piura", "Ayabaca", "Huancabamba", "Morropón", "Paita", "Sechura", "Sullana", "Talara"],
  "Lambayeque": ["Chiclayo", "Ferreñafe", "Lambayeque"],
  "Cajamarca": ["Cajamarca", "Cajabamba", "Celendín", "Chota", "Contumazá", "Cutervo", "Hualgayoc", "Jaén", "San Ignacio", "San Marcos", "San Miguel", "San Pablo", "Santa Cruz"],
  "Junín": ["Huancayo", "Concepción", "Chanchamayo", "Jauja", "Junín", "Satipo", "Tarma", "Yauli", "Chupaca"],
  "Puno": ["Puno", "Azángaro", "Carabaya", "Chucuito", "El Collao", "Huancané", "Lampa", "Melgar", "Moho", "San Antonio de Putina", "San Román", "Sandia", "Yunguyo"],
  "Loreto": ["Maynas", "Alto Amazonas", "Loreto", "Mariscal Ramón Castilla", "Requena", "Ucayali", "Datem del Marañón", "Putumayo"],
  "Áncash": ["Huaraz", "Aija", "Antonio Raymondi", "Asunción", "Bolognesi", "Carhuaz", "Carlos Fermín Fitzcarrald", "Casma", "Corongo", "Huari", "Huarmey", "Huaylas", "Mariscal Luzuriaga", "Ocros", "Pallasca", "Pomabamba", "Recuay", "Santa", "Sihuas", "Yungay"],
  "Huánuco": ["Huánuco", "Ambo", "Dos de Mayo", "Huacaybamba", "Huamalíes", "Leoncio Prado", "Marañón", "Pachitea", "Puerto Inca", "Lauricocha", "Yarowilca"],
  "Ica": ["Ica", "Chincha", "Nazca", "Palpa", "Pisco"],
  "Ayacucho": ["Huamanga", "Cangallo", "Huanca Sancos", "Huanta", "La Mar", "Lucanas", "Parinacochas", "Páucar del Sara Sara", "Sucre", "Víctor Fajardo", "Vilcas Huamán"],
  "San Martín": ["Moyobamba", "Bellavista", "El Dorado", "Huallaga", "Lamas", "Mariscal Cáceres", "Picota", "Rioja", "San Martín", "Tocache"],
  "Ucayali": ["Coronel Portillo", "Atalaya", "Padre Abad", "Purús"],
  "Amazonas": ["Chachapoyas", "Bagua", "Bongará", "Condorcanqui", "Luya", "Rodríguez de Mendoza", "Utcubamba"],
  "Apurímac": ["Abancay", "Andahuaylas", "Antabamba", "Aymaraes", "Cotabambas", "Chincheros", "Grau"],
  "Huancavelica": ["Huancavelica", "Acobamba", "Angaraes", "Castrovirreyna", "Churcampa", "Huaytará", "Tayacaja"],
  "Moquegua": ["Mariscal Nieto", "General Sánchez Cerro", "Ilo"],
  "Pasco": ["Pasco", "Daniel Alcides Carrión", "Oxapampa"],
  "Tacna": ["Tacna", "Candarave", "Jorge Basadre", "Tarata"],
  "Tumbes": ["Tumbes", "Contralmirante Villar", "Zarumilla"],
  "Madre de Dios": ["Tambopata", "Manu", "Tahuamanu"],
  "Callao": ["Callao"],
};

export function ProfileForm({ profile, setProfile, onClose }: ProfileFormProps) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  // Parse existing location on mount
  useState(() => {
    if (profile.location) {
      const parts = profile.location.split(" - ");
      if (parts.length === 2) {
        setSelectedDepartment(parts[0]);
        setSelectedProvince(parts[1]);
      }
    }
  });

  const handleNumberInput = (value: string, field: 'age' | 'weight' | 'height') => {
    // Only allow positive integers
    const numValue = value.replace(/[^0-9]/g, '');
    setLocalProfile({ ...localProfile, [field]: numValue });
  };

  const handleLocationChange = (department: string, province: string) => {
    if (department && province) {
      setLocalProfile({ ...localProfile, location: `${department} - ${province}` });
    }
  };

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
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="size-4 text-orange-600" />
            Datos personales
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Completa tu información básica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm sm:text-base flex items-center gap-2 mb-1">
              <User className="size-3" />
              Nombre completo
            </Label>
            <Input
              id="name"
              value={localProfile.name}
              onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
              placeholder="Tu nombre"
              className="text-sm sm:text-base"
            />
          </div>

          <div>
            <Label htmlFor="age" className="text-sm sm:text-base flex items-center gap-2 mb-1">
              <Calendar className="size-3" />
              Edad
            </Label>
            <Input
              id="age"
              type="text"
              inputMode="numeric"
              value={localProfile.age}
              onChange={(e) => handleNumberInput(e.target.value, 'age')}
              placeholder="Ej: 25"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="weight" className="text-sm sm:text-base flex items-center gap-2 mb-1">
                <Scale className="size-3" />
                Peso (kg)
              </Label>
              <Input
                id="weight"
                type="text"
                inputMode="numeric"
                value={localProfile.weight}
                onChange={(e) => handleNumberInput(e.target.value, 'weight')}
                placeholder="70"
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="height" className="text-sm sm:text-base flex items-center gap-2 mb-1">
                <Ruler className="size-3" />
                Talla (cm)
              </Label>
              <Input
                id="height"
                type="text"
                inputMode="numeric"
                value={localProfile.height}
                onChange={(e) => handleNumberInput(e.target.value, 'height')}
                placeholder="170"
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm sm:text-base flex items-center gap-2 mb-1">
              <MapPin className="size-3" />
              Ubicación
            </Label>
            <div className="space-y-2">
              <Select
                value={selectedDepartment}
                onValueChange={(value) => {
                  setSelectedDepartment(value);
                  setSelectedProvince("");
                  setLocalProfile({ ...localProfile, location: "" });
                }}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(departmentProvinces).map((dept) => (
                                          <SelectItem key={dept} value={dept} className="text-sm sm:text-base">                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedDepartment && (
                <Select
                  value={selectedProvince}
                  onValueChange={(value) => {
                    setSelectedProvince(value);
                    handleLocationChange(selectedDepartment, value);
                  }}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Selecciona provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentProvinces[selectedDepartment].map((prov) => (
                      <SelectItem key={prov} value={prov} className="text-sm sm:text-base">
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-xs sm:text-sm text-blue-800 text-center">
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