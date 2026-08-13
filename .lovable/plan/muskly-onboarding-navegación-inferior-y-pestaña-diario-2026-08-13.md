# Muskly — Onboarding, navegación inferior y pestaña Diario

App móvil para ganar masa muscular, con tono cercano y motivador. Esta primera entrega cubre: onboarding, barra de navegación de 5 pestañas y la pantalla "Diario" completa.

## Identidad visual

- Primario: `#fd8036` (naranja vitalidad), con variante suave para fondos de acento.
- Superficies blancas, tarjetas redondeadas (radio grande), sombras suaves difusas.
- Tipografía: Poppins (títulos) e Inter (cuerpo/UI), cargadas desde el head raíz.
- Todos los colores como tokens semánticos en `src/styles.css` (formato oklch), sin colores fijos en componentes.
- Layout tipo app móvil: contenedor centrado con ancho máximo tipo teléfono, nav inferior fija.

## Onboarding

Flujo de pasos en `/onboarding`:
1. Bienvenida (logo, promesa, botón "Empezar").
2. Datos: nombre, edad, sexo.
3. Cuerpo: peso actual y talla.
4. Nivel de experiencia (principiante / intermedio / avanzado) y frecuencia disponible.
5. Objetivo (ganar volumen, definir manteniendo masa, fuerza) y peso meta.
6. Resumen con plan calculado (calorías objetivo, proteína diaria en g, agua diaria) y botón "Ir a mi diario".

Detalles:
- Barra de progreso superior, botones Atrás/Continuar, validación por paso.
- Los datos se guardan localmente en el dispositivo (sin cuentas todavía).
- Si no hay perfil guardado, `/` redirige a `/onboarding`; si existe, entra al Diario.

## Navegación inferior

Barra fija con 5 pestañas e íconos: Diario, Ejercicios, Nutrición, Informe, Perfil. Pestaña activa en naranja con etiqueta, resto en gris. Las cuatro pestañas distintas de Diario se crean como pantallas placeholder con encabezado propio en esta entrega, y se desarrollan después.

## Pestaña Diario

- Encabezado: saludo personalizado ("Buenos días, Kevin") + fecha y racha de días activos.
- Tarjeta de frase motivacional del día.
- Anillos/barras de resumen: calorías, proteína, agua, entrenamiento.
- Checklist interactivo del día: entrenamiento pendiente, comidas registradas, vasos de agua (contador +/-). El estado marcado persiste localmente por fecha.
- Tarjeta "Recomendación de hoy" (personalizada según el progreso del día; en esta entrega con lógica basada en reglas, la IA real llega cuando activemos el backend).
- Carrusel/lista "Tips & Consejos Validados" con referencia científica visible en cada tarjeta.

## Notas técnicas

- Rutas: `src/routes/index.tsx` (Diario), `onboarding.tsx`, `ejercicios.tsx`, `nutricion.tsx`, `informe.tsx`, `perfil.tsx`; layout con nav inferior compartida.
- Estado del perfil y del día en `localStorage` mediante un hook, leído tras la hidratación para evitar desajustes de SSR.
- Componentes reutilizables: `BottomNav`, `AppHeader`, `StatRing`, `ChecklistItem`, `TipCard`.
- Cada ruta define su propio `head()` con título y descripción específicos.
- Sin base de datos por ahora. Cuando quieras cuentas, sincronización entre dispositivos o IA real, activamos Lovable Cloud en una siguiente etapa.
