/**
 * CMPabloyElena - Channel Manager Profesional
 * Sincronización Blindada v4
 */

const DEFAULT_STATE = {
    properties: [
        { id: 'atico', name: 'Penthouse Madrid', location: 'Madrid, España', price: 145, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800', status: 'Listo / Disponible', occ: 85, rev: 1.2, glow: 'green' },
        { id: 'loft', name: 'Loft Gran Vía', location: 'Madrid, España', price: 110, img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800', status: 'Ocupado (Check-out Mañana)', occ: 92, rev: 0.9, glow: 'blue' },
        { id: 'villa', name: 'Villa Elena', location: 'Marbella, España', price: 450, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800', status: 'Check-out Hoy', occ: 70, rev: 2.4, glow: 'amber' }
    ],
    bookings: [],
    tasks: [],
    locks: []
};

let state = JSON.parse(localStorage.getItem('cm_state_v3')) || DEFAULT_STATE;

function saveState() {
    localStorage.setItem('cm_state_v3', JSON.stringify(state));
}

const pages = {
    dashboard: () => {
        const airbnbBookings = state.bookings.filter(b => b.channel === 'airbnb');
        return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value">${airbnbBookings.length}</span>
                <span class="stat-label">Reservas Airbnb</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${state.properties.length}</span>
                <span class="stat-label">Propiedades</span>
            </div>
        </div>
        <div class="card" style="margin-top:20px;">
            <h3 class="section-title">Próximas Reservas Sincronizadas</h3>
            <div class="activity-list">
                ${airbnbBookings.length > 0 ? airbnbBookings.map(b => `
                    <div class="activity-item">
                        <div class="status-dot status-green"></div>
                        <div class="activity-info">
                            <h4>Huésped Airbnb</h4>
                            <p>${b.checkin} - ${b.checkout}</p>
                        </div>
                    </div>
                `).join('') : '<p style="padding:20px; opacity:0.5;">No hay reservas sincronizadas aún. Ve a Apartamentos y dale a refrescar.</p>'}
            </div>
        </div>
        `;
    },

    apartamentos: () => `
        <div class="section-title"><h2>Gestión de Propiedades</h2></div>
        ${state.properties.map(p => `
        <div class="property-card-premium property-glow-green fade-in">
            <div class="prop-img-container">
                <img src="${p.img}" class="prop-img-premium">
                <div class="quick-actions-overlay">
                    <div class="action-btn-glass" title="Sincronizar Airbnb" onclick="handleSyncClick('${p.id}')">
                        <i data-lucide="refresh-cw"></i>
                    </div>
                </div>
            </div>
            <div class="prop-details-premium">
                <h3>${p.name}</h3>
                <p>${p.location}</p>
            </div>
        </div>
        `).join('')}
    `,

    calendario: () => `
        <div class="cal-page-header"><h1>Calendario</h1></div>
        <div class="cal-container">
            ${state.bookings.map(b => `
                <div class="booking-pill booking-airbnb" style="margin-bottom:10px; position:relative;">
                    ${b.propName}: ${b.checkin} - ${b.checkout}
                </div>
            `).join('')}
            ${state.bookings.length === 0 ? '<p style="text-align:center; padding:50px; opacity:0.5;">Calendario vacío</p>' : ''}
        </div>
    `,
    ingresos: () => `<h1>Ingresos</h1>`,
    operaciones: () => `<h1>Operaciones</h1>`
};

const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

function navigate(pageId) {
    navItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-page') === pageId));
    mainContent.innerHTML = pages[pageId]();
    if (window.lucide) lucide.createIcons();
}

window.handleSyncClick = (id) => {
    const url = prompt("Pega tu enlace de Airbnb aquí:");
    if (url) syncAirbnb(id, url);
};

async function syncAirbnb(propId, url) {
    const prop = state.properties.find(p => p.id === propId);
    alert("Iniciando sincronización blindada... Espera unos segundos.");

    try {
        // Usamos un proxy que NO falla con Airbnb
        const finalUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url.trim())}`;
        const response = await fetch(finalUrl);
        const text = await response.text();

        if (!text.includes("BEGIN:VCALENDAR")) {
            throw new Error("Formato no válido");
        }

        // Borrar antiguas de este apto
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
        alert("¡ÉXITO! Reservas cargadas correctamente.");
        location.reload(); // Recarga para asegurar que todo se ve bien
    } catch (e) {
        alert("Error de conexión. Asegúrate de tener internet y usar el enlace correcto.");
    }
}

navItems.forEach(item => item.addEventListener('click', () => navigate(item.getAttribute('data-page'))));
navigate('dashboard');