// ============================================
// DEMO DATA - Datos de demostración
// ============================================

const DEMO_DATA = {
    // Información del sistema
    systemInfo: {
        name: "Sistema de Gestión de Restaurante",
        version: "1.0.0",
        description: "Plataforma completa para gestión de restaurantes",
        features: 8,
        modules: [
            "E-commerce",
            "Autenticación",
            "POS",
            "Cocina",
            "Admin",
            "Propietario",
            "Pagos",
            "Delivery"
        ]
    },

    // Productos de ejemplo (genéricos para cualquier restaurante)
    products: [
        {
            id: 1,
            name: "Hamburguesa Clásica",
            category: "Hamburguesas",
            price: 8500,
            image: "hamburguesa-clasica.jpg",
            description: "Carne de res, lechuga, tomate, queso cheddar y salsa especial",
            active: true,
            stock: 25
        },
        {
            id: 2,
            name: "Pizza Margherita",
            category: "Pizzas",
            price: 9500,
            image: "pizza-margherita.jpg",
            description: "Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva",
            active: true,
            stock: 18
        },
        {
            id: 3,
            name: "Ensalada César",
            category: "Ensaladas",
            price: 7000,
            image: "ensalada-cesar.jpg",
            description: "Lechuga romana, pollo grillado, crutones, parmesano y aderezo césar",
            active: true,
            stock: 30
        },
        {
            id: 4,
            name: "Pasta Carbonara",
            category: "Pastas",
            price: 10500,
            image: "pasta-carbonara.jpg",
            description: "Espagueti con panceta, huevo, queso parmesano y pimienta negra",
            active: true,
            stock: 20
        },
        {
            id: 5,
            name: "Tacos al Pastor",
            category: "Tacos",
            price: 6500,
            image: "tacos-pastor.jpg",
            description: "Tortillas de maíz con carne marinada, piña, cilantro y cebolla",
            active: true,
            stock: 40
        },
        {
            id: 6,
            name: "Sushi Roll California",
            category: "Sushi",
            price: 12000,
            image: "sushi-california.jpg",
            description: "Arroz, alga nori, cangrejo, aguacate, pepino y sésamo",
            active: true,
            stock: 15
        }
    ],

    // Órdenes de ejemplo
    orders: [
        {
            id: "ORD-001",
            customer: "Juan Pérez",
            items: [
                { name: "Hamburguesa Clásica", quantity: 2, price: 8500 },
                { name: "Pasta Carbonara", quantity: 1, price: 10500 }
            ],
            total: 27500,
            status: "en_preparacion",
            source: "web",
            paymentMethod: "card",
            timestamp: new Date().toISOString()
        },
        {
            id: "ORD-002",
            customer: "María González",
            items: [
                { name: "Pizza Margherita", quantity: 2, price: 9500 },
                { name: "Ensalada César", quantity: 1, price: 7000 }
            ],
            total: 26000,
            status: "pendiente",
            source: "pos",
            paymentMethod: "cash",
            timestamp: new Date().toISOString()
        },
        {
            id: "ORD-003",
            customer: "Carlos Rodríguez",
            items: [
                { name: "Sushi Roll California", quantity: 2, price: 12000 },
                { name: "Tacos al Pastor", quantity: 3, price: 6500 }
            ],
            total: 43500,
            status: "completado",
            source: "app",
            paymentMethod: "online",
            timestamp: new Date().toISOString()
        }
    ],

    // KPIs de ejemplo
    kpis: {
        today: {
            sales: 450000,
            orders: 32,
            avgTicket: 14062,
            margin: 62.5
        },
        weekly: {
            sales: 2850000,
            orders: 198,
            avgTicket: 14393,
            margin: 61.8
        },
        monthly: {
            sales: 11200000,
            orders: 782,
            avgTicket: 14322,
            margin: 63.2
        }
    },

    // Ingredientes de ejemplo (genéricos)
    ingredients: [
        {
            id: 1,
            name: "Carne de Res",
            category: "Carnes",
            unit: "kg",
            cost: 8500,
            stock: 15.5,
            minStock: 10
        },
        {
            id: 2,
            name: "Queso Mozzarella",
            category: "Lácteos",
            unit: "kg",
            cost: 4200,
            stock: 8.2,
            minStock: 5
        },
        {
            id: 3,
            name: "Tomate",
            category: "Verduras",
            unit: "kg",
            cost: 1200,
            stock: 12.0,
            minStock: 8
        },
        {
            id: 4,
            name: "Lechuga",
            category: "Verduras",
            unit: "kg",
            cost: 900,
            stock: 10.5,
            minStock: 5
        },
        {
            id: 5,
            name: "Pasta Seca",
            category: "Abarrotes",
            unit: "kg",
            cost: 2200,
            stock: 25.0,
            minStock: 15
        },
        {
            id: 6,
            name: "Pollo",
            category: "Carnes",
            unit: "kg",
            cost: 3500,
            stock: 18.5,
            minStock: 12
        }
    ],

    // Recetas de ejemplo
    recipes: {
        1: [ // Hamburguesa Clásica
            { ingredientId: 1, quantity: 0.15, name: "Carne de Res" },
            { ingredientId: 2, quantity: 0.03, name: "Queso Mozzarella" },
            { ingredientId: 3, quantity: 0.05, name: "Tomate" },
            { ingredientId: 4, quantity: 0.02, name: "Lechuga" }
        ],
        2: [ // Pizza Margherita
            { ingredientId: 2, quantity: 0.20, name: "Queso Mozzarella" },
            { ingredientId: 3, quantity: 0.15, name: "Tomate" }
        ],
        3: [ // Ensalada César
            { ingredientId: 4, quantity: 0.15, name: "Lechuga" },
            { ingredientId: 6, quantity: 0.12, name: "Pollo" }
        ],
        4: [ // Pasta Carbonara
            { ingredientId: 5, quantity: 0.20, name: "Pasta Seca" },
            { ingredientId: 2, quantity: 0.05, name: "Queso Mozzarella" }
        ]
    },

    // Usuarios de ejemplo
    users: [
        {
            id: 1,
            name: "Juan Pérez",
            email: "juan@gmail.com",
            provider: "google",
            vipLevel: "gold",
            points: 1250,
            orders: 15
        },
        {
            id: 2,
            name: "María González",
            email: "maria@facebook.com",
            provider: "facebook",
            vipLevel: "silver",
            points: 680,
            orders: 8
        }
    ],

    // Métodos de pago (genéricos)
    paymentMethods: [
        {
            id: "cash",
            name: "Efectivo / Cash",
            icon: "💵",
            enabled: true
        },
        {
            id: "card",
            name: "Tarjeta de Crédito/Débito",
            icon: "💳",
            enabled: true
        },
        {
            id: "online",
            name: "Pago Online",
            icon: "🌐",
            enabled: true,
            provider: "payment_gateway"
        },
        {
            id: "digital_wallet",
            name: "Billetera Digital",
            icon: "�",
            enabled: true,
            provider: "digital_wallet"
        }
    ],

    // Estadísticas de delivery (genéricas)
    delivery: {
        avgTime: 35,
        avgCost: 2500,
        coverage: "Área metropolitana y alrededores",
        provider: "Sistema de Delivery",
        activeOrders: 5
    }
};

// Funciones helper para formateo
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
};

const getStatusBadge = (status) => {
    const badges = {
        'pendiente': { text: 'Pendiente', color: '#f59e0b', icon: '⏳' },
        'en_preparacion': { text: 'En Preparación', color: '#3b82f6', icon: '👨‍🍳' },
        'listo': { text: 'Listo', color: '#10b981', icon: '✅' },
        'completado': { text: 'Completado', color: '#6b7280', icon: '✓' },
        'cancelado': { text: 'Cancelado', color: '#ef4444', icon: '✕' }
    };
    return badges[status] || badges['pendiente'];
};

const getVIPBadge = (level) => {
    const badges = {
        'bronze': '🥉',
        'silver': '🥈',
        'gold': '🥇',
        'platinum': '💎'
    };
    return badges[level] || '';
};

// Calcular costo de receta
const calculateRecipeCost = (productId) => {
    const recipe = DEMO_DATA.recipes[productId];
    if (!recipe) return 0;

    return recipe.reduce((total, item) => {
        const ingredient = DEMO_DATA.ingredients.find(ing => ing.id === item.ingredientId);
        if (!ingredient) return total;
        return total + (ingredient.cost * item.quantity);
    }, 0);
};

// Calcular margen
const calculateMargin = (productId) => {
    const product = DEMO_DATA.products.find(p => p.id === productId);
    if (!product) return { margin: 0, percentage: 0 };

    const cost = calculateRecipeCost(productId);
    const margin = product.price - cost;
    const percentage = ((margin / product.price) * 100).toFixed(1);

    return { margin, percentage, cost };
};

// Exportar para uso global
window.DEMO_DATA = DEMO_DATA;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getStatusBadge = getStatusBadge;
window.getVIPBadge = getVIPBadge;
window.calculateRecipeCost = calculateRecipeCost;
window.calculateMargin = calculateMargin;
