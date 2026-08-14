import typeProteina from "@/assets/food/type-proteina.jpg";
import typeCarbos from "@/assets/food/type-carbos.jpg";
import typeVerduras from "@/assets/food/type-verduras.jpg";
import typeGrasas from "@/assets/food/type-grasas.jpg";
import avenaPlatano from "@/assets/food/avena-platano.jpg";
import huevosPalta from "@/assets/food/huevos-palta.jpg";
import polloArroz from "@/assets/food/pollo-arroz.jpg";
import lomoQuinua from "@/assets/food/lomo-quinua.jpg";
import yogurFrutos from "@/assets/food/yogur-frutos.jpg";
import batidoMani from "@/assets/food/batido-mani.jpg";
import salmonCamote from "@/assets/food/salmon-camote.jpg";
import tortillaAtun from "@/assets/food/tortilla-atun.jpg";

export type MealKey = "desayuno" | "almuerzo" | "snack" | "cena";

export type FoodType = {
  key: string;
  label: string;
  image: string;
  detail: string;
};

export const FOOD_TYPES: FoodType[] = [
  { key: "proteina", label: "Proteína", image: typeProteina, detail: "Pollo, huevo, pescado" },
  { key: "carbos", label: "Carbos", image: typeCarbos, detail: "Arroz, avena, camote" },
  { key: "verduras", label: "Verduras", image: typeVerduras, detail: "Fibra y micros" },
  { key: "grasas", label: "Grasas buenas", image: typeGrasas, detail: "Palta, frutos secos" },
];

export type Recipe = {
  key: string;
  name: string;
  subtitle: string;
  tag: string;
  meal: MealKey;
  type: string;
  minutes: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  image: string;
  ingredients: string[];
};

export const RECIPES: Recipe[] = [
  {
    key: "avena-platano",
    name: "Avena power",
    subtitle: "Avena con plátano y maní",
    tag: "Volumen",
    meal: "desayuno",
    type: "carbos",
    minutes: 10,
    kcal: 620,
    protein: 32,
    carbs: 78,
    fats: 19,
    image: avenaPlatano,
    ingredients: [
      "80 g de avena en hojuelas",
      "1 plátano maduro",
      "1 scoop de proteína (30 g)",
      "1 cda de mantequilla de maní",
      "250 ml de leche entera",
      "Canela al gusto",
    ],
  },
  {
    key: "huevos-palta",
    name: "Huevos & palta",
    subtitle: "Revueltos con pan integral",
    tag: "Rápido",
    meal: "desayuno",
    type: "proteina",
    minutes: 12,
    kcal: 540,
    protein: 30,
    carbs: 38,
    fats: 28,
    image: huevosPalta,
    ingredients: [
      "3 huevos enteros",
      "1/2 palta",
      "2 rebanadas de pan integral",
      "1 cdta de aceite de oliva",
      "Sal, pimienta y cilantro",
    ],
  },
  {
    key: "pollo-arroz",
    name: "Pollo & arroz",
    subtitle: "Con verduras al vapor",
    tag: "Clásico",
    meal: "almuerzo",
    type: "proteina",
    minutes: 25,
    kcal: 750,
    protein: 52,
    carbs: 85,
    fats: 18,
    image: polloArroz,
    ingredients: [
      "200 g de pechuga de pollo",
      "1 taza de arroz cocido",
      "1 taza de brócoli y zanahoria",
      "1 cda de aceite de oliva",
      "Ajo, comino y limón",
    ],
  },
  {
    key: "lomo-quinua",
    name: "Lomo con quinua",
    subtitle: "Versión ligera del saltado",
    tag: "Fuerza",
    meal: "almuerzo",
    type: "proteina",
    minutes: 30,
    kcal: 780,
    protein: 48,
    carbs: 72,
    fats: 26,
    image: lomoQuinua,
    ingredients: [
      "180 g de lomo de res",
      "1 taza de quinua cocida",
      "1/2 cebolla roja y 1 tomate",
      "1 cda de sillao",
      "1 cda de aceite",
      "Culantro fresco",
    ],
  },
  {
    key: "yogur-frutos",
    name: "Yogur & frutos",
    subtitle: "Griego con granola",
    tag: "Snack",
    meal: "snack",
    type: "proteina",
    minutes: 5,
    kcal: 380,
    protein: 26,
    carbs: 42,
    fats: 12,
    image: yogurFrutos,
    ingredients: [
      "200 g de yogur griego natural",
      "1/2 taza de frutos rojos",
      "30 g de granola",
      "1 cdta de miel",
    ],
  },
  {
    key: "batido-mani",
    name: "Batido de maní",
    subtitle: "Plátano y proteína",
    tag: "Post-entreno",
    meal: "snack",
    type: "grasas",
    minutes: 5,
    kcal: 450,
    protein: 34,
    carbs: 48,
    fats: 14,
    image: batidoMani,
    ingredients: [
      "1 plátano",
      "1 scoop de proteína",
      "1 cda de mantequilla de maní",
      "300 ml de leche",
      "Hielo al gusto",
    ],
  },
  {
    key: "salmon-camote",
    name: "Salmón al horno",
    subtitle: "Con camote y espárragos",
    tag: "Omega-3",
    meal: "cena",
    type: "proteina",
    minutes: 28,
    kcal: 640,
    protein: 44,
    carbs: 46,
    fats: 28,
    image: salmonCamote,
    ingredients: [
      "180 g de salmón",
      "1 camote mediano",
      "8 espárragos",
      "1 cda de aceite de oliva",
      "Limón, sal y pimienta",
    ],
  },
  {
    key: "tortilla-atun",
    name: "Tortilla de atún",
    subtitle: "Claras con ensalada",
    tag: "Ligero",
    meal: "cena",
    type: "proteina",
    minutes: 15,
    kcal: 430,
    protein: 42,
    carbs: 22,
    fats: 16,
    image: tortillaAtun,
    ingredients: [
      "4 claras + 1 huevo entero",
      "1 lata de atún en agua",
      "Lechuga, tomate y pepino",
      "1 cdta de aceite de oliva",
      "Orégano y limón",
    ],
  },
];

export const MEAL_TABS: { key: MealKey; label: string }[] = [
  { key: "desayuno", label: "Desayuno" },
  { key: "almuerzo", label: "Almuerzo" },
  { key: "snack", label: "Snack" },
  { key: "cena", label: "Cena" },
];
