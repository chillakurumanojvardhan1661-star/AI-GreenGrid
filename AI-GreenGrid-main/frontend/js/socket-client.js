// Socket.io Client Implementation
(function() {
    console.log('[Socket] Connecting to AI GreenGrid real-time engine...');
    
    // Load Socket.io script dynamically if not present
    if (typeof io === 'undefined') {
        const script = document.createElement('script');
        script.src = 'http://localhost:3000/socket.io/socket.io.js';
        script.onload = initializeSocket;
        document.head.appendChild(script);
    } else {
        initializeSocket();
    }

    function initializeSocket() {
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('[Socket] Connected to backend simulation.');
        });

        socket.on('gridUpdate', (data) => {
            console.log('[Socket] Received Grid Update:', data);
            window.liveGridData = data;
            
            // Dispatch a custom event so dashboards can listen for updates
            const event = new CustomEvent('liveGridUpdate', { detail: data });
            window.dispatchEvent(event);
            
            // Auto-update common elements if they exist
            updateCommonStats(data);
        });

        socket.on('anomalyUpdate', (data) => {
            console.log('[Socket] Received Anomaly Update:', data);
            const event = new CustomEvent('anomalyUpdate', { detail: data });
            window.dispatchEvent(event);
        });

        socket.on('anomalyAlert', (data) => {
            console.log('[Socket] Received Anomaly Alert:', data);
            const event = new CustomEvent('anomalyAlert', { detail: data });
            window.dispatchEvent(event);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected from backend.');
        });
    }

    function updateCommonStats(data) {
        // Look for common stat IDs and update them
        const elements = {
            'live-total-gen': data.generation.total + ' GW',
            'live-renewable-perc': data.renewablePercentage + '%',
            'live-demand': data.demand + ' GW',
            'live-pricing': '$' + data.pricing.toFixed(3),
            'live-storage-perc': data.storage.percentage + '%'
        };

        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }
    }
})();
