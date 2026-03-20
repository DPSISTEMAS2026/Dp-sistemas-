# 🎬 Sistema de Gestión de Restaurante - Demo Showcase

Demo interactivo que muestra todas las funcionalidades del sistema completo de gestión para restaurantes.

---

## 📋 Descripción

Este es un **sitio web de demostración** que muestra de forma interactiva todas las capacidades del sistema de gestión de restaurantes. 

**IMPORTANTE**: Este showcase **abre los paneles reales** del sistema principal en nuevas pestañas, permitiendo ver la interfaz y funcionalidades completas en acción. Los datos mostrados son genéricos y de ejemplo.

Incluye:

- ✨ Tour guiado paso a paso
- 🎯 Acceso directo a paneles reales del sistema
- 📊 Datos de demostración genéricos
- 🎨 Diseño moderno y atractivo
- 📱 Totalmente responsive

---

## 🚀 Características del Demo

### 1. **Tour Interactivo**
- Guía paso a paso por todas las funcionalidades
- Tooltips explicativos con highlights visuales
- Barra de progreso
- Navegación entre pasos

### 2. **Módulos Demostrados**

#### 🛍️ E-commerce Web
- Catálogo de productos
- Carrito de compras
- Checkout completo
- Personalización de pedidos

#### 🔐 Autenticación Social
- Login con Google OAuth
- Login con Facebook OAuth
- Sistema de afiliados VIP
- Gestión de puntos

#### 💰 Sistema POS
- Interfaz táctil
- Múltiples métodos de pago
- Gestión de mesas
- Impresión de tickets

#### 👨‍🍳 Panel de Cocina
- Órdenes en tiempo real
- WebSocket para actualizaciones
- Estados de preparación
- Priorización de pedidos

#### ⚙️ Panel Administrativo
- Gestión de productos
- Control de inventario
- Activación/desactivación
- Configuración de precios

#### 📈 Panel de Propietario
- Dashboard con KPIs
- Análisis de rentabilidad
- Gestión de recetas y costos
- Alertas de inventario

#### 💳 Pasarelas de Pago
- Tarjetas de crédito/débito
- Billeteras digitales (Apple Pay, Google Pay, PayPal)
- Pagos seguros (PCI DSS)
- Confirmación automática

#### 🚚 Delivery Integrado
- Cálculo automático de costos
- Validación de direcciones
- Tracking en tiempo real
- Compatible con múltiples proveedores

---

## 📁 Estructura del Proyecto

```
DEMO-SHOWCASE/
├── index.html              # Página principal
├── demo-tour.js            # Sistema de tour interactivo
├── demo-data.js            # Datos de demostración
├── styles/
│   ├── demo-main.css       # Estilos principales
│   └── tour-popups.css     # Estilos de popups/tooltips
├── pages/                  # Páginas adicionales (futuro)
├── assets/
│   └── images/             # Imágenes del demo
└── README.md               # Este archivo
```

---

## 🎯 Cómo Usar

### Opción 1: Abrir Directamente
1. Abre `index.html` en tu navegador
2. Haz clic en "Iniciar Demo Interactivo"
3. Sigue el tour guiado

### Opción 2: Servidor Local (Recomendado)
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server -p 8000

# Con PHP
php -S localhost:8000
```

Luego abre: `http://localhost:8000`

---

## 🎨 Características de Diseño

- **Gradientes Vibrantes**: Colores modernos y atractivos
- **Animaciones Suaves**: Transiciones fluidas
- **Glassmorphism**: Efectos de vidrio esmerilado
- **Micro-animaciones**: Elementos interactivos
- **Responsive**: Adaptado a todos los dispositivos

---

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS
- **JavaScript (Vanilla)**: Sin dependencias
- **Google Fonts**: Inter y Poppins

---

## 📊 Datos de Demostración

El demo incluye datos realistas y genéricos de:
- 6 productos de ejemplo (variedad de categorías)
- 3 órdenes activas
- KPIs de ventas (hoy, semanal, mensual)
- 6 ingredientes de inventario
- 2 usuarios VIP
- 4 métodos de pago

Todos los datos están en `demo-data.js` y pueden ser modificados fácilmente.

---

## 🎬 Tour Interactivo

El tour consta de **9 pasos**:

1. Introducción
2. E-commerce Web
3. Autenticación Social
4. Sistema POS
5. Panel de Cocina
6. Panel Administrativo
7. Panel de Propietario
8. Pasarelas de Pago
9. Delivery Integrado

Cada paso incluye:
- Tooltip explicativo
- Highlight visual del elemento
- Descripción detallada
- Navegación (Anterior/Siguiente)

---

## 🎯 Funcionalidades Interactivas

### Panel de Control del Tour
- Botón de inicio/parada
- Barra de progreso
- Contador de pasos
- Navegación manual

### Tarjetas de Funcionalidades
- Click para ver demo detallado
- Hover effects
- Información expandida
- Datos reales del sistema

### Modal de Demos
- Contenido dinámico por módulo
- Ejemplos visuales
- Datos formateados
- Cierre con click fuera

---

## 📱 Responsive Design

El demo está optimizado para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

---

## 🎨 Personalización

### Colores
Edita las variables CSS en `styles/demo-main.css`:
```css
:root {
    --primary: #6366f1;
    --secondary: #ec4899;
    --success: #10b981;
    /* ... más colores */
}
```

### Datos
Modifica `demo-data.js` para cambiar:
- Productos
- Órdenes
- KPIs
- Ingredientes
- Usuarios

### Pasos del Tour
Edita el array `TOUR_STEPS` en `demo-tour.js`

---

## 🚀 Próximas Mejoras

- [ ] Páginas individuales para cada módulo
- [ ] Videos demostrativos
- [ ] Modo oscuro
- [ ] Más animaciones
- [ ] Exportar datos de demo
- [ ] Comparación con competidores

---

## 📄 Licencia

Este es un proyecto de demostración del sistema de gestión de restaurantes.

---

## 👨‍💻 Autor

Creado como showcase del **Sistema de Gestión de Restaurante LoMas Rico**

---

## 📞 Contacto

Para más información sobre el sistema completo, consulta el proyecto principal en:
`../PROYECTO RESTAURANTE/`

---

**¡Disfruta explorando el demo! 🎉**
