/**
 * CMPabloyElena - Channel Manager v5
 * Edición de Propiedades + Auto-Sync 4 veces/día
 */

// --- ESTADO Y ALMACENAMIENTO ---
const DEFAULT_STATE = {
    properties: [
        { id: 'atico', name: 'Penthouse Madrid', location: 'Madrid, España', price: 145, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800', status: 'Listo', icalUrl: '' },
        { id: 'loft', name: 'Loft Gran Vía', location: 'Madrid, España', price: 110, img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800', status: 'Ocupado', icalUrl: '' }
    ],
    bookings: [],
    tasks: [],
    lastSync: 0 // Para controlar la sincronización automática
};

let state = JSON.parse(localStorage.getItem('cm_state_v5')) || DEFAULT_STATE;

function saveState() {
    localStorage.setItem('cm_state_v5', JSON.stringify(state));
}

// --- LÓGICA DE AUTO-SYNC ---
// Se ejecuta cada vez que abrimos la app. Si han pasado > 6 horas, sincroniza (4 veces/día).
async function checkAutoSync() {
    const ahora = Date.now();
    const seisHoras = 6 * 60 * 60 * 1000;

    if (ahora - state.lastSync > seisHoras) {
        console.log("Iniciando auto-sync programado...");
        for (let prop of state.properties) {
            if (prop.icalUrl) {
                await syncAirbnb(prop.id, prop.icalUrl, true);
            }
        }
        state.lastSync = ahora;
        saveState();
    }
}

// --- PLANTILLAS DE PÁGINAS ---
const pages = {
    dashboard: () => {
        const airbnbReservas = state.bookings.filter(b => b.channel === 'airbnb');
        return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value">${airbnbReservas.length}</span>
                <span class="stat-label">Reservas Airbnb</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${state.properties.length}</span>
                <span class="stat-label">Propiedades</span>
            </div>
        </div>

        <div class="card" style="margin-top:20px;">
            <h3 class="section-title">Actividad Reciente</h3>
            <div class="activity-list">
                ${airbnbReservas.length > 0 ? airbnbReservas.slice(0, 5).map(b => `
                    <div class="activity-item">
                        <div class="status-dot status-green"></div>
                        <div class="activity-info">
                            <h4>${b.propName}</h4>
                            <p>${b.checkin} - ${b.checkout}</p>
                        </div>
                    </div>`).join('') : '<p style="padding:20px; text-align:center; opacity:0.5;">Todavía no hay sincronizaciones.</p>'}
            </div>
        </div>
        `;
    },

    apartamentos: () => `
        <div class="section-title">
            <h2>Gestión</h2>
            <button class="btn-tiny-glass" onclick="addNewProperty()">+ Nueva</button>
        </div>
        ${state.properties.map(p => `
        <div class="property-card-premium fade-in" style="margin-bottom:20px;">
            <div class="prop-img-container" onclick="editProperty('${p.id}')">
                <img src="${p.img}" class="prop-img-premium">
                <div class="status-indicator-full">Toca para Editar</div>
                <div class="quick-actions-overlay">
                    <div class="action-btn-glass" onclick="event.stopPropagation(); handleSyncClick('${p.id}')">
                        <i data-lucide="refresh-cw"></i>
                    </div>
                </div>
            </div>
            <div class="prop-details-premium">
                <h3>${p.name}</h3>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="opacity:0.7; font-size:0.8rem;">${p.location}</span>
                    <span style="font-weight:700; color:var(--accent-green);">${p.price}€/n</span>
                </div>
                ${p.icalUrl ? '<div style="font-size:0.6rem; color:#10b981; margin-top:5px;">● Conectado a Airbnb</div>' : ''}
            </div>
        </div>`).join('')}
    `,

    calendario: () => `
        <div class="cal-page-header"><h1>Calendario Global</h1></div>
        <div class="cal-container" style="padding:15px;">
            ${state.properties.map(p => `
                <div style="margin-bottom:20px;">
                    <h4 style="margin-bottom:10px; font-size:0.9rem;">${p.name}</h4>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        ${state.bookings.filter(b => b.propId === p.id).map(b => `
                            <div class="booking-pill booking-airbnb" style="font-size:0.7rem;">
                                ${b.checkin} - ${b.checkout}
                            </div>
                        `).join('')}
                        ${state.bookings.filter(b => b.propId === p.id).length === 0 ? '<div style="opacity:0.3; font-size:0.7rem;">Sin reservas</div>' : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `,

    ingresos: () => `<div class="revenue-hero"><p>Ingresos</p><h1>${(state.properties.length * 2.5).toFixed(1)}k€</h1></div>`,
    operaciones: () => `<h1>Operaciones</h1><p style="padding:20px;">Panel de control en desarrollo.</p>`
};

// --- NAVEGACIÓN ---
const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

function navigate(pageId) {
    navItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-page') === pageId));
    mainContent.innerHTML = pages[pageId]();
    if (window.lucide) lucide.createIcons();
}

// --- ACCIONES ---

window.handleSyncClick = (id) => {
    const prop = state.properties.find(p => p.id === id);
    const url = prompt("Enlace de Airbnb (iCal):", prop.icalUrl || "");
    if (url) {
        prop.icalUrl = url;
        saveState();
        syncAirbnb(id, url);
    }
};

window.editProperty = (id) => {
    const p = state.properties.find(prop => prop.id === id);
    const newName = prompt("Nombre del Aparatamento:", p.name);
    const newLoc = prompt("Ubicación:", p.location);
    const newPrice = prompt("Precio por noche (€):", p.price);
    const newImg = prompt("URL de la foto:", p.img);

    if (newName) p.name = newName;
    if (newLoc) p.location = newLoc;
    if (newPrice) p.price = parseInt(newPrice);
    if (newImg) p.img = newImg;

    saveState();
    navigate('apartamentos');
};

async function syncAirbnb(propId, url, silent = false) {
    const prop = state.properties.find(p => p.id === propId);
    if (!silent) alert(`Sincronizando ${prop.name}...`);

    try {
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url.trim())}`;
        const response = await fetch(proxyUrl);
        const text = await response.text();

        if (!text.includes("BEGIN:VCALENDAR")) return;

        state.bookings = state.bookings.filter(b => !(b.propId === propId && b.channel === 'airbnb'));
        const events = text.split("BEGIN:VEVENT");
        events.shift();

        events.forEach(event => {
            const start = event.match(/DTSTART[:;](?:VALUE=DATE:)?(\d{8})/);
            const end = event.match(/DTEND[:;](?:VALUE=DATE:)?(\d{8})/);
            if (start && end) {
                const s = start[1];
                const e = end[1];
                const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                state.bookings.push({
                    propId: propId,
                    propName: prop.name,
                    checkin: `${s.substring(6, 8)} ${months[parseInt(s.substring(4, 6)) - 1]}`,
                    checkout: `${e.substring(6, 8)} ${months[parseInt(e.substring(4, 6)) - 1]}`,
                    channel: 'airbnb'
                });
            }
        });

        saveState();
        if (!silent) {
            alert("✓ Actualizado");
            navigate('dashboard');
        }
    } catch (e) {
        if (!silent) alert("Error de conexión");
    }
}

// Iniciar
navItems.forEach(item => item.addEventListener('click', () => navigate(item.getAttribute('data-page'))));
checkAutoSync(); // Ejecuta auto-sync al abrir
navigate('dashboard');