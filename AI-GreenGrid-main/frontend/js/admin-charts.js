// Common Chart Configuration
Chart.defaults.color = '#a0a0c0';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

// 1. Energy Forecasting vs Demand Chart
const ctxForecast = document.getElementById('forecastChart');
if (ctxForecast) {
    new Chart(ctxForecast, {
        type: 'line',
        data: {
            labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            datasets: [{
                label: 'Renewable Forecast (GW)',
                data: [30, 28, 25, 35, 45, 55, 65, 60, 50, 40, 35, 32],
                borderColor: '#00f2ff',
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Projected Demand (GW)',
                data: [20, 18, 15, 25, 40, 45, 50, 48, 55, 65, 55, 40],
                borderColor: '#7000ff',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// 2. Dynamic Pricing Chart
const ctxPricing = document.getElementById('pricingChart');
if (ctxPricing) {
    new Chart(ctxPricing, {
        type: 'line',
        data: {
            labels: ['10m ago', '8m ago', '6m ago', '4m ago', '2m ago', 'Now'],
            datasets: [{
                label: 'Price per kWh ($)',
                data: [0.12, 0.11, 0.15, 0.14, 0.18, 0.20],
                borderColor: '#ff8a00',
                backgroundColor: 'rgba(255, 138, 0, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

// 3. Renewable Source Mix
const ctxMix = document.getElementById('mixChart');
if (ctxMix) {
    new Chart(ctxMix, {
        type: 'doughnut',
        data: {
            labels: ['Solar', 'Wind', 'Hydro', 'Storage'],
            datasets: [{
                data: [40, 35, 15, 10],
                backgroundColor: [
                    '#ffd700',
                    '#00f2ff',
                    '#0066ff',
                    '#7000ff'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}
