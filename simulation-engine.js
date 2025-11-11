// Circuit Simulation Engine
// Handles real-time circuit simulation and virtual environment

class SimulationEngine {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.components = [];
        this.virtualObjects = [];
        this.sensorData = {};
        this.serialOutput = [];
        this.dataHistory = {
            ultrasonic: [],
            temperature: [],
            humidity: [],
            light: []
        };
        this.simulationCanvas = null;
        this.simulationCtx = null;
        this.dataGraph = null;
        this.dataCtx = null;
        this.animationFrame = null;
        this.time = 0;
        
        this.initializeCanvas();
    }

    // Initialize simulation canvases
    initializeCanvas() {
        console.log('Initializing simulation canvases...');
        
        this.simulationCanvas = document.getElementById('simulation-canvas');
        if (!this.simulationCanvas) {
            console.error('Simulation canvas not found');
            return;
        }
        this.simulationCtx = this.simulationCanvas.getContext('2d');
        
        this.dataGraph = document.getElementById('data-graph');
        if (!this.dataGraph) {
            console.error('Data graph canvas not found');
            return;
        }
        this.dataCtx = this.dataGraph.getContext('2d');
        
        console.log('Canvases initialized successfully');
        this.setupVirtualEnvironment();
    }

    // Setup virtual environment
    setupVirtualEnvironment() {
        // Draw grid
        this.drawGrid();
        
        // Add default virtual objects
        this.addVirtualObject({ type: 'wall', x: 100, y: 150, width: 20, height: 100 });
        this.addVirtualObject({ type: 'target', x: 300, y: 150, radius: 20 });
    }

    // Draw grid background
    drawGrid() {
        const ctx = this.simulationCtx;
        const canvas = this.simulationCanvas;
        
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        
        // Draw grid lines
        for (let x = 0; x <= canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // Start simulation
    startSimulation() {
        if (this.isRunning && !this.isPaused) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.addSerialMessage("Simulation started...");
        this.animate();
    }

    // Pause simulation
    pauseSimulation() {
        this.isPaused = true;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.addSerialMessage("Simulation paused.");
    }

    // Reset simulation
    resetSimulation() {
        this.isRunning = false;
        this.isPaused = false;
        this.time = 0;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Reset sensor data
        this.sensorData = {
            ultrasonic: '--',
            temperature: '--',
            humidity: '--',
            light: '--'
        };
        
        // Clear history
        this.dataHistory = {
            ultrasonic: [],
            temperature: [],
            humidity: [],
            light: []
        };
        
        // Reset displays
        this.updateSensorDisplay();
        this.clearSerialOutput();
        this.setupVirtualEnvironment();
        
        this.addSerialMessage("Simulation reset.");
    }

    // Animation loop
    animate() {
        if (!this.isRunning || this.isPaused) return;
        
        this.time += 0.016; // ~60 FPS
        
        // Update simulation
        this.updateSimulation();
        
        // Draw environment
        this.drawEnvironment();
        
        // Update displays
        this.updateSensorDisplay();
        this.updateDataGraph();
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    // Update simulation logic
    updateSimulation() {
        // Simulate sensor readings based on virtual objects
        this.simulateUltrasonicSensor();
        this.simulateTemperatureSensor();
        this.simulateHumiditySensor();
        this.simulateLightSensor();
        
        // Simulate actuator responses
        this.simulateActuators();
    }

    // Simulate ultrasonic sensor
    simulateUltrasonicSensor() {
        const hasUltrasonic = this.components.some(c => c.type === 'ultrasonic');
        if (!hasUltrasonic) return;
        
        // Find nearest wall/target
        let minDistance = 400; // Max range
        
        this.virtualObjects.forEach(obj => {
            if (obj.type === 'wall' || obj.type === 'obstacle') {
                const distance = Math.abs(obj.x - 200) + Math.random() * 10;
                minDistance = Math.min(minDistance, distance);
            }
        });
        
        this.sensorData.ultrasonic = minDistance.toFixed(1) + ' cm';
        this.dataHistory.ultrasonic.push(parseFloat(minDistance));
        if (this.dataHistory.ultrasonic.length > 50) {
            this.dataHistory.ultrasonic.shift();
        }
    }

    // Simulate temperature sensor
    simulateTemperatureSensor() {
        const hasDHT = this.components.some(c => c.type === 'dht11' || c.type === 'dht22');
        if (!hasDHT) return;
        
        // Simulate temperature variations
        const baseTemp = 25;
        const variation = Math.sin(this.time * 0.5) * 3;
        const temperature = baseTemp + variation + Math.random() * 0.5;
        
        this.sensorData.temperature = temperature.toFixed(1) + ' °C';
        this.dataHistory.temperature.push(temperature);
        if (this.dataHistory.temperature.length > 50) {
            this.dataHistory.temperature.shift();
        }
    }

    // Simulate humidity sensor
    simulateHumiditySensor() {
        const hasDHT = this.components.some(c => c.type === 'dht11' || c.type === 'dht22');
        if (!hasDHT) return;
        
        // Simulate humidity variations
        const baseHumidity = 60;
        const variation = Math.cos(this.time * 0.3) * 10;
        const humidity = baseHumidity + variation + Math.random() * 2;
        
        this.sensorData.humidity = humidity.toFixed(1) + ' %';
        this.dataHistory.humidity.push(humidity);
        if (this.dataHistory.humidity.length > 50) {
            this.dataHistory.humidity.shift();
        }
    }

    // Simulate light sensor
    simulateLightSensor() {
        const hasLDR = this.components.some(c => c.type === 'ldr');
        if (!hasLDR) return;
        
        // Check for virtual light sources
        let lightLevel = 300; // Ambient light
        
        this.virtualObjects.forEach(obj => {
            if (obj.type === 'virtual_light') {
                const distance = Math.sqrt(Math.pow(obj.x - 200, 2) + Math.pow(obj.y - 150, 2));
                const lightContribution = Math.max(0, 1000 - distance * 2);
                lightLevel += lightContribution;
            }
        });
        
        this.sensorData.light = Math.round(lightLevel) + ' lux';
        this.dataHistory.light.push(lightLevel);
        if (this.dataHistory.light.length > 50) {
            this.dataHistory.light.shift();
        }
    }

    // Simulate actuators
    simulateActuators() {
        const hasServo = this.components.some(c => c.type === 'servo');
        if (hasServo) {
            // Simulate servo movement
            const servoAngle = Math.sin(this.time) * 90 + 90;
            this.addSerialMessage(`Servo position: ${Math.round(servoAngle)}°`);
        }
        
        const hasLED = this.components.some(c => c.type === 'led');
        if (hasLED) {
            // Simulate LED blinking
            const ledState = Math.sin(this.time * 2) > 0 ? 'ON' : 'OFF';
            this.addSerialMessage(`LED status: ${ledState}`);
        }
    }

    // Draw virtual environment
    drawEnvironment() {
        this.drawGrid();
        
        // Draw Arduino boards
        this.drawArduinoBoards();
        
        // Draw virtual objects
        this.virtualObjects.forEach(obj => {
            this.drawVirtualObject(obj);
        });
        
        // Draw sensor visualization
        this.drawSensorVisualization();
    }

    // Draw Arduino boards
    drawArduinoBoards() {
        const ctx = this.simulationCtx;
        
        this.components.forEach(comp => {
            if (comp.type.includes('arduino') || comp.type.includes('esp')) {
                // Draw simplified board representation
                ctx.fillStyle = '#0066cc';
                ctx.fillRect(150, 130, 100, 40);
                
                // Draw board label
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(comp.type.toUpperCase(), 200, 155);
            }
        });
    }

    // Draw virtual objects
    drawVirtualObject(obj) {
        const ctx = this.simulationCtx;
        
        switch (obj.type) {
            case 'wall':
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                // Add brick pattern
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 1;
                for (let i = 0; i < obj.height; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(obj.x, obj.y + i);
                    ctx.lineTo(obj.x + obj.width, obj.y + i);
                    ctx.stroke();
                }
                break;
                
            case 'obstacle':
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(obj.x + obj.radius, obj.y + obj.radius, obj.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('!', obj.x + obj.radius, obj.y + obj.radius + 4);
                break;
                
            case 'target':
                ctx.strokeStyle = '#4ecdc4';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(obj.x + obj.radius, obj.y + obj.radius, obj.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(obj.x + obj.radius, obj.y + obj.radius, obj.radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(obj.x + obj.radius, obj.y + obj.radius, obj.radius * 0.3, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'virtual_light':
                // Draw light bulb
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 15, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw light rays
                ctx.strokeStyle = '#ffeb3b';
                ctx.lineWidth = 2;
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                    ctx.beginPath();
                    ctx.moveTo(obj.x + Math.cos(angle) * 20, obj.y + Math.sin(angle) * 20);
                    ctx.lineTo(obj.x + Math.cos(angle) * 30, obj.y + Math.sin(angle) * 30);
                    ctx.stroke();
                }
                break;
        }
    }

    // Draw sensor visualization
    drawSensorVisualization() {
        const ctx = this.simulationCtx;
        
        // Draw ultrasonic sensor waves
        const hasUltrasonic = this.components.some(c => c.type === 'ultrasonic');
        if (hasUltrasonic) {
            const waveRadius = (this.time * 50) % 100;
            ctx.strokeStyle = 'rgba(0, 123, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(200, 150, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Update sensor display
    updateSensorDisplay() {
        document.getElementById('ultrasonic-value').textContent = this.sensorData.ultrasonic || '-- cm';
        document.getElementById('temperature-value').textContent = this.sensorData.temperature || '-- °C';
        document.getElementById('humidity-value').textContent = this.sensorData.humidity || '-- %';
        document.getElementById('light-value').textContent = this.sensorData.light || '-- lux';
    }

    // Update data graph
    updateDataGraph() {
        const ctx = this.dataCtx;
        const canvas = this.dataGraph;
        
        // Clear canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Draw ultrasonic data
        if (this.dataHistory.ultrasonic.length > 1) {
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            this.dataHistory.ultrasonic.forEach((value, index) => {
                const x = (index / 50) * canvas.width;
                const y = canvas.height - (value / 400) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw temperature data
        if (this.dataHistory.temperature.length > 1) {
            ctx.strokeStyle = '#dc3545';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            this.dataHistory.temperature.forEach((value, index) => {
                const x = (index / 50) * canvas.width;
                const y = canvas.height - ((value - 20) / 20) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
    }

    // Add serial message
    addSerialMessage(message) {
        const timestamp = new Date().toLocaleTimeString();
        const serialContent = document.getElementById('serial-content');
        
        if (!serialContent) {
            console.error('Serial content element not found');
            return;
        }
        
        const newMessage = `[${timestamp}] ${message}\n`;
        
        this.serialOutput.push(newMessage);
        
        // Keep only last 100 messages
        if (this.serialOutput.length > 100) {
            this.serialOutput.shift();
        }
        
        serialContent.textContent = this.serialOutput.join('');
        serialContent.scrollTop = serialContent.scrollHeight;
        console.log('Serial message added:', message);
    }

    // Clear serial output
    clearSerialOutput() {
        this.serialOutput = [];
        document.getElementById('serial-content').textContent = '';
    }

    // Add virtual object
    addVirtualObject(obj) {
        const defaultObj = {
            type: obj.type,
            x: obj.x || Math.random() * 300 + 50,
            y: obj.y || Math.random() * 200 + 50,
            width: obj.width || 20,
            height: obj.height || 60,
            radius: obj.radius || 20
        };
        
        this.virtualObjects.push(defaultObj);
        this.addSerialMessage(`Added ${obj.type} at (${Math.round(defaultObj.x)}, ${Math.round(defaultObj.y)})`);
    }

    // Set components for simulation
    setComponents(components) {
        this.components = components;
        console.log('Simulation components set:', components);
    }

    // Get simulation data
    getSimulationData() {
        return {
            sensors: this.sensorData,
            serial: this.serialOutput,
            history: this.dataHistory,
            isRunning: this.isRunning
        };
    }
}

// Initialize simulation engine
let simulationEngine;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    simulationEngine = new SimulationEngine();
    console.log('Simulation engine loaded');
});

// Global functions for simulation controls
function startSimulation() {
    console.log('Start simulation clicked');
    if (typeof simulationEngine !== 'undefined') {
        simulationEngine.startSimulation();
    } else {
        console.error('Simulation engine not available');
        showMessage('Simulation engine not initialized', 'error');
    }
}

function pauseSimulation() {
    console.log('Pause simulation clicked');
    if (typeof simulationEngine !== 'undefined') {
        simulationEngine.pauseSimulation();
    } else {
        console.error('Simulation engine not available');
    }
}

function resetSimulation() {
    console.log('Reset simulation clicked');
    if (typeof simulationEngine !== 'undefined') {
        simulationEngine.resetSimulation();
    } else {
        console.error('Simulation engine not available');
    }
}

function addVirtualObject(type) {
    console.log('Adding virtual object:', type);
    if (typeof simulationEngine !== 'undefined') {
        simulationEngine.addVirtualObject({ type: type });
    } else {
        console.error('Simulation engine not available');
        showMessage('Simulation engine not initialized', 'error');
    }
}

function switchOutputTab(tabName) {
    console.log('Switching to tab:', tabName);
    // Hide all panels
    document.querySelectorAll('.output-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected panel
    const selectedPanel = document.getElementById(`${tabName}-output`);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
    } else {
        console.error(`Panel ${tabName}-output not found`);
    }
    
    // Add active class to clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
    }
}