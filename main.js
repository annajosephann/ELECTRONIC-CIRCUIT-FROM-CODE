// Main Application Controller
// Handles UI interactions and coordinates the circuit engine

let editor;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    loadExample('led'); // Load default example
    setupEventListeners();
    
    // Initialize simulation after DOM is ready
    setTimeout(() => {
        if (typeof simulationEngine !== 'undefined') {
            console.log('Simulation engine initialized successfully');
            simulationEngine.setupVirtualEnvironment();
        } else {
            console.error('Simulation engine not available');
        }
    }, 500);
});

// Initialize CodeMirror editor
function initializeEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById('circuit-code'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        extraKeys: {
            "Ctrl-Enter": generateCircuit,
            "Cmd-Enter": generateCircuit
        }
    });

    // Set initial editor height
    editor.setSize(null, 350);
}

// Setup event listeners
function setupEventListeners() {
    // Auto-generate on editor change (with debounce)
    let debounceTimer;
    editor.on('change', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (editor.getValue().trim()) {
                generateCircuit();
            }
        }, 1000);
    });
}

// Generate circuit from code
function generateCircuit() {
    const code = editor.getValue();
    
    if (!code.trim()) {
        showMessage('Please enter circuit code', 'error');
        return;
    }

    try {
        // Show loading state
        const button = event?.target;
        const originalText = button?.innerHTML || '';
        if (button) {
            button.innerHTML = '<span class="loading"></span> Generating...';
            button.disabled = true;
        }

        // Parse and generate circuit
        const { components, connections } = circuitEngine.parseCircuitCode(code);
        circuitEngine.generateCircuit(components, connections);

        // Update simulation with new components
        if (typeof simulationEngine !== 'undefined') {
            simulationEngine.setComponents(components);
            simulationEngine.resetSimulation();
        } else {
            console.error('Simulation engine not initialized');
        }

        // Show success message
        showMessage(`Successfully generated circuit with ${components.length} components and ${connections.length} connections`, 'success');

    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
        console.error('Circuit generation error:', error);
    } finally {
        // Restore button state
        if (button) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
}

// Load example circuit
function loadExample(type) {
    let code = '';
    
    switch (type) {
        case 'led':
            code = `// Simple LED Circuit
V1: battery 9V (100, 100)
R1: resistor 330 (250, 100)
LED1: led red (400, 100)
GND: ground (550, 100)

// Connections
V1 -> R1
R1 -> LED1
LED1 -> GND`;
            break;

        case 'resistor':
            code = `// Resistor Network (Series and Parallel)
V1: battery 12V (50, 100)
R1: resistor 1k (150, 100)
R2: resistor 2k (250, 100)
R3: resistor 470 (250, 200)
R4: resistor 470 (250, 300)
GND: ground (400, 200)

// Series connection
V1 -> R1
R1 -> R2

// Parallel connection
R2 -> R3
R2 -> R4

// Ground connection
R3 -> GND
R4 -> GND`;
            break;

        case 'amplifier':
            code = `// Simple NPN Transistor Amplifier
VCC: battery 12V (100, 50)
R1: resistor 47k (200, 50)
R2: resistor 10k (200, 150)
R3: resistor 4.7k (350, 50)
Q1: npn (300, 150)
C1: capacitor 10uF (50, 150)
C2: capacitor 100uF (450, 150)
GND: ground (400, 250)

// Input coupling
C1 -> R2

// Bias network
VCC -> R1
R1 -> Q1
R2 -> GND

// Collector circuit
VCC -> R3
R3 -> Q1

// Output coupling
Q1 -> C2

// Ground reference
Q1 -> GND`;
            break;

        case 'filter':
            code = `// RC Low-Pass Filter
VIN: battery 5V (50, 100)
R1: resistor 10k (150, 100)
C1: capacitor 100nF (250, 100)
R2: resistor 10k (350, 100) // Load
GND1: ground (250, 200)
GND2: ground (450, 200)

// Filter circuit
VIN -> R1
R1 -> C1

// Load and ground
C1 -> R2
C1 -> GND1
R2 -> GND2`;
            break;

        case 'arduino_blink':
            code = `// Arduino LED Blink Circuit
ARDUINO1: arduino_uno (100, 100)
R1: resistor 220 (300, 150)
LED1: led red (400, 150)
GND1: ground (500, 150)

// Arduino Digital Pin 13 -> Resistor -> LED -> Ground
ARDUINO1 -> R1
R1 -> LED1
LED1 -> GND1

// Note: Connect ARDUINO1 pin 13 to R1
// Connect LED1 cathode to GND1`;
            break;

        case 'arduino_sensor':
            code = `// Arduino DHT11 Temperature & Humidity Sensor
ARDUINO1: arduino_uno (100, 100)
DHT1: dht11 (300, 100)
R1: resistor 10k (350, 180) // Pull-up resistor
GND1: ground (200, 200)
VCC1: battery 5V (100, 200)

// Power connections
VCC1 -> DHT1
DHT1 -> R1
R1 -> GND1

// Data connection
ARDUINO1 -> DHT1
DHT1 -> GND1

// Note: 
// DHT1 VCC to 5V
// DHT1 Data to Arduino pin 2
// DHT1 GND to ground`;
            break;

        case 'arduino_motor':
            code = `// Arduino DC Motor Control with L298N Driver
ARDUINO1: arduino_uno (50, 100)
M1: dc_motor (400, 100)
Q1: npn (200, 150)
Q2: npn (200, 250)
D1: led red (250, 150) // Direction indicator
D2: led green (250, 250) // Direction indicator
R1: resistor 1k (150, 150)
R2: resistor 1k (150, 250)
GND1: ground (300, 350)
VCC1: battery 9V (100, 350) // Motor power
VCC2: battery 5V (50, 350) // Arduino power

// Arduino control connections
ARDUINO1 -> R1
R1 -> Q1
ARDUINO1 -> R2
R2 -> Q2

// Motor driver connections
VCC1 -> M1
M1 -> Q1
M1 -> Q2

// Direction indicators
Q1 -> D1
Q2 -> D2

// Ground connections
Q1 -> GND1
Q2 -> GND1
D1 -> GND1
D2 -> GND1`;
            break;

        case 'esp32_cam_project':
            code = `// ESP32-CAM Security System with Motion Detection
CAM1: esp32_cam (100, 100)
PIR1: pir (300, 100)
LED1: led red (400, 150) // Status indicator
BUZZ1: buzzer (300, 200)
GND1: ground (500, 250)
VCC1: battery 5V (50, 250)
VCC2: battery 3.3V (50, 200)

// Power connections
VCC1 -> CAM1
VCC2 -> PIR1
CAM1 -> GND1
PIR1 -> GND1
LED1 -> GND1
BUZZ1 -> GND1

// Signal connections
CAM1 -> PIR1  // Motion detection input
PIR1 -> CAM1  // Digital output to ESP32
CAM1 -> LED1  // Status indicator
CAM1 -> BUZZ1 // Alarm output

// Virtual environment for simulation
WALL1: virtual_wall (250, 300)
TARGET1: virtual_target (350, 320)
LIGHT1: virtual_light (150, 280)

// Note:
// PIR motion sensor detects movement
// ESP32-CAM captures images when motion detected
// LED indicates system status
// Buzzer activates on security alert`;
            break;

        case 'robot_obstacle':
            code = `// Robot Obstacle Avoidance with Ultrasonic Sensor
ESP32_1: esp32 (100, 100)
HC1: ultrasonic HC-SR04 (250, 100)
SERVO1: servo SG90 (400, 50) // Steering servo
M1: dc_motor (400, 150) // Right motor
M2: dc_motor (400, 200) // Left motor
Q1: npn (300, 150) // Motor driver 1
Q2: npn (300, 200) // Motor driver 2
R1: resistor 1k (250, 150)
R2: resistor 1k (250, 200)
GND1: ground (500, 300)
VCC1: battery 5V (50, 300)
VCC2: battery 9V (150, 300) // Motor power

// ESP32 and sensors
VCC1 -> ESP32_1
VCC1 -> HC1
ESP32_1 -> GND1
HC1 -> GND1

// Ultrasonic connections
ESP32_1 -> HC1  // Trigger pin
ESP32_1 -> HC1  // Echo pin

// Motor control
ESP32_1 -> R1
R1 -> Q1
ESP32_1 -> R2
R2 -> Q2

// Motor power connections
VCC2 -> M1
VCC2 -> M2
M1 -> Q1
M2 -> Q2
Q1 -> GND1
Q2 -> GND1

// Servo control
ESP32_1 -> SERVO1

// Virtual obstacles for simulation
OBJ1: virtual_obstacle (200, 250)
OBJ2: virtual_obstacle (300, 280)
WALL1: virtual_wall (150, 320)

// Note:
// Ultrasonic sensor measures distance to obstacles
// ESP32 processes sensor data and controls motors
// Servo can be used for sensor scanning
// Robot avoids obstacles automatically`;
            break;

        case 'smart_home':
            code = `// Smart Home Automation System with Multiple Sensors
ARDUINO1: arduino_mega (50, 100)
DHT1: dht22 (200, 50) // Temperature & Humidity
LDR1: ldr (200, 100) // Light sensor
PIR1: pir (200, 150) // Motion sensor
LED1: rgb_led (350, 50) // Ambient lighting
SERVO1: servo SG90 (350, 100) // Window blind control
RELAY1: relay 5V (350, 150) // Fan control
LCD1: lcd 16x2 (200, 250) // Status display
POT1: potentiometer 10k (50, 200) // Manual control
GND1: ground (450, 300)
VCC1: battery 5V (50, 300)

// Power distribution
VCC1 -> ARDUINO1
VCC1 -> DHT1
VCC1 -> LDR1
VCC1 -> PIR1
VCC1 -> LCD1
VCC1 -> POT1

// Common ground
ARDUINO1 -> GND1
DHT1 -> GND1
LDR1 -> GND1
PIR1 -> GND1
LED1 -> GND1
SERVO1 -> GND1
RELAY1 -> GND1
LCD1 -> GND1
POT1 -> GND1

// Sensor inputs to Arduino
DHT1 -> ARDUINO1  // Temperature/Humidity data
LDR1 -> ARDUINO1  // Light level
PIR1 -> ARDUINO1  // Motion detection
POT1 -> ARDUINO1  // Manual override

// Arduino outputs to actuators
ARDUINO1 -> LED1  // RGB lighting control
ARDUINO1 -> SERVO1 // Blind position control
ARDUINO1 -> RELAY1 // Fan on/off control
ARDUINO1 -> LCD1  // Status display

// Virtual environment
LIGHT1: virtual_light (100, 250) // Simulated sunlight
WALL1: virtual_wall (300, 320) // Room wall

// Note:
// DHT22 monitors temperature and humidity
// LDR adjusts lighting based on ambient light
// PIR sensor detects occupancy for automation
// Manual control via potentiometer override
// LCD displays system status and sensor readings`;
            break;
    }

    editor.setValue(code);
    
    // Auto-generate after loading example
    setTimeout(() => {
        generateCircuit();
    }, 500);
}

// Insert component code at cursor position
function insertComponent(componentType) {
    const componentCodes = {
        resistor: 'R1: resistor 1k',
        capacitor: 'C1: capacitor 100uF',
        inductor: 'L1: inductor 10mH',
        led: 'LED1: led red',
        battery: 'V1: battery 9V',
        ground: 'GND1: ground',
        switch: 'SW1: switch',
        transistor: 'Q1: npn',
        // Arduino Boards
        arduino_uno: 'ARDUINO1: arduino_uno',
        arduino_nano: 'NANO1: arduino_nano',
        arduino_mega: 'MEGA1: arduino_mega',
        esp32: 'ESP32_1: esp32',
        esp32_cam: 'CAM1: esp32_cam',
        esp8266: 'ESP1: esp8266',
        // Sensors
        ultrasonic: 'HC1: ultrasonic HC-SR04',
        dht11: 'DHT1: dht11',
        dht22: 'DHT2: dht22',
        pir: 'PIR1: pir',
        ir_sensor: 'IR1: ir_sensor',
        accelerometer: 'ACC1: accelerometer MPU6050',
        gyro: 'GYRO1: gyro MPU6050',
        ldr: 'LDR1: ldr',
        // Actuators
        servo: 'SERVO1: servo SG90',
        dc_motor: 'M1: dc_motor',
        stepper: 'STEP1: stepper 28BYJ48',
        relay: 'RELAY1: relay 5V',
        buzzer: 'BUZZ1: buzzer',
        rgb_led: 'RGB1: rgb_led',
        // Display & Input
        lcd: 'LCD1: lcd 16x2',
        oled: 'OLED1: oled 128x64',
        '7segment': 'SEG1: 7segment',
        potentiometer: 'POT1: potentiometer 10k',
        pushbutton: 'BTN1: pushbutton',
        // Virtual Objects
        virtual_wall: 'WALL1: virtual_wall',
        virtual_obstacle: 'OBJ1: virtual_obstacle',
        virtual_target: 'TARGET1: virtual_target',
        virtual_light: 'LIGHT1: virtual_light'
    };

    const code = componentCodes[componentType] || componentType;
    const cursor = editor.getCursor();
    
    editor.replaceRange('\n' + code + '\n', cursor);
    editor.focus();
    
    // Auto-generate after inserting component
    setTimeout(() => {
        generateCircuit();
    }, 500);
}

// Clear editor
function clearEditor() {
    if (confirm('Are you sure you want to clear the circuit code?')) {
        editor.setValue('');
        document.getElementById('circuit-svg').innerHTML = `
            <text x="400" y="300" text-anchor="middle" class="placeholder-text">
                Your circuit diagram will appear here
            </text>
        `;
    }
}

// Export SVG
function exportSVG() {
    try {
        circuitEngine.exportSVG();
        showMessage('Circuit exported as SVG successfully', 'success');
    } catch (error) {
        showMessage('Error exporting SVG: ' + error.message, 'error');
    }
}

// Export PNG
function exportPNG() {
    try {
        circuitEngine.exportPNG();
        showMessage('Circuit exported as PNG successfully', 'success');
    } catch ( error) {
        showMessage('Error exporting PNG: ' + error.message, 'error');
    }
}

// Zoom functions
function zoomIn() {
    circuitEngine.zoomIn();
}

function zoomOut() {
    circuitEngine.zoomOut();
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Add to page (after header)
    const header = document.querySelector('.header');
    header.insertAdjacentElement('afterend', messageDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to export SVG
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportSVG();
    }
    
    // Ctrl/Cmd + P to export PNG
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        exportPNG();
    }
    
    // Ctrl/Cmd + L to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearEditor();
    }
});

// Circuit code validation and syntax highlighting
function validateCircuitCode(code) {
    const errors = [];
    const lines = code.split('\n');
    const componentNames = new Set();
    const connections = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('//')) return;

        // Component syntax validation
        const componentMatch = trimmed.match(/^(\w+):\s*(\w+)(?:\s+([\w.]+))?(?:\s+\((\d+),\s*(\d+)\))?$/);
        if (componentMatch) {
            const [, name, type, value, x, y] = componentMatch;
            
            // Check for duplicate component names
            if (componentNames.has(name)) {
                errors.push(`Line ${index + 1}: Duplicate component name '${name}'`);
            }
            componentNames.add(name);
            
            // Validate component type
            const validTypes = [
                'resistor', 'capacitor', 'inductor', 'led', 'battery', 'ground', 'switch', 'npn', 'transistor',
                // Arduino Boards
                'arduino_uno', 'arduino_nano', 'arduino_mega', 'esp32', 'esp32_cam', 'esp8266',
                // Sensors
                'ultrasonic', 'dht11', 'dht22', 'pir', 'ir_sensor', 'accelerometer', 'gyro', 'ldr',
                // Actuators
                'servo', 'dc_motor', 'stepper', 'relay', 'buzzer', 'rgb_led',
                // Display & Input
                'lcd', 'oled', '7segment', 'potentiometer', 'pushbutton',
                // Virtual Objects
                'virtual_wall', 'virtual_obstacle', 'virtual_target', 'virtual_light'
            ];
            if (!validTypes.includes(type.toLowerCase())) {
                errors.push(`Line ${index + 1}: Unknown component type '${type}'`);
            }
            
            return;
        }

        // Connection syntax validation
        const connectionMatch = trimmed.match(/^(\w+)\s*->\s*(\w+)$/);
        if (connectionMatch) {
            const [, from, to] = connectionMatch;
            connections.push({ from, to, line: index + 1 });
            return;
        }

        errors.push(`Line ${index + 1}: Invalid syntax`);
    });

    // Check if connections reference valid components
    connections.forEach(conn => {
        if (!componentNames.has(conn.from)) {
            errors.push(`Line ${conn.line}: Component '${conn.from}' not found`);
        }
        if (!componentNames.has(conn.to)) {
            errors.push(`Line ${conn.line}: Component '${conn.to}' not found`);
        }
    });

    return errors;
}

// Advanced circuit templates
const advancedTemplates = {
    oscillator: `// RC Oscillator Circuit
VCC: battery 9V (50, 100)
R1: resistor 10k (150, 100)
R2: resistor 10k (250, 100)
C1: capacitor 100nF (350, 100)
Q1: npn (450, 100)
C2: capacitor 10uF (550, 100)
GND: ground (200, 200)

VCC -> R1
R1 -> R2
R2 -> C1
C1 -> Q1
Q1 -> C2
C2 -> GND`,

    voltageDivider: `// Voltage Divider
VIN: battery 12V (50, 100)
R1: resistor 10k (150, 100)
R2: resistor 10k (250, 100)
R3: resistor 10k (350, 100)
GND: ground (450, 200)

VIN -> R1
R1 -> R2
R2 -> R3
R3 -> GND`,

    rectifier: `// Full Wave Bridge Rectifier
AC1: battery 12V (50, 100)
D1: led red (150, 50)
D2: led red (150, 150)
D3: led red (250, 50)
D4: led red (250, 150)
C1: capacitor 1000uF (350, 100)
R1: resistor 1k (450, 100)
GND: ground (400, 200)

AC1 -> D1
AC1 -> D2
D1 -> D3
D2 -> D4
D3 -> C1
D4 -> C1
C1 -> R1
R1 -> GND`,

    // Arduino Templates
    arduino_ultrasonic: `// Arduino Ultrasonic Distance Sensor
ARDUINO1: arduino_uno (100, 100)
HC1: ultrasonic HC-SR04 (300, 100)
GND1: ground (400, 200)
VCC1: battery 5V (100, 200)

// Power connections
VCC1 -> HC1
HC1 -> GND1

// Arduino connections
ARDUINO1 -> HC1  // Trigger pin
ARDUINO1 -> HC1  // Echo pin

// Note:
// HC-SR04 VCC to 5V
// HC-SR04 GND to ground
// HC-SR04 Trig to Arduino pin 9
// HC-SR04 Echo to Arduino pin 10`,

    arduino_servo: `// Arduino Servo Motor Control
ARDUINO1: arduino_uno (100, 100)
SERVO1: servo SG90 (300, 100)
GND1: ground (400, 200)
VCC1: battery 5V (100, 200)

// Power connections
VCC1 -> SERVO1
SERVO1 -> GND1

// Control signal
ARDUINO1 -> SERVO1

// Note:
// Servo VCC to 5V
// Servo GND to ground
// Servo signal to Arduino pin 9`,

    arduino_lcd: `// Arduino LCD 16x2 Display
ARDUINO1: arduino_uno (50, 100)
LCD1: lcd 16x2 (200, 100)
POT1: potentiometer 10k (100, 200)
GND1: ground (50, 250)
VCC1: battery 5V (50, 150)

// Power connections
VCC1 -> LCD1
LCD1 -> GND1
VCC1 -> POT1
POT1 -> GND1

// LCD connections
ARDUINO1 -> LCD1
POT1 -> LCD1

// Note:
// LCD RS to Arduino pin 12
// LCD Enable to Arduino pin 11
// LCD D4-D7 to Arduino pins 5-8
// LCD contrast via POT1`,

    arduino_relay: `// Arduino Relay Control
ARDUINO1: arduino_uno (100, 100)
RELAY1: relay 5V (300, 100)
D1: led red (250, 50) // Relay indicator
Q1: npn (200, 100)
R1: resistor 1k (150, 100)
D2: led green (350, 150) // Load indicator
GND1: ground (400, 200)
VCC1: battery 5V (100, 200)
VCC2: battery 12V (450, 100) // External power

// Arduino control
ARDUINO1 -> R1
R1 -> Q1

// Relay circuit
VCC1 -> RELAY1
RELAY1 -> Q1
Q1 -> D1
Q1 -> GND1

// External circuit
VCC2 -> D2
D2 -> GND1

// Note:
// Relay coil controlled by Arduino pin 7
// External load (12V) controlled by relay contacts`,

    arduino_rgb: `// Arduino RGB LED Control
ARDUINO1: arduino_uno (100, 100)
RGB1: rgb_led (300, 100)
R1: resistor 220 (200, 80) // Red current limit
R2: resistor 220 (200, 100) // Green current limit
R3: resistor 220 (200, 120) // Blue current limit
GND1: ground (400, 200)
VCC1: battery 5V (100, 200)

// Power
VCC1 -> RGB1

// Arduino PWM control
ARDUINO1 -> R1
ARDUINO1 -> R2
ARDUINO1 -> R3

// Current limiting resistors
R1 -> RGB1  // Red
R2 -> RGB1  // Green
R3 -> RGB1  // Blue

RGB1 -> GND1

// Note:
// Red via Arduino pin 9 (PWM)
// Green via Arduino pin 10 (PWM)
// Blue via Arduino pin 11 (PWM)
// Common cathode RGB LED`
};

// Load advanced template
function loadAdvancedTemplate(templateName) {
    if (advancedTemplates[templateName]) {
        editor.setValue(advancedTemplates[templateName]);
        setTimeout(() => {
            generateCircuit();
        }, 500);
    }
}

// Circuit analysis utilities
function analyzeCircuit() {
    const code = editor.getValue();
    const errors = validateCircuitCode(code);
    
    if (errors.length > 0) {
        showMessage('Circuit validation found issues:\n' + errors.join('\n'), 'error');
        return false;
    }
    
    const { components, connections } = circuitEngine.parseCircuitCode(code);
    
    // Simple circuit analysis
    const analysis = {
        components: components.length,
        connections: connections.length,
        types: {}
    };
    
    components.forEach(comp => {
        analysis.types[comp.type] = (analysis.types[comp.type] || 0) + 1;
    });
    
    showMessage(`Circuit Analysis:\n${analysis.components} components, ${analysis.connections} connections\nComponents by type: ${JSON.stringify(analysis.types)}`, 'success');
    
    return analysis;
}

// Add circuit analysis to global scope
window.analyzeCircuit = analyzeCircuit;
window.loadAdvancedTemplate = loadAdvancedTemplate;