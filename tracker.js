    // Utility functions
    class Utils {
        static getCurrentTime() {
            const now = new Date();
            return now.toLocaleTimeString();
        }
        
        static formatDateTime(date) {
            return date.toLocaleString();
        }
        
        static generateUUID() {
            return 'xxxx-xxxx-xxxx'.replace(/[x]/g, function() {
                return Math.floor(Math.random() * 16).toString(16);
            });
        }
        
        static calculateDistance(lat1, lon1, lat2, lon2) {
            // Haversine formula
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c * 1000; // Distance in meters
        }
    }

    // DeviceManager Class - ZUERST definieren
    class DeviceManager {
        constructor() {
            this.foundDevice = false;
            this.isScanning = false;
            this.scanAttempts = 0;
            this.maxScanAttempts = 3;
        }
        
        scanForDevices() {
            if (this.isScanning) {
                trackerCard.logEvent("Scan already in progress", 'warning');
                return;
            }
            
            this.scanAttempts++;
            if (this.scanAttempts > this.maxScanAttempts) {
                trackerCard.logEvent(`Scan failed after ${this.maxScanAttempts} attempts`, 'error');
                return;
            }
            
            this.isScanning = true;
            trackerCard.logEvent("Scanning for Bluetooth devices...", 'info');
            
            // Update UI
            document.getElementById('connection-indicator').className = 'status-indicator searching';
            document.getElementById('status-text').textContent = 'Scanning...';
            document.getElementById('scan-btn').disabled = true;
            
            const scanTime = 2000 + Math.random() * 3000;
            
            setTimeout(() => {
                this.isScanning = false;
                
                if (Math.random() < 0.8) {
                    this.foundDevice = true;
                    trackerCard.logEvent("Tracker device found", 'success');
                    document.getElementById('connection-indicator').className = 'status-indicator disconnected';
                    document.getElementById('status-text').textContent = 'Device found - Ready to connect';
                } else {
                    trackerCard.logEvent("No devices found", 'warning');
                    document.getElementById('connection-indicator').className = 'status-indicator disconnected';
                    document.getElementById('status-text').textContent = 'Scan complete - No devices found';
                }
                
                document.getElementById('scan-btn').disabled = false;
                document.getElementById('connect-btn').disabled = !this.foundDevice;
                
                this.updateUI();
            }, scanTime);
        }
        
        connectToDevice() {
            if (!this.foundDevice || trackerCard.isConnected) return;
            
            trackerCard.logEvent("Attempting to connect to device...", 'info');
            document.getElementById('connect-btn').disabled = true;
            
            const connectTime = 1000 + Math.random() * 2000;
            
            setTimeout(() => {
                if (Math.random() < 0.9) {
                    trackerCard.connect();
                    this.scanAttempts = 0;
                } else {
                    trackerCard.logEvent("Connection failed - Try again", 'error');
                    document.getElementById('connect-btn').disabled = false;
                }
                
                this.updateUI();
            }, connectTime);
        }
        
        disconnectDevice() {
            trackerCard.disconnect();
            this.updateUI();
        }
        
        updateUI() {
            document.getElementById('scan-btn').disabled = this.isScanning;
            document.getElementById('connect-btn').disabled = 
                trackerCard.isConnected || !this.foundDevice;
        }
    }

    // TrackerCard Class - DANACH definieren
    class TrackerCard {
        constructor() {
            this.name = "FnR-Tracker-6ACTAG6";
            this.batteryLevel = 85;
            this.isConnected = false;
            this.isBeeping = false;
            this.lastLocation = { lat: 52.5200, lng: 13.4050 }; // Berlin
            this.locationHistory = [];
            this.deviceId = Utils.generateUUID();
            this.firmwareVersion = "1.2.3";
            this.hardwareRevision = "RevB";
            this.signalStrength = 0; // dBm
            this.updateInterval = null;
            this.beepInterval = null;
            this.beepCount = 0;
            this.maxBeepCount = 3;
            this.connectionAttempts = 0;
            this.maxConnectionAttempts = 3;
            this.isLostMode = false;
            this.ownerInfo = {
                name: "Max Mustermann",
                phone: "+49 123 456789",
                message: "Bitte kontaktieren Sie mich, wenn Sie dieses Gerät finden"
            };
            
            this.initialize();
        }
        
        initialize() {
            const savedData = localStorage.getItem('trackerCardData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.name = data.name || this.name;
                this.lastLocation = data.lastLocation || this.lastLocation;
                this.locationHistory = data.locationHistory || this.locationHistory;
                this.batteryLevel = data.batteryLevel || this.batteryLevel;
            }
            
            this.updateUI();
            this.displayLocation();
            this.updateHistoryList();
        }
        
        saveState() {
            const data = {
                name: this.name,
                lastLocation: this.lastLocation,
                locationHistory: this.locationHistory.slice(-10),
                batteryLevel: this.batteryLevel
            };
            localStorage.setItem('trackerCardData', JSON.stringify(data));
        }
        
        connect() {
            if (this.isConnected) return;
            
            this.connectionAttempts++;
            if (this.connectionAttempts > this.maxConnectionAttempts) {
                this.logEvent(`Connection failed after ${this.maxConnectionAttempts} attempts`, 'error');
                return;
            }
            
            this.isConnected = true;
            this.signalStrength = -75;
            this.logEvent(`Device connected (ID: ${this.deviceId})`, 'success');
            
            this.updateInterval = setInterval(() => {
                this.simulateSignalVariation();
                this.simulateBatteryDrain();
                this.updateUI();
                
                if (Math.random() < 0.3) {
                    this.updateLocation();
                }
            }, 5000);
            
            this.updateUI();
            this.saveState();
        }
        
        disconnect() {
            if (!this.isConnected) return;
            
            this.isConnected = false;
            clearInterval(this.updateInterval);
            clearInterval(this.beepInterval);
            this.logEvent("Device disconnected", 'warning');
            this.connectionAttempts = 0;
            
            this.updateUI();
            this.saveState();
        }
        
        playSound() {
            if (!this.isConnected) {
                this.logEvent("Cannot play sound - device not connected", 'error');
                return;
            }
            
            if (this.isBeeping) {
                this.logEvent("Sound is already playing", 'warning');
                return;
            }
            
            this.isBeeping = true;
            this.beepCount = 0;
            this.logEvent("Playing sound alert", 'info');
            
            this.beepInterval = setInterval(() => {
                this.beepCount++;
                this.logEvent(`Beep ${this.beepCount}/${this.maxBeepCount}`, 'info');
                
                if (this.beepCount >= this.maxBeepCount) {
                    clearInterval(this.beepInterval);
                    this.isBeeping = false;
                    this.logEvent("Sound stopped", 'info');
                }
                
                this.updateUI();
            }, 1000);
            
            this.updateUI();
        }
        
        updateLocation() {
            if (!this.isConnected) {
                this.logEvent("Cannot update location - device not connected", 'error');
                return;
            }
            
            const smallChange = () => (Math.random() - 0.5) * 0.001;
            const bigChange = () => (Math.random() - 0.5) * 0.01;
            
            this.lastLocation.lat += Math.random() < 0.8 ? smallChange() : bigChange();
            this.lastLocation.lng += Math.random() < 0.8 ? smallChange() : bigChange();
            
            this.lastLocation.lat = Math.max(52.45, Math.min(52.55, this.lastLocation.lat));
            this.lastLocation.lng = Math.max(13.30, Math.min(13.50, this.lastLocation.lng));
            
            const newLocation = {
                ...this.lastLocation,
                timestamp: new Date(),
                accuracy: 5 + Math.random() * 15
            };
            
            this.locationHistory.push(newLocation);
            if (this.locationHistory.length > 10) {
                this.locationHistory.shift();
            }
            
            this.logEvent(`Location updated: Lat ${this.lastLocation.lat.toFixed(6)}, Lng ${this.lastLocation.lng.toFixed(6)}`, 'info');
            this.displayLocation();
            this.updateHistoryList();
            this.saveState();
        }
        
        checkBattery() {
            this.logEvent(`Battery level: ${this.batteryLevel}%`, 'info');
            this.updateUI();
        }
        
        simulateSignalVariation() {
            this.signalStrength = Math.max(-100, Math.min(-30, 
                this.signalStrength + (Math.random() * 10 - 5)
            ));
            
            if (this.batteryLevel < 20) {
                this.signalStrength -= 5;
            }
        }
        
        simulateBatteryDrain() {
            let drainRate = 0.5;
            if (this.isBeeping) drainRate += 1.0;
            if (this.signalStrength < -80) drainRate += 0.5;
            
            this.batteryLevel = Math.max(0, this.batteryLevel - drainRate);
            
            if (this.batteryLevel <= 10 && this.batteryLevel > 5) {
                this.logEvent(`Warning: Low battery (${this.batteryLevel}%)`, 'warning');
            }
            else if (this.batteryLevel <= 5) {
                this.logEvent(`Critical: Very low battery (${this.batteryLevel}%)`, 'error');
            }
            
            if (this.batteryLevel <= 0) {
                this.logEvent("Battery depleted - device shutting down", 'error');
                this.disconnect();
            }
            
            this.updateUI();
        }
        
        enableLostMode() {
            this.isLostMode = true;
            this.logEvent("Lost mode activated", 'warning');
            this.logEvent(`Owner message: ${this.ownerInfo.message}`, 'info');
            this.updateUI();
        }
        
        disableLostMode() {
            this.isLostMode = false;
            this.logEvent("Lost mode deactivated", 'info');
            this.updateUI();
        }
        
        factoryReset() {
            if (!confirm("Are you sure you want to factory reset the device? All data will be lost.")) {
                return;
            }
            
            this.logEvent("Initiating factory reset...", 'warning');
            
            setTimeout(() => {
                this.disconnect();
                this.name = "FnR-Tracker-6ACTAG6";
                this.batteryLevel = 100;
                this.locationHistory = [];
                this.deviceId = Utils.generateUUID();
                this.isLostMode = false;
                
                localStorage.removeItem('trackerCardData');
                this.logEvent("Factory reset complete", 'success');
                this.updateUI();
                this.displayLocation();
                this.updateHistoryList();
            }, 2000);
        }
        
        displayLocation() {
            const mapElement = document.getElementById('map');
            const locationInfo = document.getElementById('location-info');
            
            const bbox = [
                this.lastLocation.lng - 0.01,
                this.lastLocation.lat - 0.01,
                this.lastLocation.lng + 0.01,
                this.lastLocation.lat + 0.01
            ].join(',');
            
            const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${this.lastLocation.lat},${this.lastLocation.lng}`;
            
            mapElement.src = osmUrl;
            
            locationInfo.innerHTML = `
                <div><strong>Coordinates:</strong> Lat ${this.lastLocation.lat.toFixed(6)}, Lng ${this.lastLocation.lng.toFixed(6)}</div>
                <div><strong>Last update:</strong> ${new Date().toLocaleTimeString()}</div>
                ${this.isLostMode ? `<div class="tooltip"><strong>🔴 LOST MODE ACTIVE</strong>
                    <span class="tooltiptext">${this.ownerInfo.message}<br>Contact: ${this.ownerInfo.phone}</span>
                </div>` : ''}
            `;
        }
        
        updateHistoryList() {
            const historyList = document.getElementById('history-list');
            historyList.innerHTML = '';
            
            const recentHistory = [...this.locationHistory].reverse().slice(0, 5);
            
            if (recentHistory.length === 0) {
                historyList.innerHTML = '<div class="history-item">No location history available</div>';
                return;
            }
            
            recentHistory.forEach((loc, index) => {
                const item = document.createElement('div');
                item.className = 'history-item';
                
                let distance = '';
                if (index < recentHistory.length - 1) {
                    const prevLoc = recentHistory[index + 1];
                    const dist = Utils.calculateDistance(
                        loc.lat, loc.lng,
                        prevLoc.lat, prevLoc.lng
                    );
                    distance = ` | Distance: ${dist.toFixed(1)}m`;
                }
                
                item.innerHTML = `
                    <div><strong>${Utils.formatDateTime(loc.timestamp)}</strong></div>
                    <div>Lat: ${loc.lat.toFixed(6)}, Lng: ${loc.lng.toFixed(6)}</div>
                    <div>Accuracy: ~${loc.accuracy.toFixed(1)}m${distance}</div>
                `;
                historyList.appendChild(item);
            });
        }
        
        updateUI() {
            const statusIndicator = document.getElementById('connection-indicator');
            const statusText = document.getElementById('status-text');
            
            if (this.isConnected) {
                statusIndicator.className = 'status-indicator connected';
                statusText.textContent = 'Connected';
                if (this.isBeeping) {
                    statusText.textContent += ' (Beeping)';
                }
            } else {
                statusIndicator.className = 'status-indicator disconnected';
                statusText.textContent = 'Disconnected';
            }
            
            document.getElementById('device-name').textContent = this.name;
            document.getElementById('device-id').textContent = this.deviceId;
            document.getElementById('firmware-version').textContent = this.firmwareVersion;
            document.getElementById('hardware-revision').textContent = this.hardwareRevision;
            document.getElementById('last-seen').textContent = this.isConnected ? 
                'Just now' : new Date().toLocaleTimeString();
            
            const batteryIndicator = document.getElementById('battery-indicator');
            const batteryBar = document.getElementById('battery-bar');
            
            batteryIndicator.textContent = `${Math.round(this.batteryLevel)}%`;
            batteryBar.style.width = `${this.batteryLevel}%`;
            
            if (this.batteryLevel > 60) {
                batteryIndicator.className = 'battery-container battery-high';
                batteryBar.style.backgroundColor = 'var(--success)';
            } else if (this.batteryLevel > 20) {
                batteryIndicator.className = 'battery-container battery-medium';
                batteryBar.style.backgroundColor = 'var(--warning)';
            } else if (this.batteryLevel > 5) {
                batteryIndicator.className = 'battery-container battery-low';
                batteryBar.style.backgroundColor = 'var(--danger)';
            } else {
                batteryIndicator.className = 'battery-container battery-critical';
                batteryBar.style.backgroundColor = 'var(--danger)';
            }
            
            const signalBars = document.querySelectorAll('#signal-strength .signal-level');
            const signalValue = document.getElementById('signal-value');
            
            const signalPercent = Math.min(100, Math.max(0, 
                ((this.signalStrength + 100) / 70) * 100
            ));
            const barsToShow = Math.ceil(signalPercent / 20);
            
            signalBars.forEach((bar, index) => {
                bar.className = 'signal-level' + (index < barsToShow ? ' signal-active' : '');
            });
            
            signalValue.textContent = `${this.signalStrength.toFixed(0)} dBm`;
            
            document.getElementById('connect-btn').disabled = this.isConnected || !deviceManager.foundDevice;
            document.getElementById('disconnect-btn').disabled = !this.isConnected;
            document.getElementById('beep-btn').disabled = !this.isConnected;
            document.getElementById('location-btn').disabled = !this.isConnected;
            document.getElementById('battery-btn').disabled = !this.isConnected;
            document.getElementById('reset-btn').disabled = !this.isConnected;
        }
        
        logEvent(message, type = 'info') {
            const logElement = document.getElementById('event-log');
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            const typeClass = {
                'info': 'log-info',
                'warning': 'log-warning',
                'error': 'log-error',
                'success': 'log-success'
            }[type] || '';
            
            logEntry.innerHTML = `
                <span class="log-time">[${Utils.getCurrentTime()}]</span>
                <span class="log-message ${typeClass}">${message}</span>
            `;
            
            logElement.prepend(logEntry);
            
            if (logElement.children.length > 50) {
                logElement.removeChild(logElement.lastChild);
            }
        }
    }

    // Initialize instances AFTER class definitions
    const deviceManager = new DeviceManager();
    const trackerCard = new TrackerCard();
    
    // Initial UI setup
    trackerCard.updateUI();
    trackerCard.displayLocation();
    trackerCard.updateHistoryList();
    
    // Log initial event
    trackerCard.logEvent("System initialized", 'info');