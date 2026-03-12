const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

// --- APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(require('path').join(__dirname, '../frontend')));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- ML SERVICE URL ---
const ML_API = 'http://localhost:8000';

// Helper: call the FastAPI ML service
async function callML(endpoint, body) {
    try {
        const res = await fetch(`${ML_API}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (e) {
        console.warn(`[ML] ${endpoint} unreachable, using fallback:`, e.message);
        return null;
    }
}

// --- MONGODB CONNECTION ---
const MONGODB_URI = 'mongodb+srv://kushalkarri1117_db_user:U0cHN82tHxzPY8sX@cluster0.kkgckgm.mongodb.net/ai_greengrid?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI).then(() => {
    console.log('[AI GreenGrid] Connected to MongoDB Cloud (New Cluster)');
}).catch((err) => {
    console.error('[Database Error]', err.message);
    console.warn('[Database] Check Atlas IP whitelist for IP: 112.133.220.139');
});
// Riverside
// --- 7 SCHEMAS ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    responsibilityScore: { type: Number, default: 750 },
    impact: { carbonSavedKg: { type: Number, default: 0 }, waterConservedL: { type: Number, default: 0 } }
});
const User = mongoose.model('User', userSchema);

const productionSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    solarGW: Number, windGW: Number, hydroGW: Number, isHydroConserved: Boolean, source: { type: String, default: 'AI_MODEL' }
});
const EnergyProduction = mongoose.model('EnergyProduction', productionSchema);

const consumptionSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    totalDemandMW: Number, source: { type: String, default: 'AI_MODEL' }
});
const EnergyConsumption = mongoose.model('EnergyConsumption', consumptionSchema);

const predictionSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    target: String, value: Number, confidence: { type: Number, default: 0.95 }
});
const EnergyPrediction = mongoose.model('EnergyPrediction', predictionSchema);

const securityAlertSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    type: String, severity: String, message: String
});
const SecurityAlert = mongoose.model('SecurityAlert', securityAlertSchema);

const billingSchema = new mongoose.Schema({
    userId: String, estimatedAmount: Number, creditsEarned: { type: Number, default: 0 },
    consumptionSinceLastBill: Number, lastUpdate: { type: Date, default: Date.now }
});
const Billing = mongoose.model('Billing', billingSchema);

const optimizationLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    action: String, impactScore: Number, savingsDetails: String, source: { type: String, default: 'AI_MODEL' }
});
const OptimizationLog = mongoose.model('OptimizationLog', optimizationLogSchema);

// --- 8 & 9: SMART METER SCHEMAS ---
const smartMeterSchema = new mongoose.Schema({
    meterId: { type: String, required: true, unique: true },
    location: String,
    avgDailyUsage: { type: Number, default: 150 }, // in kWh equivalent units for sim
    historicalPattern: [Number], // 24-hour pattern
    riskScore: { type: Number, default: 0 },
    lastStatus: { type: String, default: 'Normal' }
});
const SmartMeter = mongoose.model('SmartMeter', smartMeterSchema);

const meterReadingSchema = new mongoose.Schema({
    meterId: String,
    timestamp: { type: Date, default: Date.now },
    consumption: Number,
    expectedConsumption: Number,
    anomalyScore: Number
});
const MeterReading = mongoose.model('MeterReading', meterReadingSchema);

// --- GRID STATE & OVERRIDES ---
let manualOverrides = {
    solar: null, wind: null, hydro: null, demand: null,
    solar_capacity: 0,   // kW
    solar_irradiance: null,
    wind_capacity: 500,
    wind_speed: null,
    area: 'Hyderabad',
    meters: {} // { 'SM-1001': 'theft' }
};

let gridState = {
    generation: { solar: 0, wind: 0, hydro: 0, total: 0 },
    demand: 0,
    storage: { current: 450, total: 700 },
    message: 'Initializing...',
    timestamp: Date.now(),
    gridSecurity: { suspiciousMeters: 0, totalGridLoss: 0, status: 'Secure' }
};

// Initialize Simulated Meters
async function initMeters() {
    try {
        const existing = await SmartMeter.countDocuments().maxTimeMS(5000);
        if (existing === 0) {
            const meters = [];
            for (let i = 1; i <= 10; i++) {
                meters.push({
                    meterId: `SM-${1000 + i}`,
                    location: `Zone-${Math.ceil(i/3)}`,
                    avgDailyUsage: 120 + Math.random() * 60,
                    historicalPattern: Array.from({ length: 24 }, () => 5 + Math.random() * 10)
                });
            }
            await SmartMeter.insertMany(meters);
            console.log('[AI GreenGrid] 10 Simulated Smart Meters Initialized');
        }
    } catch (e) {
        console.warn('[Database] Falling back to memory-only simulation (Smart Meters).', e.message);
    }
}
initMeters();

// --- SMART GRID ENGINE (AI-POWERED) ---
async function stepSimulation() {
    // 1. Simulate sensor inputs (weather / grid conditions)
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay() + 1; // 1-7 for your model
    const currentMonth = now.getMonth() + 1; // 1-12

    const temperature    = 20 + Math.random() * 20;
    const wind_speed     = 5 + Math.random() * 25;
    const solar_radiation = 200 + Math.random() * 800;
    const industrial_load = 300 + Math.random() * 400;
    const residential_load = 200 + Math.random() * 300;

    const demand_mw = manualOverrides.demand || 1500;
    
    // --- ADVANCED RENEWABLE CALCULATION ---
    let solarAvail = Math.floor(400 + Math.random() * 400);
    let windAvail  = Math.floor(200 + Math.random() * 400);

    // If advanced inputs are used, pull from solar-energy-api or calculate
    if (manualOverrides.solar_capacity > 0 || manualOverrides.wind_capacity > 0) {
        try {
            const api_url = `http://127.0.0.1:5001/renewable?area=${manualOverrides.area}&panel_kw=${manualOverrides.solar_capacity}&wind_kw=${manualOverrides.wind_capacity}`;
            const resp = await fetch(api_url);
            const apiRes = await resp.json();
            
            // Apply Manual Irradiance Override if set
            if (manualOverrides.solar_irradiance !== null) {
                solarAvail = (manualOverrides.solar_capacity * (manualOverrides.solar_irradiance / 1000) * 0.8);
            } else {
                solarAvail = apiRes.solar_energy / 12; // Simple daily to hourly/current approx
            }

            // Apply Manual Wind Override if set
            if (manualOverrides.wind_speed !== null) {
                const rated = 12;
                if (manualOverrides.wind_speed <= rated) {
                    windAvail = manualOverrides.wind_capacity * Math.pow(manualOverrides.wind_speed / rated, 3);
                } else {
                    windAvail = manualOverrides.wind_capacity;
                }
            } else {
                windAvail = apiRes.wind_energy / 12;
            }
        } catch (e) {
            console.error('[Solar-API] Error fetching production:', e.message);
        }
    }

    // Individual standard overrides take final priority
    if (manualOverrides.solar !== null) solarAvail = manualOverrides.solar;
    if (manualOverrides.wind !== null) windAvail = manualOverrides.wind;

    const hydroAvail = manualOverrides.hydro  !== null ? manualOverrides.hydro : 1200;
// Riverside
    // 2. Call AI Models in parallel
    const [demandResult, optResult, anomalyResult, intrusionResult] = await Promise.all([
        callML('/predict-demand', { 
            hour: currentHour, 
            temp: temperature, 
            day: currentDay, 
            month: currentMonth 
        }),
        callML('/optimize-energy', { demand: demand_mw, solar_available: solarAvail, wind_available: windAvail, hydro_available: hydroAvail }),
       callML('/detect-anomaly', { voltage: 230 + (Math.random()-0.5)*20, frequency: 50 + (Math.random()-0.5)*0.5, load: demand_mw, power_flow: demand_mw * 0.95, temperature }),
        callML('/detect-intrusion', { packet_size: Math.floor(200+Math.random()*1000), connection_duration: Math.random()*60, traffic_rate: Math.random()*100, failed_logins: Math.floor(Math.random()*3) })
    ]);

    // 3. Apply AI-derived values or fall back to simulation
    const aiDemand  = demandResult?.predicted_demand  || (1200 + Math.random() * 800);
    let solarUsed   = optResult?.solar_used  || solarAvail  * 0.7;
    let windUsed    = optResult?.wind_used   || windAvail   * 0.7;
    let hydroUsed   = optResult?.hydro_used  || 0;

    // 4. Hydropower Conservation: override hydro if solar+wind suffice
    const totalRenewable = solarUsed + windUsed;
    let strategyMsg = 'Priority: Solar/Wind Harvest (AI Decision)';
    if (totalRenewable < aiDemand) {
        const gap = aiDemand - totalRenewable;
        const fromStorage = Math.min(gridState.storage.current, gap);
        gridState.storage.current -= fromStorage;
        const remaining = gap - fromStorage;
        if (remaining > 0) {
            hydroUsed = Math.max(hydroUsed, remaining);
            strategyMsg = 'Hydro Activated as Last Resort (AI Decision)';
        } else {
            hydroUsed = 0;
            strategyMsg = 'Solar/Wind + Storage Sufficient (AI Decision)';
        }
    } else {
        hydroUsed = 0;
        const excess = totalRenewable - aiDemand;
        gridState.storage.current = Math.min(gridState.storage.total, gridState.storage.current + excess * 0.5);
        strategyMsg = 'Conserving Hydro | Excess to Storage (AI Decision)';
    }

    gridState = {
        ...gridState,
        timestamp: Date.now(),
        generation: {
            solar: Math.floor(solarUsed), wind: Math.floor(windUsed),
            hydro: Math.floor(hydroUsed), total: Math.floor(solarUsed + windUsed + hydroUsed)
        },
        demand: Math.floor(aiDemand),
        renewablePercentage: (((solarUsed + windUsed + hydroUsed) / aiDemand) * 100).toFixed(1),
        pricing: (0.10 * (aiDemand / (solarUsed + windUsed + 1))).toFixed(3),
        gridStatus: anomalyResult?.grid_status || 'stable',
        networkStatus: intrusionResult?.network_status || 'normal',
        message: strategyMsg
    };

    // 5. DB Persistence & Anomaly Detection
    try {
        await new EnergyProduction({ solarGW: (solarUsed/1000).toFixed(2), windGW: (windUsed/1000).toFixed(2), hydroGW: (hydroUsed/1000).toFixed(2), isHydroConserved: hydroUsed === 0 }).save();
        await new EnergyConsumption({ totalDemandMW: Math.floor(aiDemand) }).save();
        await new EnergyPrediction({ target: 'demand', value: aiDemand }).save();
        if (hydroUsed === 0) {
            await new OptimizationLog({ action: 'Hydro-Conservation', impactScore: 100, savingsDetails: `Water preserved: ~${(aiDemand * 0.4).toFixed(0)} gallons` }).save();
        }
        if (anomalyResult?.grid_status === 'unstable') {
            await new SecurityAlert({ type: 'anomaly', severity: 'high', message: 'AI Anomaly Detector: Grid instability detected.' }).save();
        }
        if (intrusionResult?.network_status === 'intrusion') {
            await new SecurityAlert({ type: 'intrusion', severity: 'critical', message: 'AI Intrusion Detector: Unauthorized network access detected.' }).save();
        }

        // --- NEW: Smart Meter Anomaly Logic ---
        let meters = [];
        try {
            meters = await SmartMeter.find().maxTimeMS(2000);
        } catch (e) {
            // Memory Fallback if DB is down
            for (let i = 1; i <= 10; i++) {
                meters.push({
                    meterId: `SM-${1000 + i}`,
                    historicalPattern: Array.from({ length: 24 }, () => 5 + Math.random() * 10),
                    riskScore: 0,
                    lastStatus: 'Normal'
                });
            }
        }
        let totalMeterConsumption = 0;
        const currentHour = new Date().getHours();
        const suspiciousMetersList = [];

        for (const meter of meters) {
            const expected = meter.historicalPattern[currentHour];
            let actual = expected * (0.8 + Math.random() * 0.4); // Normally +/- 20%

            // Demo Scenarios / Manual Overrides
            const meterOverride = manualOverrides.meters[meter.meterId];
            if (meterOverride === 'theft' || (meter.meterId === 'SM-1001' && !meterOverride && Math.random() > 0.95)) {
                actual *= 3.5; // Consumption Spike (Simulation)
            } else if (meterOverride === 'bypass' || (meter.meterId === 'SM-1005' && !meterOverride && Math.random() > 0.95)) {
                actual *= 0.1; // Meter Bypass Scenario
            }

            const deviation = Math.abs(actual - expected) / expected;
            const riskScore = Math.min(1, deviation / 2); // Simple rule-based risk
            
            meter.riskScore = parseFloat(riskScore.toFixed(2));
            meter.lastStatus = riskScore > 0.6 ? 'High Risk' : (riskScore > 0.3 ? 'Suspicious' : 'Normal');
            await meter.save().catch(() => {});

            totalMeterConsumption += actual;

            await new MeterReading({
                meterId: meter.meterId,
                consumption: actual,
                expectedConsumption: expected,
                anomalyScore: riskScore
            }).save().catch(() => {});

            if (riskScore > 0.3) {
                suspiciousMetersList.push({
                    meterId: meter.meterId,
                    location: meter.location || 'Zone-X',
                    riskScore: (meter.riskScore * 100).toFixed(0),
                    status: meter.lastStatus,
                    actual: actual.toFixed(2),
                    expected: expected.toFixed(2),
                    estimatedLoss: Math.abs(actual - expected).toFixed(2)
                });
                
                if (riskScore > 0.6) {
                    io.emit('anomalyAlert', {
                        meterId: meter.meterId,
                        type: 'Possible Energy Theft Detected',
                        message: `Alert: Possible energy theft at ${meter.meterId}. Pattern: ${meter.lastStatus}`,
                        severity: 'high'
                    });
                }
            }
        }

        // --- ENHANCED GRID METRICS ---
        const energyGenerated = gridState.generation.total;
        const transmissionLossRate = 0.08; // 8% technical loss
        const energyDelivered = energyGenerated * (1 - transmissionLossRate);
        const energyConsumed = totalMeterConsumption; 
        const totalLoss = energyGenerated - energyConsumed;
        const technicalLoss = energyGenerated * transmissionLossRate;
        const theftLoss = Math.max(0, totalLoss - technicalLoss);
        
        const gridStabilityScore = anomalyResult?.grid_status === 'stable' ? (95 + Math.random()*5) : (60 + Math.random()*20);

        gridState.gridSecurity = {
            suspiciousMeters: suspiciousMetersList.length,
            energyGenerated: energyGenerated.toFixed(2),
            energyDelivered: energyDelivered.toFixed(2),
            energyConsumed: energyConsumed.toFixed(2),
            totalLoss: totalLoss.toFixed(2),
            technicalLoss: technicalLoss.toFixed(2),
            theftLoss: theftLoss.toFixed(2),
            gridLossPercent: ((totalLoss / energyGenerated) * 100).toFixed(1),
            stabilityScore: gridStabilityScore.toFixed(0),
            status: totalLoss > (energyGenerated * 0.15) ? 'Critical' : (totalLoss > (energyGenerated * 0.10) ? 'Warning' : 'Secure')
        };

        // Emit for Anomaly Portal
        io.emit('anomalyUpdate', {
            meters: suspiciousMetersList,
            gridMetrics: gridState.gridSecurity,
            renewables: {
                solar: ((gridState.generation.solar / energyGenerated) * 100).toFixed(1),
                wind: ((gridState.generation.wind / energyGenerated) * 100).toFixed(1),
                hydro: ((gridState.generation.hydro / energyGenerated) * 100).toFixed(1)
            },
            timestamp: Date.now()
        });


    } catch (e) { console.error('[Grid Persistence Error]', e); }

    io.emit('gridUpdate', gridState);
    console.log(`[Grid] ${strategyMsg} | Demand: ${Math.floor(aiDemand)} MW`);
}

setInterval(stepSimulation, 5000);

// --- ENDPOINTS ---
app.get('/api/grid/status', (req, res) => res.json(gridState));
app.get('/api/grid/stats', (req, res) => res.json({
    solar: gridState.generation.solar,
    wind: gridState.generation.wind,
    hydro: gridState.generation.hydro,
    demand: gridState.demand,
    storage: gridState.storage.current,
    status: gridState.gridSecurity.status
}));

app.post('/api/grid/override', (req, res) => {
    const { type, value } = req.body;
    if (manualOverrides.hasOwnProperty(type)) {
        if (type === 'area') {
            manualOverrides[type] = value;
        } else {
            manualOverrides[type] = (value === "" || value === null) ? null : parseFloat(value);
        }
        res.json({ success: true, manualOverrides });
    } else {
        res.status(400).json({ error: 'Invalid field' });
    }
});
// Riverside
app.post('/api/meters/override', (req, res) => {
    const { meterId, mode } = req.body;
    manualOverrides.meters[meterId] = mode;
    res.json({ success: true, manualOverrides });
});

app.get('/api/ml/status', (req, res) => res.json({ mlService: ML_API, status: 'connected' }));

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email, password }).catch(() => null);
    if (!user && email) {
        user = new User({ email, password, role: email.includes('admin') ? 'admin' : 'user' });
        await user.save().catch(() => {});
    }
    res.json(user || { email, role: email.includes('admin') ? 'admin' : 'user' });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log('[AI GreenGrid] System Online | Port', PORT);
    console.log('[AI GreenGrid] ML Service:', ML_API);
    stepSimulation();
});
