/**
 * CMPabloyElena - Channel Manager
 * State Management & Functional Logic
 */

// --- INITIAL STATE ---
const DEFAULT_STATE = {
    properties: [
        { id: 'atico', name: 'Penthouse Madrid', location: 'Madrid, España', price: 145, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800', status: 'Listo / Disponible', occ: 85, rev: 1.2, glow: 'green' },
        { id: 'loft', name: 'Loft Gran Vía', location: 'Madrid, España', price: 110, img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800', status: 'Ocupado (Check-out Mañana)', occ: 92, rev: 0.9, glow: 'blue' },
        { id: 'villa', name: 'Villa Elena', location: 'Marbella, España', price: 450, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800', status: 'Check-out Hoy', occ: 70, rev: 2.4, glow: 'amber' },
        { id: 'chalet', name: 'Chalet Alpine', location: 'Sierra Nevada, España', price: 300, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800', status: 'Mantenimiento', occ: 60, rev: 1.8, glow: 'grey' }
    ],
    bookings: [
        { id: 1, guest: 'Mateo García', propId: 'atico', propName: 'Penthouse Madrid', checkin: '12 Oct', checkout: '14 Oct', total: '850€', channel: 'airbnb', status: 'Llegada' },
        { id: 2, guest: 'Fam. Rodríguez', propId: 'villa', propName: 'Villa Elena', checkin: '14 Oct', checkout: '17 Oct', total: '1.420€', channel: 'booking', status: 'Check-in' },
        { id: 3, guest: 'Lucía Fernández', propId: 'villa', propName: 'Villa Elena', checkin: '14 Oct', checkout: '18 Oct', total: '920€', channel: 'direct', status: 'Llegada' },
        { id: 4, guest: 'Carlos Ruiz', propId: 'loft', propName: 'Loft Gran Vía', checkin: '10 Oct', checkout: '14 Oct', total: '440€', channel: 'booking', status: 'Salida' },
        { id: 5, guest: 'Dr. Aris K.', propId: 'chalet', propName: 'Chalet Alpine', checkin: '16 Oct', checkout: '18 Oct', total: '1.120€', channel: 'airbnb', status: 'Futura' }
    ],
    tasks: [
        { id: 1, title: 'Limpieza Profunda', propId: 'loft', propName: 'Loft Gran Vía', meta: 'Hoy, 11:00', cat: 'cleaning', completed: true, statusText: 'COMPLETADA' },
        { id: 2, title: 'Reparar Grifo Cocina', propId: 'villa', propName: 'Villa Elena', meta: 'Mañana', cat: 'maintenance', completed: false, statusText: 'PENDIENTE' },
        { id: 3, title: 'Kit de Bienvenida', propId: 'atico', propName: 'Penthouse Madrid', meta: 'Mañana', cat: 'operational', completed: false, statusText: 'EN PROCESO' }
    ],
    locks: [
        { id: 'atico', name: 'Penthouse Madrid', locked: false, battery: 92, lastAccess: 'Mateo G. • Hoy 10:45' },
        { id: 'villa', name: 'Villa Elena', locked: true, battery: 45, lastAccess: 'Limpieza • Ayer 16:20' }
    ]
};

let state = JSON.parse(localStorage.getItem('cm_state_v3')) || DEFAULT_STATE;

function saveState() {
    localStorage.setItem('cm_state_v3', JSON.stringify(state));
}

// --- RENDERING TEMPLATES ---
const pages = {
    dashboard: () => {
        const arrivals = state.bookings.filter(b => b.status === 'Llegada');
        const departures = state.bookings.filter(b => b.status === 'Salida');
        const cleanings = state.tasks.filter(t => t.cat === 'cleaning');

        return `
        <div class="filter-group">
            <button class="filter-btn active" data-period="hoy">Hoy</button>
            <button class="filter-btn" data-period="semana">Semana</button>
            <button class="filter-btn" data-period="mes">Mes</button>
            <button class="filter-btn" data-period="año">Año</button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value" id="stat-occ">${(state.properties.reduce((a, b) => a + (b.occ || 0), 0) / (state.properties.length || 1)).toFixed(0)}%</span>
                <span class="stat-label">Ocupación</span>
            </div>
            <div class="stat-card">
                <span class="stat-value" id="stat-rev">${state.properties.reduce((a, b) => a + (b.rev || 0), 0).toFixed(1)}k€</span>
                <span class="stat-label">Ingresos</span>
            </div>
            <div class="stat-card">
                <span class="stat-value" id="stat-res">${state.bookings.length}</span>
                <span class="stat-label">Reservas</span>
            </div>
        </div>

        <div class="card" style="margin-top:20px;">
            <h3 class="section-title">Calendario Semanal <a href="#" onclick="navigate('calendario')" class="section-link">Ir a Calendario</a></h3>
            <div class="mini-cal-container">
                ${state.properties.slice(0, 3).map(p => `
                <div class="mini-cal-row">
                    <span class="mini-cal-label">${p.name}</span>
                    <div class="mini-cal-days">
                        ${[1, 2, 3, 4, 5, 6, 7].map(i => {
                            const hasBooking = state.bookings.some(b => b.propId === p.id && (i < 3 || i === 5));
                            return `<div class="mini-day">${hasBooking ? `<div class="mini-booking" style="background:var(--accent-${p.glow === 'green' ? 'navy' : (p.glow === 'blue' ? 'gold' : 'slate')}); left:0; width:100%;"></div>` : ''}</div>`;
                        }).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>

        <div class="dashboard-operational-grid">
            <div class="card">
                <h3 class="section-title">Llegadas <span class="badge badge-green">${arrivals.length}</span></h3>
                <div class="activity-list">
                    ${arrivals.map(b => `
                    <div class="activity-item">
                        <div class="status-dot status-green"></div>
                        <div class="activity-info">
                            <h4>${b.guest}</h4>
                            <p>${b.propName} • 14:00 - 16:00</p>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <h3 class="section-title">Salidas <span class="badge badge-blue">${departures.length}</span></h3>
                <div class="activity-list">
                    ${departures.map(b => `
                    <div class="activity-item">
                        <div class="status-dot status-blue"></div>
                        <div class="activity-info">
                            <h4>${b.guest}</h4>
                            <p>${b.propName} • 11:00 AM</p>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="card">
            <h3 class="section-title">Limpiezas Hoy <span class="badge badge-grey">${cleanings.length}</span></h3>
            <div class="cleaning-summary">
                ${cleanings.map(t => {
                    const icon = t.completed ? 'check-circle-2' : (t.statusText === 'PENDIENTE' ? 'clock' : 'play');
                    const color = t.completed ? '#10b981' : (t.statusText === 'PENDIENTE' ? '#f59e0b' : '#3b82f6');
                    return `
                    <div class="cleaning-item">
                        <div class="cleaning-main">
                            <i data-lucide="${icon}" style="width:18px; color:${color};"></i>
                            <span>${t.propName}</span>
                        </div>
                        <span class="tag-cleaning">${t.statusText}</span>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    },

    calendario: () => `
        <div class="cal-page-header fade-in">
            <span class="app-subtitle-tiny">CMPABLOYELENA</span>
            <div class="cal-title-row">
                <h1>Calendario Global</h1>
                <div style="display:flex; gap:10px; align-items:center;">
                    <div class="view-toggle-premium">
                        <button class="toggle-btn-p active" data-view="week">SEMANA</button>
                        <button class="toggle-btn-p" data-view="month">MES</button>
                    </div>
                    <div class="settings-btn-round">
                        <i data-lucide="sliders-horizontal" style="width:20px;"></i>
                    </div>
                </div>
            </div>

            <div class="date-range-bar">
                <div class="date-range-info">
                    <span class="date-range-label">Rango de fechas</span>
                    <span class="date-range-val" id="calDateRangeDisplay">Feb — Mar, 2026</span>
                    <input type="date" id="calHiddenPicker" style="position:absolute; opacity:0; pointer-events:none;">
                </div>
                <div class="cal-trigger-btn" id="calTriggerBtn" style="cursor:pointer;">
                    <i data-lucide="calendar" style="width:22px;"></i>
                </div>
            </div>
        </div>

        <div class="cal-container fade-in">
            <div class="cal-header-row">
                <div id="calendar-corner-label" class="cal-corner">Feb</div>
                <div class="cal-days-header" id="calDaysHeader">
                    ${[1, 2, 3, 4, 5, 6, 7].map(i => `<div class="cal-day-label"><span>DÍA</span><span class="cal-day-num">${17+i}</span></div>`).join('')}
                </div>
            </div>

            ${state.properties.map(p => `
            <div class="cal-row">
                <div class="cal-property-info clickable-prop" data-prop="${p.id}">
                    <img src="${p.img}" class="cal-thumb">
                    <div class="cal-prop-name">${p.name}</div>
                </div>
                <div class="cal-cells">
                    ${[1,2,3,4,5,6,7].map(() => `<div class="cal-cell"></div>`).join('')}
                    ${state.bookings.filter(b => b.propId === p.id).map(b => {
                        return `
                        <div class="booking-pill booking-${b.channel} clickable-booking" 
                             data-guest="${b.guest}" data-prop="${b.propName}" data-checkin="${b.checkin}" data-checkout="${b.checkout}" data-total="${b.total}" 
                             style="left:${Math.floor(Math.random() * 200)}px; width:150px;">${b.guest}</div>
                        `;
                    }).join('')}
                </div>
            </div>
            `).join('')}
        </div>
        <div id="detail-panel" class="detail-panel hidden-panel fade-in"></div>
    `,

    apartamentos: () => `
        <div class="section-title">
            <h2 style="font-size:1.4rem;">Tus Propiedades</h2>
            <button class="action-btn-glass" onclick="addNewPropertyPrompt()" style="width:auto; padding:0 15px; border-radius:12px; font-size:0.75rem;">+ Nueva</button>
        </div>

        ${state.properties.map(p => `
        <div class="property-card-premium property-glow-${p.glow} fade-in">
            <div class="prop-img-container">
                <img src="${p.img}" class="prop-img-premium">
                <div class="status-indicator-full" style="background:var(--accent-${p.glow === 'green' ? 'green' : (p.glow === 'blue' ? 'navy' : (p.glow === 'amber' ? 'amber' : 'slate'))}); color:${p.glow === 'blue' ? 'white' : 'black'};">${p.status}</div>
                <div class="quick-actions-overlay">
                    <div class="action-btn-glass" onclick="handleQuickAction('${p.id}', 'lock')"><i data-lucide="lock" style="width:16px;"></i></div>
                    <div class="action-btn-glass" onclick="handleQuickAction('${p.id}', 'refresh')"><i data-lucide="refresh-cw" style="width:16px;"></i></div>
                </div>
            </div>
            <div class="prop-details-premium">
                <h3>${p.name}</h3>
                <div class="prop-location"><i data-lucide="map-pin" style="width:12px;"></i> ${p.location}</div>
                <div class="prop-price-tag">${p.price}€ / noche</div>
            </div>
        </div>
        `).join('')}
    `,

    ingresos: () => `<h1>Ingresos</h1><p>Próximamente...</p>`,
    operaciones: () => `<h1>Operaciones</h1><p>Próximamente...</p>`
};

// --- CORE LOGIC ---
const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');
let currentActivePage = 'dashboard';

function navigate(pageId) {
    currentActivePage = pageId;
    navItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-page') === pageId));
    mainContent.innerHTML = pages[pageId]();
    lucide.createIcons();
    window.scrollTo(0, 0);
    if (pageId === 'calendario') setupCalendarInteractions();
}

navigate(currentActivePage);

// --- GLOBAL ACTIONS ---
window.handleQuickAction = (id, action) => {
    if (action === 'refresh') {
        const url = prompt("Pega aquí el enlace de tu calendario de Airbnb (iCal):");
        if (url && url.startsWith('http')) syncAptWithAirbnb(id, url);
    } else {
        alert('Acción en desarrollo');
    }
};

async function syncAptWithAirbnb(propId, icalUrl) {
    const prop = state.properties.find(p => p.id === propId);
    if (!prop) return;

    alert(`Conectando con Airbnb para ${prop.name}...`);

    try {
        // Usamos corsproxy.io que es el puente estable
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(icalUrl.trim())}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Error de red");
        const icalContent = await response.text();

        if (!icalContent || !icalContent.includes('BEGIN:VCALENDAR')) {
            throw new Error("Enlace no válido");
        }

        // Limpiamos antiguas de este apto
        state.bookings = state.bookings.filter(b => !(b.propId === propId && b.channel === 'airbnb'));

        const events = icalContent.split('BEGIN:VEVENT');
        events.shift(); 

        let count = 0;
        events.forEach(event => {
            const startMatch = event.match(/DTSTART[:;](?:VALUE=DATE:)?(\d{8})/);
            const endMatch = event.match(/DTEND[:;](?:VALUE=DATE:)?(\d{8})/);
            
            if (startMatch && endMatch) {
                const s = startMatch[1];
                const e = endMatch[1];
                const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                
                state.bookings.push({
                    id: Date.now() + Math.random(),
                    guest: 'Reservado (Airbnb)',
                    propId: propId,
                    propName: prop.name,
                    checkin: `${s.substring(6, 8)} ${months[parseInt(s.substring(4, 6)) - 1]}`,
                    checkout: `${e.substring(6, 8)} ${months[parseInt(e.substring(4, 6)) - 1]}`,
                    total: 'Sincronizado',
                    channel: 'airbnb',
                    status: 'Futura'
                });
                count++;
            }
        });

        saveState();
        alert(`¡Éxito! Se han cargado ${count} reservas.`);
        navigate('dashboard');
    } catch (error) {
        alert("Error al conectar. Asegúrate de copiar el enlace de EXPORTAR de Airbnb.");
    }
}

function setupCalendarInteractions() {
    document.querySelectorAll('.clickable-booking').forEach(pill => {
        pill.addEventListener('click', () => {
            const data = pill.dataset;
            const panel = document.getElementById('detail-panel');
            panel.classList.remove('hidden-panel');
            panel.innerHTML = `
                <div class="summary-card fade-in">
                    <h3>Huésped: ${data.guest}</h3>
                    <p>Entrada: ${data.checkin}</p>
                    <p>Salida: ${data.checkout}</p>
                    <button onclick="document.getElementById('detail-panel').classList.add('hidden-panel')" class="btn-close-modal">Cerrar</button>
                </div>`;
        });
    });
}

navItems.forEach(item => item.addEventListener('click', () => navigate(item.getAttribute('data-page'))));