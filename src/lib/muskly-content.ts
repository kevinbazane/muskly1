export type Place = "casa" | "gimnasio";

export type Exercise = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  muscle: string;
  cue: string;
};

export type Workout = {
  day: string;
  focus: string;
  duration: string;
  exercises: Exercise[];
};

export const ROUTINES: Record<Place, Workout[]> = {
  gimnasio: [
    {
      day: "Lunes",
      focus: "Empuje · Pecho, hombro y tríceps",
      duration: "55 min",
      exercises: [
        {
          name: "Press banca con barra",
          sets: "4",
          reps: "6-8",
          rest: "2 min",
          muscle: "Pecho",
          cue: "Escápulas retraídas y pies firmes; baja controlado al esternón.",
        },
        {
          name: "Press militar sentado",
          sets: "3",
          reps: "8-10",
          rest: "90 s",
          muscle: "Hombro",
          cue: "No arquees la espalda: aprieta glúteos y abdomen.",
        },
        {
          name: "Press inclinado con mancuernas",
          sets: "3",
          reps: "10-12",
          rest: "90 s",
          muscle: "Pecho superior",
          cue: "Banco a 30°, recorrido completo sin chocar mancuernas.",
        },
        {
          name: "Fondos en paralelas",
          sets: "3",
          reps: "8-12",
          rest: "90 s",
          muscle: "Tríceps",
          cue: "Torso ligeramente inclinado, codos cerca del cuerpo.",
        },
        {
          name: "Elevaciones laterales",
          sets: "3",
          reps: "12-15",
          rest: "60 s",
          muscle: "Deltoides medio",
          cue: "Sube hasta la línea del hombro sin impulso.",
        },
      ],
    },
    {
      day: "Martes",
      focus: "Tirón · Espalda y bíceps",
      duration: "55 min",
      exercises: [
        {
          name: "Dominadas (o jalón al pecho)",
          sets: "4",
          reps: "6-10",
          rest: "2 min",
          muscle: "Dorsal",
          cue: "Piensa en llevar los codos al bolsillo, no en tirar con las manos.",
        },
        {
          name: "Remo con barra",
          sets: "4",
          reps: "8-10",
          rest: "2 min",
          muscle: "Espalda media",
          cue: "Torso a 45°, espalda neutra, barra al ombligo.",
        },
        {
          name: "Remo en polea baja",
          sets: "3",
          reps: "10-12",
          rest: "90 s",
          muscle: "Espalda",
          cue: "Pausa de 1 s apretando escápulas.",
        },
        {
          name: "Curl con barra Z",
          sets: "3",
          reps: "10-12",
          rest: "60 s",
          muscle: "Bíceps",
          cue: "Codos pegados al costado, sin balanceo.",
        },
        {
          name: "Face pull",
          sets: "3",
          reps: "15",
          rest: "60 s",
          muscle: "Deltoides posterior",
          cue: "Clave para hombros sanos: tira hacia la frente.",
        },
      ],
    },
    {
      day: "Jueves",
      focus: "Pierna completa",
      duration: "60 min",
      exercises: [
        {
          name: "Sentadilla trasera",
          sets: "4",
          reps: "6-8",
          rest: "2-3 min",
          muscle: "Cuádriceps",
          cue: "Baja hasta romper paralelo manteniendo el pecho alto.",
        },
        {
          name: "Peso muerto rumano",
          sets: "3",
          reps: "8-10",
          rest: "2 min",
          muscle: "Femoral y glúteo",
          cue: "Cadera atrás, barra pegada a la pierna.",
        },
        {
          name: "Prensa inclinada",
          sets: "3",
          reps: "10-12",
          rest: "90 s",
          muscle: "Cuádriceps",
          cue: "No bloquees rodillas arriba.",
        },
        {
          name: "Zancadas caminando",
          sets: "3",
          reps: "10 por pierna",
          rest: "90 s",
          muscle: "Glúteo",
          cue: "Paso largo, rodilla trasera casi al suelo.",
        },
        {
          name: "Elevación de gemelos",
          sets: "4",
          reps: "12-15",
          rest: "60 s",
          muscle: "Gemelos",
          cue: "Pausa arriba de 2 s en cada repetición.",
        },
      ],
    },
    {
      day: "Viernes",
      focus: "Full body de fuerza",
      duration: "50 min",
      exercises: [
        {
          name: "Peso muerto convencional",
          sets: "4",
          reps: "5",
          rest: "3 min",
          muscle: "Cadena posterior",
          cue: "Barra pegada al cuerpo, espalda neutra desde el inicio.",
        },
        {
          name: "Press banca inclinado",
          sets: "3",
          reps: "8",
          rest: "2 min",
          muscle: "Pecho",
          cue: "Controla la bajada en 2-3 s.",
        },
        {
          name: "Remo con mancuerna a una mano",
          sets: "3",
          reps: "10 por lado",
          rest: "90 s",
          muscle: "Espalda",
          cue: "Sin rotar el torso; el movimiento es del brazo.",
        },
        {
          name: "Plancha con peso",
          sets: "3",
          reps: "40 s",
          rest: "60 s",
          muscle: "Core",
          cue: "Glúteos apretados, cadera en línea.",
        },
      ],
    },
  ],
  casa: [
    {
      day: "Lunes",
      focus: "Tren superior con peso corporal",
      duration: "35 min",
      exercises: [
        {
          name: "Flexiones (pies elevados si es fácil)",
          sets: "4",
          reps: "8-15",
          rest: "90 s",
          muscle: "Pecho",
          cue: "Cuerpo en tabla, codos a 45° del torso.",
        },
        {
          name: "Fondos entre sillas",
          sets: "3",
          reps: "8-12",
          rest: "90 s",
          muscle: "Tríceps",
          cue: "Baja hasta 90° de codo, sin hundir hombros.",
        },
        {
          name: "Remo invertido bajo la mesa",
          sets: "4",
          reps: "8-12",
          rest: "90 s",
          muscle: "Espalda",
          cue: "Cuerpo recto, pecho a la mesa.",
        },
        {
          name: "Pike push-up",
          sets: "3",
          reps: "8-12",
          rest: "60 s",
          muscle: "Hombro",
          cue: "Cadera alta; la cabeza baja entre las manos.",
        },
      ],
    },
    {
      day: "Miércoles",
      focus: "Pierna y core",
      duration: "35 min",
      exercises: [
        {
          name: "Sentadilla búlgara",
          sets: "4",
          reps: "10 por pierna",
          rest: "90 s",
          muscle: "Cuádriceps y glúteo",
          cue: "Pie trasero sobre sofá o silla; torso ligeramente adelante.",
        },
        {
          name: "Puente de glúteo a una pierna",
          sets: "3",
          reps: "12 por lado",
          rest: "60 s",
          muscle: "Glúteo",
          cue: "Pausa de 2 s arriba apretando fuerte.",
        },
        {
          name: "Sentadilla con mochila cargada",
          sets: "4",
          reps: "12-15",
          rest: "90 s",
          muscle: "Piernas",
          cue: "Llena la mochila con libros o botellas de agua.",
        },
        {
          name: "Plancha lateral",
          sets: "3",
          reps: "30 s por lado",
          rest: "45 s",
          muscle: "Core",
          cue: "Cadera arriba, sin caer hacia adelante.",
        },
      ],
    },
    {
      day: "Viernes",
      focus: "Full body metabólico",
      duration: "30 min",
      exercises: [
        {
          name: "Burpee sin salto",
          sets: "4",
          reps: "10",
          rest: "60 s",
          muscle: "Full body",
          cue: "Prioriza técnica sobre velocidad.",
        },
        {
          name: "Zancadas alternas",
          sets: "3",
          reps: "12 por pierna",
          rest: "60 s",
          muscle: "Piernas",
          cue: "Rodilla alineada con el pie.",
        },
        {
          name: "Flexiones diamante",
          sets: "3",
          reps: "8-12",
          rest: "60 s",
          muscle: "Tríceps",
          cue: "Manos juntas bajo el pecho.",
        },
        {
          name: "Superman",
          sets: "3",
          reps: "15",
          rest: "45 s",
          muscle: "Lumbar",
          cue: "Eleva brazos y piernas sin tirón.",
        },
      ],
    },
  ],
};

export type MealTemplate = {
  key: "desayuno" | "almuerzo" | "cena" | "snack";
  label: string;
  time: string;
  share: number; // porcentaje de calorías del día
  items: string[];
};

export const MEAL_TEMPLATES: MealTemplate[] = [
  {
    key: "desayuno",
    label: "Desayuno",
    time: "07:30",
    share: 0.27,
    items: ["Avena con leche y plátano", "3 huevos revueltos", "Puñado de nueces"],
  },
  {
    key: "almuerzo",
    label: "Almuerzo",
    time: "13:00",
    share: 0.33,
    items: ["Pechuga de pollo a la plancha", "Arroz integral", "Ensalada con aceite de oliva"],
  },
  {
    key: "snack",
    label: "Snack",
    time: "17:00",
    share: 0.15,
    items: ["Batido de proteína con leche", "Pan integral con mantequilla de maní"],
  },
  {
    key: "cena",
    label: "Cena",
    time: "20:30",
    share: 0.25,
    items: ["Salmón o carne magra", "Papa o quinua", "Verduras salteadas"],
  },
];

export const KEY_FOODS = [
  { name: "Huevo", detail: "6 g proteína · barato y completo", emoji: "🥚" },
  { name: "Pollo", detail: "31 g proteína / 100 g", emoji: "🍗" },
  { name: "Avena", detail: "Carbo lento para el superávit", emoji: "🥣" },
  { name: "Arroz", detail: "Energía fácil de comer en volumen", emoji: "🍚" },
  { name: "Leche entera", detail: "Calorías líquidas + calcio", emoji: "🥛" },
  { name: "Maní", detail: "Grasa densa: 570 kcal / 100 g", emoji: "🥜" },
  { name: "Palta", detail: "Grasas saludables y potasio", emoji: "🥑" },
  { name: "Atún", detail: "Proteína rápida y práctica", emoji: "🐟" },
];

export const SUPPLEMENTS = [
  {
    name: "Proteína en polvo",
    dose: "1 scoop (25 g)",
    why: "Solo si te cuesta llegar a tu proteína diaria con comida real.",
  },
  {
    name: "Creatina monohidratada",
    dose: "3-5 g al día",
    why: "El suplemento con más evidencia para fuerza y masa magra.",
  },
  {
    name: "Vitamina D3",
    dose: "1000-2000 UI",
    why: "Útil si tomas poco sol; apoya fuerza y salud ósea.",
  },
];

export const MEASUREMENT_FIELDS = [
  { key: "chest", label: "Pecho" },
  { key: "arm", label: "Brazo" },
  { key: "waist", label: "Cintura" },
  { key: "thigh", label: "Muslo" },
] as const;
