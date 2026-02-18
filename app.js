/**
 * CMPabloyElena - Channel Manager
 * State Management & Functional Logic
 * 
 * Note: UI/HTML structure is kept EXACTLY as provided, 
 * but now driven by a persistent state object.
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
                    <span class="date-range-val" id="calDateRangeDisplay">12 oct — 19 oct, 2023</span>
                    <input type="date" id="calHiddenPicker" style="position:absolute; opacity:0; pointer-events:none;">
                </div>
                <div class="cal-trigger-btn" id="calTriggerBtn" style="cursor:pointer;">
                    <i data-lucide="calendar" style="width:22px;"></i>
                </div>
            </div>
        </div>

        <div class="cal-container fade-in">
            <div class="cal-header-row">
                <div id="calendar-corner-label" class="cal-corner" style="display:flex; align-items:center; justify-content:center; font-weight:800; color:#64748b; font-size:0.65rem; text-transform:uppercase; letter-spacing:1px;">Oct</div>
                <div class="cal-days-header" id="calDaysHeader">
                    <div class="cal-day-label"><span>LUN</span><span class="cal-day-num">12</span></div>
                    <div class="cal-day-label"><span>MAR</span><span class="cal-day-num">13</span></div>
                    <div class="cal-day-label" id="today-col"><span>MIE</span><span class="cal-day-num">14</span></div>
                    <div class="cal-day-label"><span> JUE</span><span class="cal-day-num">15</span></div>
                    <div class="cal-day-label"><span>VIE</span><span class="cal-day-num">16</span></div>
                </div>
            </div>

            ${state.properties.map(p => `
            <div class="cal-row">
                <div class="cal-property-info clickable-prop" data-prop="${p.id}">
                    <img src="${p.img}" class="cal-thumb">
                    <div class="cal-prop-name">${p.name}</div>
                </div>
                <div class="cal-cells">
                    <div class="cal-cell"></div><div class="cal-cell"></div><div class="cal-cell"></div><div class="cal-cell"></div><div class="cal-cell"></div>
                    ${state.bookings.filter(b => b.propId === p.id).map(b => {
        const startMap = { '12 Oct': 10, '13 Oct': 55, '14 Oct': 250, '16 Oct': 380 };
        const widthMap = { 2: 220, 3: 300, 3.5: 280, 2.5: 200 };
        return `
                        <div class="booking-pill booking-${b.channel} clickable-booking" 
                             data-guest="${b.guest}" data-prop="${b.propName}" data-checkin="${b.checkin}" data-checkout="${b.checkout}" data-total="${b.total}" 
                             style="left:${startMap[b.checkin] || 10}px; width:${widthMap[2] || 220}px;">${b.guest}</div>
                        `;
    }).join('')}
                </div>
            </div>
            `).join('')}

            <div class="cal-legend">
                <div class="legend-item"><span class="dot dot-blue"></span> AIRBNB</div>
                <div class="legend-item"><span class="dot dot-grey"></span> BOOKING</div>
                <div class="legend-item"><span class="dot dot-yellow"></span> DIRECTO</div>
            </div>
        </div>

        <div id="detail-panel" class="detail-panel hidden-panel fade-in">
            <div class="panel-placeholder">Toca una reserva para ver detalles</div>
        </div>

        <div class="fab">
            <i data-lucide="plus" style="color:white; width:28px;"></i>
        </div>
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
                <div class="micro-stats">
                    <div class="stat-badge-glass"><i data-lucide="percent" style="width:10px;"></i> ${p.occ}%</div>
                    <div class="stat-badge-glass"><i data-lucide="euro" style="width:10px;"></i> ${p.rev}k</div>
                </div>
                <div class="quick-actions-overlay">
                    <div class="action-btn-glass" onclick="handleQuickAction('${p.id}', 'tag')"><i data-lucide="tag" style="width:16px;"></i></div>
                    <div class="action-btn-glass" onclick="handleQuickAction('${p.id}', 'lock')"><i data-lucide="lock" style="width:16px;"></i></div>
                    <div class="action-btn-glass" onclick="handleQuickAction('${p.id}', 'refresh')"><i data-lucide="refresh-cw" style="width:16px;"></i></div>
                </div>
            </div>
            <div class="prop-details-premium">
                <div class="prop-main-info">
                    <h3>${p.name}</h3>
                    <div class="prop-location"><i data-lucide="map-pin" style="width:12px;"></i> ${p.location}</div>
                </div>
                <div class="prop-price-tag">
                    <span class="price-val">${p.price}€</span>
                    <span class="price-unit">por noche</span>
                </div>
            </div>
        </div>
        `).join('')}
    `,

    ingresos: () => `
        <div class="revenue-filters">
            <div class="filter-row">
                <div class="custom-select">
                    <i data-lucide="home" class="select-icon"></i>
                    <select id="aptFilter">
                        <option value="all">Todos los Apartamentos</option>
                        ${state.properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>
                </div>
                <div class="custom-select">
                    <i data-lucide="calendar" class="select-icon"></i>
                    <select id="periodFilter">
                        <option value="this-month">Este Mes</option>
                        <option value="last-month">Mes Anterior</option>
                        <option value="year">Todo el Año</option>
                        <option value="custom">Personalizado...</option>
                    </select>
                </div>
            </div>
            <div id="customDateRange" class="custom-range-row hidden">
                <input type="date" id="startDate" class="date-input">
                <span>a</span>
                <input type="date" id="endDate" class="date-input">
            </div>
        </div>

        <div class="revenue-hero fade-in">
            <p class="revenue-label" id="currentPeriodLabel">Ingresos Netos (Febrero)</p>
            <h1 class="revenue-value" id="mainRevenueValue">2.450,00 €</h1>
            <div class="revenue-change">
                <i data-lucide="trending-up" style="width:14px; height:14px;"></i>
                <span id="revenueComparison">+12.4% vs mes anterior</span>
            </div>
        </div>

        <div class="card chart-card">
            <h3 class="section-title">Rendimiento Mensual</h3>
            <div class="chart-container" style="height:220px;">
                <canvas id="revenueBarChart"></canvas>
            </div>
        </div>

        <div class="card">
            <h3 class="section-title">Eficiencia de Margen</h3>
            <div class="margin-viz">
                <div class="margin-bar">
                    <div class="bar-net" style="width: 88%;"></div>
                    <div class="bar-tax" style="width: 12%;"></div>
                </div>
                <div class="margin-labels">
                    <div class="label-group">
                        <span class="stat-label">Neto Real (88%)</span>
                        <span class="label-val" id="netValue">2.156 €</span>
                    </div>
                    <div class="label-group" style="text-align:right;">
                        <span class="stat-label">Comisiones</span>
                        <span class="label-val" id="taxValue">294 €</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="card" style="padding-right:0;">
            <h3 class="section-title" style="padding-right:20px;">Línea de Pagos (Payouts)</h3>
            <div class="timeline-scroll">
                <div class="payout-card">
                    <p class="payout-date">24 FEB</p>
                    <p class="payout-amount">840 €</p>
                    <div class="payout-channel">
                        <div class="channel-icon" style="background:#ff385c;"></div>
                        <span>Airbnb</span>
                    </div>
                </div>
                <div class="payout-card">
                    <p class="payout-date">26 FEB</p>
                    <p class="payout-amount">1.120 €</p>
                    <div class="payout-channel">
                        <div class="channel-icon" style="background:#003580;"></div>
                        <span>Booking.com</span>
                    </div>
                </div>
                <div class="payout-card">
                    <p class="payout-date">02 MAR</p>
                    <p class="payout-amount">490 €</p>
                    <div class="payout-channel">
                        <div class="channel-icon" style="background:var(--accent-gold);"></div>
                        <span>Directo</span>
                    </div>
                </div>
            </div>
        </div>
    `,

    operaciones: () => `
        <div class="cal-page-header fade-in">
            <span class="app-subtitle-tiny">CENTRO DE CONTROL</span>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h1>Operaciones</h1>
                <div class="custom-select-mini">
                    <select id="opAptFilter">
                        <option value="all">Filtro: Todos</option>
                        ${state.properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>

        <div class="section-title fade-in" style="margin-top:0;">
            <h2 style="font-size:1.1rem; color:#f1f5f9;">Cerraduras Inteligentes</h2>
            <div class="badge-status-online">
                <span class="dot-online"></span> Todo Seguro
            </div>
        </div>

        <div class="locks-grid fade-in" id="locksGrid">
            ${state.locks.map(l => `
            <div class="lock-card premium-card" data-apt="${l.id}">
                <div class="lock-header">
                    <div class="lock-info">
                        <h3>${l.name}</h3>
                        <span class="battery-status" style="${l.battery < 50 ? 'color:#f59e0b;' : ''}"><i data-lucide="${l.battery > 50 ? 'battery-full' : 'battery-medium'}" style="width:12px;"></i> ${l.battery}%</span>
                    </div>
                    <button class="lock-toggle ${l.locked ? 'locked' : 'unlocked'}" onclick="handleLockToggle('${l.id}')">
                        <i data-lucide="lock" class="lock-icon"></i>
                        <i data-lucide="unlock" class="unlock-icon"></i>
                    </button>
                </div>
                <div class="lock-footer" style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="lock-last">${l.lastAccess}</span>
                    <button class="btn-tiny-glass" onclick="showAccessModal('${l.name}')">Acceso</button>
                </div>
            </div>
            `).join('')}
        </div>

        <div class="section-title fade-in" style="margin-top:25px;">
            <h2 style="font-size:1.1rem; color:#f1f5f9;">Tareas de Mantenimiento</h2>
            <button class="btn-add-task" onclick="addNewTaskPrompt()">
                <i data-lucide="plus" style="width:14px;"></i>
            </button>
        </div>

        <div class="task-list fade-in" id="opTaskList">
            ${state.tasks.map(t => `
            <div class="task-item premium-card" data-apt="${t.propId}">
                <div class="task-check-wrapper">
                    <label class="container-check">
                      <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTaskCompletion(${t.id})">
                      <span class="checkmark"></span>
                    </label>
                </div>
                <div class="task-body">
                    <div class="task-title" style="${t.completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">${t.title}</div>
                    <div class="task-meta">${t.propName} • ${t.meta}</div>
                </div>
                <div class="task-tag tag-${t.cat}">${t.cat.toUpperCase()}</div>
            </div>
            `).join('')}
        </div>
    `
};

// --- CORE LOGIC ---

const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');
let currentActivePage = 'dashboard';

function navigate(pageId) {
    currentActivePage = pageId;
    navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === pageId);
    });

    mainContent.innerHTML = pages[pageId]();
    lucide.createIcons();
    window.scrollTo(0, 0);

    if (pageId === 'ingresos') initRevenueFeatures();
    if (pageId === 'dashboard') setupDashboardFilters();
    if (pageId === 'calendario') setupCalendarFeatures();
    if (pageId === 'operaciones') setupOperacionesFilters();
}

// Initial Navigation
navigate(currentActivePage);

// --- FEATURE INITIALIZERS ---

function setupDashboardFilters() {
    const filters = document.querySelectorAll('.filter-group .filter-btn');
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            simulateStatUpdate();
        });
    });
}

function simulateStatUpdate() {
    const occ = document.getElementById('stat-occ');
    const rev = document.getElementById('stat-rev');
    const res = document.getElementById('stat-res');
    if (occ) {
        occ.style.opacity = '0.4';
        setTimeout(() => {
            occ.innerText = (Math.floor(Math.random() * 30) + 60) + '%';
            rev.innerText = (Math.random() * 5 + 1).toFixed(1) + 'k€';
            res.innerText = Math.floor(Math.random() * 10) + 2;
            occ.style.opacity = '1';
        }, 300);
    }
}

function setupCalendarFeatures() {
    const toggles = document.querySelectorAll('.view-toggle-premium .toggle-btn-p');
    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            toggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateCalendarGrid(view);
            setupCalendarInteractions();
        });
    });

    setupCalendarInteractions();

    const todayCol = document.getElementById('today-col');
    if (todayCol) todayCol.classList.add('active-day');

    const trigger = document.getElementById('calTriggerBtn');
    const picker = document.getElementById('calHiddenPicker');
    const display = document.getElementById('calDateRangeDisplay');

    trigger?.addEventListener('click', () => picker.showPicker());

    picker?.addEventListener('change', (e) => {
        const date = new Date(e.target.value);
        display.innerText = `${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — Siguiente semana`;
        const container = document.querySelector('.cal-container');
        container.style.opacity = '0.3';
        setTimeout(() => {
            container.style.opacity = '1';
            document.querySelectorAll('.booking-pill').forEach(pill => {
                pill.style.left = Math.floor(Math.random() * 300) + 'px';
            });
        }, 400);
    });
}

function updateCalendarGrid(view) {
    const daysHeader = document.querySelector('.cal-days-header');
    if (!daysHeader) return;

    if (view === 'month') {
        let monthHtml = '';
        for (let i = 1; i <= 30; i++) monthHtml += `<div class="cal-day-label" style="width:40px;"><span>OCT</span><span class="cal-day-num">${i}</span></div>`;
        daysHeader.innerHTML = monthHtml;
        const rows = document.querySelectorAll('.cal-cells');
        rows.forEach((row, idx) => {
            let cellsHtml = '';
            for (let i = 0; i < 30; i++) cellsHtml += '<div class="cal-cell" style="width:40px;"></div>';
            row.innerHTML = cellsHtml;
            if (idx === 0) row.innerHTML += `<div class="booking-pill booking-airbnb clickable-booking" data-guest="Mateo García" style="left:40px; width:320px;">Mateo García</div>`;
        });
    } else {
        navigate('calendario');
    }
}

function setupCalendarInteractions() {
    const detailPanel = document.getElementById('detail-panel');
    if (!detailPanel) return;

    document.querySelectorAll('.clickable-booking').forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            const data = pill.dataset;
            detailPanel.classList.remove('hidden-panel');
            detailPanel.innerHTML = `
                <div class="summary-card fade-in">
                    <div class="summary-header"><span class="summary-title">Reserva: ${data.guest}</span><span class="badge badge-green">Confirmada</span></div>
                    <div class="summary-body">
                        <div class="summary-item"><span class="summary-label">Alojamiento</span><span class="summary-val">${data.prop}</span></div>
                        <div class="summary-item"><span class="summary-label">Entrada</span><span class="summary-val">${data.checkin}</span></div>
                        <div class="summary-item"><span class="summary-label">Salida</span><span class="summary-val">${data.checkout}</span></div>
                        <div class="summary-item"><span class="summary-label">Total</span><span class="summary-val" style="color:var(--accent-green);">${data.total}</span></div>
                    </div>
                </div>`;
            lucide.createIcons();
        });
    });

    document.querySelectorAll('.clickable-prop').forEach(prop => {
        prop.addEventListener('click', () => {
            const propName = prop.querySelector('.cal-prop-name').innerText;
            detailPanel.classList.remove('hidden-panel');
            detailPanel.innerHTML = `
                <div class="summary-card fade-in">
                    <div class="summary-header"><span class="summary-title">Próximas Reservas: ${propName}</span></div>
                    <div class="summary-list">
                        <div class="summary-list-item"><div><span style="font-weight:700;">Laura P.</span><br><span style="font-size:0.65rem;">22 Feb - 25 Feb • Airbnb</span></div><span style="font-weight:700; color:var(--accent-green);">450€</span></div>
                        <div class="summary-list-item"><div><span style="font-weight:700;">Marcos R.</span><br><span style="font-size:0.65rem;">01 Mar - 05 Mar • Directo</span></div><span style="font-weight:700; color:var(--accent-green);">620€</span></div>
                    </div>
                </div>`;
            lucide.createIcons();
        });
    });
}

function setupOperacionesFilters() {
    document.getElementById('opAptFilter')?.addEventListener('change', (e) => {
        const val = e.target.value;
        document.querySelectorAll('.lock-card').forEach(l => l.style.display = (val === 'all' || l.dataset.apt === val) ? 'flex' : 'none');
        document.querySelectorAll('.task-item').forEach(t => t.style.display = (val === 'all' || t.dataset.apt === val) ? 'flex' : 'none');
    });
}

function initRevenueFeatures() {
    const ctx = document.getElementById('revenueBarChart')?.getContext('2d');
    if (!ctx) return;
    if (window.revenueChartInstance) window.revenueChartInstance.destroy();

    window.revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'],
            datasets: [{
                data: [1800, 2200, 1950, 3100, 2400, 2450],
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 1, borderRadius: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
        }
    });

    document.getElementById('aptFilter')?.addEventListener('change', simulateRevenueUpdate);
    document.getElementById('periodFilter')?.addEventListener('change', (e) => {
        document.getElementById('customDateRange')?.classList.toggle('hidden', e.target.value !== 'custom');
        simulateRevenueUpdate();
    });
}

function simulateRevenueUpdate() {
    const valEl = document.getElementById('mainRevenueValue');
    if (valEl) {
        valEl.style.opacity = '0.4';
        setTimeout(() => {
            valEl.innerText = (Math.random() * 5000 + 1000).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €';
            valEl.style.opacity = '1';
            window.revenueChartInstance.data.datasets[0].data = window.revenueChartInstance.data.datasets[0].data.map(() => Math.random() * 3000 + 500);
            window.revenueChartInstance.update();
        }, 300);
    }
}

// --- GLOBAL ACTIONS ---

window.handleLockToggle = (lockId) => {
    const lock = state.locks.find(l => l.id === lockId);
    if (lock) {
        lock.locked = !lock.locked;
        lock.lastAccess = 'Acción Remota • Ahora';
        saveState();
        navigate(currentActivePage);
    }
};

window.handleQuickAction = (id, action) => {
    if (action === 'lock') {
        window.handleLockToggle(id);
    } else if (action === 'refresh') {
        navigate('apartamentos');
        alert('Datos actualizados');
    } else {
        alert('Acción en desarrollo');
    }
};

window.toggleTaskCompletion = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.statusText = task.completed ? 'COMPLETADA' : 'PENDIENTE';
        saveState();
        navigate(currentActivePage);
    }
};

window.showAccessModal = (aptName) => {
    const overlay = document.getElementById('opModalOverlay');
    const body = document.getElementById('modalBody');
    overlay.classList.remove('hidden');
    body.innerHTML = `
        <h2 style="font-size:1.2rem; margin-bottom:10px; color:#f8fafc;">Gestionar Acceso</h2>
        <p style="font-size:0.75rem; color:#94a3b8; margin-bottom:20px;">${aptName}</p>
        <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="premium-card" style="padding:12px; background:rgba(16,185,129,0.05); border-color:rgba(16,185,129,0.2);">
                <span style="font-size:0.6rem; color:#10b981; font-weight:700;">DIGITAL KEY ACTIVA</span>
                <div style="font-size:0.9rem; font-weight:700; margin:4px 0; color:#f1f5f9;">Huésped Actual</div>
            </div>
            <button class="toggle-btn-p active" style="width:100%; border-radius:12px;" onclick="closeOpModal()">GENERAR CÓDIGO</button>
        </div>`;
};

window.closeOpModal = () => document.getElementById('opModalOverlay').classList.add('hidden');

window.addNewTaskPrompt = () => {
    const overlay = document.getElementById('opModalOverlay');
    const body = document.getElementById('modalBody');
    overlay.classList.remove('hidden');
    body.innerHTML = `
        <h2 style="font-size:1.2rem; margin-bottom:15px; color:#f8fafc;">Nueva Tarea</h2>
        <div style="display:flex; flex-direction:column; gap:15px;">
            <select id="newTaskApt" style="width:100%; height:40px; border-radius:8px; background:#1e293b; color:white;">
                ${state.properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
            <input type="text" id="newTaskName" placeholder="Descripción..." style="width:100%; padding:10px; background:#1e293b; color:white; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <button class="cat-sel-btn active" data-cat="cleaning" onclick="window.currentCat='cleaning'; document.querySelectorAll('.cat-sel-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">LIMPIEZA</button>
                <button class="cat-sel-btn" data-cat="maintenance" onclick="window.currentCat='maintenance'; document.querySelectorAll('.cat-sel-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">MANTENIMIENTO</button>
            </div>
            <button onclick="confirmAddTask()" class="toggle-btn-p active" style="width:100%; border-radius:12px;">CREAR TAREA</button>
        </div>`;
    window.currentCat = 'cleaning';
};

window.confirmAddTask = () => {
    const name = document.getElementById('newTaskName').value;
    const aptId = document.getElementById('newTaskApt').value;
    const prop = state.properties.find(p => p.id === aptId);
    if (!name) return;
    state.tasks.unshift({ id: Date.now(), title: name, propId: aptId, propName: prop.name, meta: 'Ahora mismo', cat: window.currentCat, completed: false, statusText: 'PENDIENTE' });
    saveState();
    closeOpModal();
    navigate('operaciones');
};

window.addNewPropertyPrompt = () => {
    const overlay = document.getElementById('opModalOverlay');
    const body = document.getElementById('modalBody');
    overlay.classList.remove('hidden');
    body.innerHTML = `
        <h2 style="font-size:1.2rem; margin-bottom:15px; color:#f8fafc;">Nueva Propiedad</h2>
        <div style="display:flex; flex-direction:column; gap:12px;">
            <input type="text" id="newPropName" placeholder="Nombre (ej: Ático Retiro)" style="width:100%; padding:10px; background:#1e293b; color:white; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <input type="text" id="newPropLoc" placeholder="Ubicación (ej: Madrid, España)" style="width:100%; padding:10px; background:#1e293b; color:white; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <input type="number" id="newPropPrice" placeholder="Precio por noche (€)" style="width:100%; padding:10px; background:#1e293b; color:white; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <button onclick="confirmAddProperty()" class="toggle-btn-p active" style="width:100%; border-radius:12px; margin-top:10px;">AÑADIR PROPIEDAD</button>
        </div>`;
};

window.confirmAddProperty = () => {
    const name = document.getElementById('newPropName').value;
    const loc = document.getElementById('newPropLoc').value;
    const price = document.getElementById('newPropPrice').value;
    if (!name || !loc || !price) return;
    const id = name.toLowerCase().replace(/\s/g, '');
    state.properties.push({ id: id, name: name, location: loc, price: parseInt(price), img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800', status: 'Listo / Disponible', occ: 0, rev: 0, glow: 'green' });
    state.locks.push({ id: id, name: name, locked: true, battery: 100, lastAccess: 'Instalada ahora' });
    saveState();
    closeOpModal();
    navigate('apartamentos');
};

// Nav Listeners
navItems.forEach(item => item.addEventListener('click', () => navigate(item.getAttribute('data-page'))));
