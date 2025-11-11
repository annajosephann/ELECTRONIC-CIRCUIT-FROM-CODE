// AI Circuit Designer Engine
// Handles parsing circuit code and generating SVG diagrams

class CircuitEngine {
    constructor() {
        this.components = [];
        this.connections = [];
        this.svgCanvas = null;
        this.zoom = 1;
    }

    // Parse circuit code and extract components and connections
    parseCircuitCode(code) {
        this.components = [];
        this.connections = [];
        
        if (!code.trim()) {
            throw new Error('Please enter circuit code');
        }

        const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
        
        for (const line of lines) {
            this.parseLine(line.trim());
        }

        if (this.components.length === 0) {
            throw new Error('No valid components found in code');
        }

        return { components: this.components, connections: this.connections };
    }

    // Parse individual line of circuit code
    parseLine(line) {
        // Component syntax: NAME: TYPE [VALUE] [POSITION]
        const componentMatch = line.match(/^(\w+):\s*(\w+)(?:\s+([\w.]+))?(?:\s+\((\d+),\s*(\d+)\))?$/);
        
        if (componentMatch) {
            const [, name, type, value, x, y] = componentMatch;
            this.components.push({
                name,
                type: type.toLowerCase(),
                value: value || '',
                x: parseInt(x) || this.autoPosition(),
                y: parseInt(y) || this.autoPosition()
            });
            return;
        }

        // Connection syntax: COMPONENT1 -> COMPONENT2
        const connectionMatch = line.match(/^(\w+)\s*->\s*(\w+)$/);
        if (connectionMatch) {
            const [, from, to] = connectionMatch;
            this.connections.push({ from, to });
            return;
        }

        // Auto-connection (implicit series connection)
        if (this.components.length > 0 && !line.includes('->')) {
            const lastComponent = this.components[this.components.length - 1];
            if (componentMatch) {
                const currentComponent = this.components[this.components.length];
                if (currentComponent) {
                    this.connections.push({ 
                        from: lastComponent.name, 
                        to: currentComponent.name 
                    });
                }
            }
        }
    }

    // Auto-position components in a grid
    autoPosition() {
        const gridSize = 100;
        const cols = 7;
        const index = this.components.length;
        return {
            x: 100 + (index % cols) * gridSize,
            y: 100 + Math.floor(index / cols) * gridSize
        };
    }

    // Generate SVG circuit diagram
    generateCircuit(components, connections) {
        const svg = document.getElementById('circuit-svg');
        svg.innerHTML = '';

        // Add grid background
        this.addGrid(svg);

        // Draw connections first (so they appear behind components)
        connections.forEach(conn => {
            this.drawConnection(svg, conn, components);
        });

        // Draw components
        components.forEach(comp => {
            this.drawComponent(svg, comp);
        });

        return svg;
    }

    // Add grid background to SVG
    addGrid(svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'grid');
        pattern.setAttribute('width', '20');
        pattern.setAttribute('height', '20');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');

        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '0');
        line1.setAttribute('y1', '0');
        line1.setAttribute('x2', '0');
        line1.setAttribute('y2', '20');
        line1.setAttribute('stroke', '#e0e0e0');
        line1.setAttribute('stroke-width', '0.5');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '0');
        line2.setAttribute('y1', '0');
        line2.setAttribute('x2', '20');
        line2.setAttribute('y2', '0');
        line2.setAttribute('stroke', '#e0e0e0');
        line2.setAttribute('stroke-width', '0.5');

        pattern.appendChild(line1);
        pattern.appendChild(line2);
        defs.appendChild(pattern);
        svg.appendChild(defs);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'url(#grid)');
        svg.appendChild(rect);
    }

    // Draw connection between components
    drawConnection(svg, connection, components) {
        const fromComp = components.find(c => c.name === connection.from);
        const toComp = components.find(c => c.name === connection.to);

        if (!fromComp || !toComp) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromComp.x + 40);
        line.setAttribute('y1', fromComp.y + 20);
        line.setAttribute('x2', toComp.x);
        line.setAttribute('y2', toComp.y + 20);
        line.setAttribute('class', 'circuit-wire');
        
        svg.appendChild(line);

        // Add connection dots
        this.addConnectionDot(svg, fromComp.x + 40, fromComp.y + 20);
        this.addConnectionDot(svg, toComp.x, toComp.y + 20);
    }

    // Add connection dot
    addConnectionDot(svg, x, y) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '3');
        circle.setAttribute('class', 'circuit-terminal');
        svg.appendChild(circle);
    }

    // Draw individual component
    drawComponent(svg, component) {
        switch (component.type) {
            case 'resistor':
                this.drawResistor(svg, component);
                break;
            case 'capacitor':
                this.drawCapacitor(svg, component);
                break;
            case 'inductor':
                this.drawInductor(svg, component);
                break;
            case 'led':
                this.drawLED(svg, component);
                break;
            case 'battery':
                this.drawBattery(svg, component);
                break;
            case 'ground':
                this.drawGround(svg, component);
                break;
            case 'switch':
                this.drawSwitch(svg, component);
                break;
            case 'npn':
            case 'transistor':
                this.drawTransistor(svg, component);
                break;
            // Arduino Boards
            case 'arduino_uno':
                this.drawArduinoUno(svg, component);
                break;
            case 'arduino_nano':
                this.drawArduinoNano(svg, component);
                break;
            case 'arduino_mega':
                this.drawArduinoMega(svg, component);
                break;
            case 'esp32':
                this.drawESP32(svg, component);
                break;
            case 'esp32_cam':
                this.drawESP32CAM(svg, component);
                break;
            case 'esp8266':
                this.drawESP8266(svg, component);
                break;
            // Sensors
            case 'ultrasonic':
                this.drawUltrasonic(svg, component);
                break;
            case 'dht11':
                this.drawDHT11(svg, component);
                break;
            case 'dht22':
                this.drawDHT22(svg, component);
                break;
            case 'pir':
                this.drawPIR(svg, component);
                break;
            case 'ir_sensor':
                this.drawIRSensor(svg, component);
                break;
            case 'accelerometer':
                this.drawAccelerometer(svg, component);
                break;
            case 'gyro':
                this.drawGyro(svg, component);
                break;
            case 'ldr':
                this.drawLDR(svg, component);
                break;
            // Actuators
            case 'servo':
                this.drawServo(svg, component);
                break;
            case 'dc_motor':
                this.drawDCMotor(svg, component);
                break;
            case 'stepper':
                this.drawStepper(svg, component);
                break;
            case 'relay':
                this.drawRelay(svg, component);
                break;
            case 'buzzer':
                this.drawBuzzer(svg, component);
                break;
            case 'rgb_led':
                this.drawRGBLED(svg, component);
                break;
            // Display & Input
            case 'lcd':
                this.drawLCD(svg, component);
                break;
            case 'oled':
                this.drawOLED(svg, component);
                break;
            case '7segment':
                this.draw7Segment(svg, component);
                break;
            case 'potentiometer':
                this.drawPotentiometer(svg, component);
                break;
            case 'pushbutton':
                this.drawPushButton(svg, component);
                break;
            // Virtual Objects
            case 'virtual_wall':
                this.drawVirtualWall(svg, component);
                break;
            case 'virtual_obstacle':
                this.drawVirtualObstacle(svg, component);
                break;
            case 'virtual_target':
                this.drawVirtualTarget(svg, component);
                break;
            case 'virtual_light':
                this.drawVirtualLight(svg, component);
                break;
            default:
                this.drawGenericComponent(svg, component);
        }
    }

    // Draw resistor symbol
    drawResistor(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Zigzag pattern
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 0 20 L 10 20 L 15 10 L 25 30 L 35 10 L 45 30 L 55 10 L 65 30 L 70 20 L 80 20');
        path.setAttribute('class', 'circuit-component');
        g.appendChild(path);

        // Component label
        this.addLabel(g, component.name, component.value, 40, 50);
        svg.appendChild(g);
    }

    // Draw capacitor symbol
    drawCapacitor(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Two parallel lines
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '30');
        line1.setAttribute('y1', '5');
        line1.setAttribute('x2', '30');
        line1.setAttribute('y2', '35');
        line1.setAttribute('class', 'circuit-component');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '50');
        line2.setAttribute('y1', '5');
        line2.setAttribute('x2', '50');
        line2.setAttribute('y2', '35');
        line2.setAttribute('class', 'circuit-component');

        // Connection lines
        const conn1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn1.setAttribute('x1', '0');
        conn1.setAttribute('y1', '20');
        conn1.setAttribute('x2', '30');
        conn1.setAttribute('y2', '20');
        conn1.setAttribute('class', 'circuit-wire');

        const conn2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn2.setAttribute('x1', '50');
        conn2.setAttribute('y1', '20');
        conn2.setAttribute('x2', '80');
        conn2.setAttribute('y2', '20');
        conn2.setAttribute('class', 'circuit-wire');

        g.appendChild(line1);
        g.appendChild(line2);
        g.appendChild(conn1);
        g.appendChild(conn2);

        this.addLabel(g, component.name, component.value, 40, 50);
        svg.appendChild(g);
    }

    // Draw inductor symbol
    drawInductor(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Coil loops
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 0 20 L 10 20 Q 15 10, 20 20 T 30 20 T 40 20 T 50 20 T 60 20 L 80 20');
        path.setAttribute('class', 'circuit-component');
        g.appendChild(path);

        this.addLabel(g, component.name, component.value, 40, 50);
        svg.appendChild(g);
    }

    // Draw LED symbol
    drawLED(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Diode triangle
        const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        triangle.setAttribute('d', 'M 20 10 L 20 30 L 50 20 Z');
        triangle.setAttribute('class', 'circuit-component');
        triangle.setAttribute('fill', 'none');

        // Cathode line
        const cathode = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        cathode.setAttribute('x1', '50');
        cathode.setAttribute('y1', '8');
        cathode.setAttribute('x2', '50');
        cathode.setAttribute('y2', '32');
        cathode.setAttribute('class', 'circuit-component');

        // Light arrows
        const arrow1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow1.setAttribute('d', 'M 30 5 L 35 0 L 35 3 L 45 3 L 45 7 L 35 7 L 35 10 Z');
        arrow1.setAttribute('class', 'circuit-component');
        arrow1.setAttribute('fill', '#fbbf24');

        const arrow2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow2.setAttribute('d', 'M 40 10 L 45 5 L 45 8 L 55 8 L 55 12 L 45 12 L 45 15 Z');
        arrow2.setAttribute('class', 'circuit-component');
        arrow2.setAttribute('fill', '#fbbf24');

        // Connection lines
        const conn1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn1.setAttribute('x1', '0');
        conn1.setAttribute('y1', '20');
        conn1.setAttribute('x2', '20');
        conn1.setAttribute('y2', '20');
        conn1.setAttribute('class', 'circuit-wire');

        const conn2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn2.setAttribute('x1', '50');
        conn2.setAttribute('y1', '20');
        conn2.setAttribute('x2', '80');
        conn2.setAttribute('y2', '20');
        conn2.setAttribute('class', 'circuit-wire');

        g.appendChild(triangle);
        g.appendChild(cathode);
        g.appendChild(arrow1);
        g.appendChild(arrow2);
        g.appendChild(conn1);
        g.appendChild(conn2);

        this.addLabel(g, component.name, component.value, 40, 50);
        svg.appendChild(g);
    }

    // Draw battery symbol
    drawBattery(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Positive terminal (longer line)
        const posTerminal = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        posTerminal.setAttribute('x1', '25');
        posTerminal.setAttribute('y1', '10');
        posTerminal.setAttribute('x2', '25');
        posTerminal.setAttribute('y2', '30');
        posTerminal.setAttribute('class', 'circuit-component');
        posTerminal.setAttribute('stroke-width', '3');

        // Negative terminal (shorter line)
        const negTerminal = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        negTerminal.setAttribute('x1', '55');
        negTerminal.setAttribute('y1', '15');
        negTerminal.setAttribute('x2', '55');
        negTerminal.setAttribute('y2', '25');
        negTerminal.setAttribute('class', 'circuit-component');

        // Connection lines
        const conn1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn1.setAttribute('x1', '0');
        conn1.setAttribute('y1', '20');
        conn1.setAttribute('x2', '25');
        conn1.setAttribute('y2', '20');
        conn1.setAttribute('class', 'circuit-wire');

        const conn2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn2.setAttribute('x1', '55');
        conn2.setAttribute('y1', '20');
        conn2.setAttribute('x2', '80');
        conn2.setAttribute('y2', '20');
        conn2.setAttribute('class', 'circuit-wire');

        // Plus sign
        const plus = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        plus.setAttribute('x', '20');
        plus.setAttribute('y', '8');
        plus.setAttribute('class', 'circuit-text');
        plus.setAttribute('font-weight', 'bold');
        plus.textContent = '+';

        g.appendChild(posTerminal);
        g.appendChild(negTerminal);
        g.appendChild(conn1);
        g.appendChild(conn2);
        g.appendChild(plus);

        this.addLabel(g, component.name, component.value, 40, 50);
        svg.appendChild(g);
    }

    // Draw ground symbol
    drawGround(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Vertical line
        const vline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vline.setAttribute('x1', '40');
        vline.setAttribute('y1', '0');
        vline.setAttribute('x2', '40');
        vline.setAttribute('y2', '20');
        vline.setAttribute('class', 'circuit-component');

        // Ground lines (horizontal, getting smaller)
        const gline1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gline1.setAttribute('x1', '25');
        gline1.setAttribute('y1', '20');
        gline1.setAttribute('x2', '55');
        gline1.setAttribute('y2', '20');
        gline1.setAttribute('class', 'circuit-component');
        gline1.setAttribute('stroke-width', '3');

        const gline2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gline2.setAttribute('x1', '30');
        gline2.setAttribute('y1', '28');
        gline2.setAttribute('x2', '50');
        gline2.setAttribute('y2', '28');
        gline2.setAttribute('class', 'circuit-component');
        gline2.setAttribute('stroke-width', '2');

        const gline3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gline3.setAttribute('x1', '35');
        gline3.setAttribute('y1', '36');
        gline3.setAttribute('x2', '45');
        gline3.setAttribute('y2', '36');
        gline3.setAttribute('class', 'circuit-component');

        g.appendChild(vline);
        g.appendChild(gline1);
        g.appendChild(gline2);
        g.appendChild(gline3);

        this.addLabel(g, component.name, '', 40, 50);
        svg.appendChild(g);
    }

    // Draw switch symbol
    drawSwitch(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Switch contacts
        const contact1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        contact1.setAttribute('cx', '20');
        contact1.setAttribute('cy', '20');
        contact1.setAttribute('r', '3');
        contact1.setAttribute('class', 'circuit-terminal');

        const contact2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        contact2.setAttribute('cx', '60');
        contact2.setAttribute('cy', '20');
        contact2.setAttribute('r', '3');
        contact2.setAttribute('class', 'circuit-terminal');

        // Switch arm
        const arm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arm.setAttribute('x1', '23');
        arm.setAttribute('y1', '20');
        arm.setAttribute('x2', '50');
        arm.setAttribute('y2', '10');
        arm.setAttribute('class', 'circuit-component');
        arm.setAttribute('stroke-width', '3');

        // Connection lines
        const conn1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn1.setAttribute('x1', '0');
        conn1.setAttribute('y1', '20');
        conn1.setAttribute('x2', '20');
        conn1.setAttribute('y2', '20');
        conn1.setAttribute('class', 'circuit-wire');

        const conn2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn2.setAttribute('x1', '60');
        conn2.setAttribute('y1', '20');
        conn2.setAttribute('x2', '80');
        conn2.setAttribute('y2', '20');
        conn2.setAttribute('class', 'circuit-wire');

        g.appendChild(contact1);
        g.appendChild(contact2);
        g.appendChild(arm);
        g.appendChild(conn1);
        g.appendChild(conn2);

        this.addLabel(g, component.name, '', 40, 50);
        svg.appendChild(g);
    }

    // Draw NPN transistor symbol
    drawTransistor(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Base line
        const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        baseLine.setAttribute('x1', '30');
        baseLine.setAttribute('y1', '10');
        baseLine.setAttribute('x2', '30');
        baseLine.setAttribute('y2', '30');
        baseLine.setAttribute('class', 'circuit-component');
        baseLine.setAttribute('stroke-width', '3');

        // Vertical line
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', '30');
        vLine.setAttribute('y1', '15');
        vLine.setAttribute('x2', '50');
        vLine.setAttribute('y2', '5');
        vLine.setAttribute('class', 'circuit-component');

        // Collector arrow
        const collectorArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        collectorArrow.setAttribute('d', 'M 50 5 L 55 8 L 50 11');
        collectorArrow.setAttribute('class', 'circuit-component');
        collectorArrow.setAttribute('fill', 'none');

        // Emitter line with arrow
        const emitterLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        emitterLine.setAttribute('x1', '30');
        emitterLine.setAttribute('y1', '25');
        emitterLine.setAttribute('x2', '50');
        emitterLine.setAttribute('y2', '35');
        emitterLine.setAttribute('class', 'circuit-component');

        // Emitter arrow
        const emitterArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        emitterArrow.setAttribute('d', 'M 45 32 L 50 35 L 45 38');
        emitterArrow.setAttribute('class', 'circuit-component');
        emitterArrow.setAttribute('fill', 'none');

        // Connection lines
        const baseConn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        baseConn.setAttribute('x1', '0');
        baseConn.setAttribute('y1', '20');
        baseConn.setAttribute('x2', '30');
        baseConn.setAttribute('y2', '20');
        baseConn.setAttribute('class', 'circuit-wire');

        const collectorConn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        collectorConn.setAttribute('x1', '55');
        collectorConn.setAttribute('y1', '8');
        collectorConn.setAttribute('x2', '80');
        collectorConn.setAttribute('y2', '8');
        collectorConn.setAttribute('class', 'circuit-wire');

        const emitterConn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        emitterConn.setAttribute('x1', '55');
        emitterConn.setAttribute('y1', '32');
        emitterConn.setAttribute('x2', '80');
        emitterConn.setAttribute('y2', '32');
        emitterConn.setAttribute('class', 'circuit-wire');

        g.appendChild(baseLine);
        g.appendChild(vLine);
        g.appendChild(collectorArrow);
        g.appendChild(emitterLine);
        g.appendChild(emitterArrow);
        g.appendChild(baseConn);
        g.appendChild(collectorConn);
        g.appendChild(emitterConn);

        // Add labels for terminals
        const baseLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        baseLabel.setAttribute('x', '10');
        baseLabel.setAttribute('y', '15');
        baseLabel.setAttribute('class', 'circuit-text');
        baseLabel.setAttribute('font-size', '10');
        baseLabel.textContent = 'B';

        const collectorLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        collectorLabel.setAttribute('x', '65');
        collectorLabel.setAttribute('y', '5');
        collectorLabel.setAttribute('class', 'circuit-text');
        collectorLabel.setAttribute('font-size', '10');
        collectorLabel.textContent = 'C';

        const emitterLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        emitterLabel.setAttribute('x', '65');
        emitterLabel.setAttribute('y', '35');
        emitterLabel.setAttribute('class', 'circuit-text');
        emitterLabel.setAttribute('font-size', '10');
        emitterLabel.textContent = 'E';

        g.appendChild(baseLabel);
        g.appendChild(collectorLabel);
        g.appendChild(emitterLabel);

        this.addLabel(g, component.name, component.value, 40, 50);
        svg.appendChild(g);
    }

    // Draw generic component (box)
    drawGenericComponent(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Component box
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '10');
        rect.setAttribute('y', '10');
        rect.setAttribute('width', '60');
        rect.setAttribute('height', '20');
        rect.setAttribute('class', 'circuit-component');
        rect.setAttribute('fill', '#f3f4f6');

        // Connection lines
        const conn1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn1.setAttribute('x1', '0');
        conn1.setAttribute('y1', '20');
        conn1.setAttribute('x2', '10');
        conn1.setAttribute('y2', '20');
        conn1.setAttribute('class', 'circuit-wire');

        const conn2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn2.setAttribute('x1', '70');
        conn2.setAttribute('y1', '20');
        conn2.setAttribute('x2', '80');
        conn2.setAttribute('y2', '20');
        conn2.setAttribute('class', 'circuit-wire');

        // Component type text
        const typeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        typeText.setAttribute('x', '40');
        typeText.setAttribute('y', '24');
        typeText.setAttribute('class', 'circuit-text');
        typeText.setAttribute('text-anchor', 'middle');
        typeText.setAttribute('font-size', '10');
        typeText.textContent = component.type.toUpperCase();

        g.appendChild(rect);
        g.appendChild(conn1);
        g.appendChild(conn2);
        g.appendChild(typeText);

        this.addLabel(g, component.name, component.value, 40, 50);
        svg.appendChild(g);
    }

    // Draw Arduino Uno
    drawArduinoUno(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Arduino board rectangle
        const board = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        board.setAttribute('x', '0');
        board.setAttribute('y', '0');
        board.setAttribute('width', '120');
        board.setAttribute('height', '80');
        board.setAttribute('class', 'circuit-component');
        board.setAttribute('fill', '#005c5f');
        board.setAttribute('rx', '5');

        // USB port
        const usb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        usb.setAttribute('x', '-10');
        usb.setAttribute('y', '25');
        usb.setAttribute('width', '15');
        usb.setAttribute('height', '30');
        usb.setAttribute('class', 'circuit-component');
        usb.setAttribute('fill', '#c0c0c0');

        // Power jack
        const powerJack = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        powerJack.setAttribute('cx', '110');
        powerJack.setAttribute('cy', '15');
        powerJack.setAttribute('r', '8');
        powerJack.setAttribute('class', 'circuit-component');
        powerJack.setAttribute('fill', '#000');

        // Pin headers (simplified)
        for (let i = 0; i < 8; i++) {
            const pin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pin.setAttribute('x', '10 + i * 12');
            pin.setAttribute('y', '-5');
            pin.setAttribute('width', '8');
            pin.setAttribute('height', '15');
            pin.setAttribute('class', 'circuit-component');
            pin.setAttribute('fill', '#ffd700');
            g.appendChild(pin);
        }

        // Arduino label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '60');
        label.setAttribute('y', '45');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'UNO';

        this.addLabel(g, component.name, '', 60, 100);

        g.appendChild(board);
        g.appendChild(usb);
        g.appendChild(powerJack);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw Arduino Nano
    drawArduinoNano(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Nano board (smaller)
        const board = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        board.setAttribute('x', '0');
        board.setAttribute('y', '0');
        board.setAttribute('width', '80');
        board.setAttribute('height', '50');
        board.setAttribute('class', 'circuit-component');
        board.setAttribute('fill', '#00897b');
        board.setAttribute('rx', '3');

        // Mini USB
        const usb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        usb.setAttribute('x', '-8');
        usb.setAttribute('y', '15');
        usb.setAttribute('width', '12');
        usb.setAttribute('height', '20');
        usb.setAttribute('class', 'circuit-component');
        usb.setAttribute('fill', '#c0c0c0');

        // Pin headers
        for (let i = 0; i < 6; i++) {
            const pin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pin.setAttribute('x', '8 + i * 10');
            pin.setAttribute('y', '-3');
            pin.setAttribute('width', '6');
            pin.setAttribute('height', '10');
            pin.setAttribute('class', 'circuit-component');
            pin.setAttribute('fill', '#ffd700');
            g.appendChild(pin);
        }

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '40');
        label.setAttribute('y', '28');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-weight', 'bold');
        label.setAttribute('font-size', '10');
        label.textContent = 'NANO';

        this.addLabel(g, component.name, '', 40, 70);

        g.appendChild(board);
        g.appendChild(usb);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw Arduino Mega
    drawArduinoMega(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Mega board (larger)
        const board = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        board.setAttribute('x', '0');
        board.setAttribute('y', '0');
        board.setAttribute('width', '160');
        board.setAttribute('height', '100');
        board.setAttribute('class', 'circuit-component');
        board.setAttribute('fill', '#1565c0');
        board.setAttribute('rx', '5');

        // USB port
        const usb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        usb.setAttribute('x', '-10');
        usb.setAttribute('y', '30');
        usb.setAttribute('width', '15');
        usb.setAttribute('height', '40');
        usb.setAttribute('class', 'circuit-component');
        usb.setAttribute('fill', '#c0c0c0');

        // Power jack
        const powerJack = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        powerJack.setAttribute('cx', '150');
        powerJack.setAttribute('cy', '20');
        powerJack.setAttribute('r', '8');
        powerJack.setAttribute('class', 'circuit-component');
        powerJack.setAttribute('fill', '#000');

        // More pin headers
        for (let i = 0; i < 12; i++) {
            const pin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pin.setAttribute('x', '10 + i * 12');
            pin.setAttribute('y', '-5');
            pin.setAttribute('width', '8');
            pin.setAttribute('height', '15');
            pin.setAttribute('class', 'circuit-component');
            pin.setAttribute('fill', '#ffd700');
            g.appendChild(pin);
        }

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '80');
        label.setAttribute('y', '55');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'MEGA';

        this.addLabel(g, component.name, '', 80, 120);

        g.appendChild(board);
        g.appendChild(usb);
        g.appendChild(powerJack);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw ESP32
    drawESP32(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // ESP32 board
        const board = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        board.setAttribute('x', '0');
        board.setAttribute('y', '0');
        board.setAttribute('width', '100');
        board.setAttribute('height', '60');
        board.setAttribute('class', 'circuit-component');
        board.setAttribute('fill', '#4caf50');
        board.setAttribute('rx', '3');

        // ESP32 chip
        const chip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        chip.setAttribute('x', '35');
        chip.setAttribute('y', '20');
        chip.setAttribute('width', '30');
        chip.setAttribute('height', '20');
        chip.setAttribute('class', 'circuit-component');
        chip.setAttribute('fill', '#333');

        // WiFi antenna symbol
        const antenna = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        antenna.setAttribute('d', 'M 10 10 Q 20 5, 30 10 Q 20 15, 10 10');
        antenna.setAttribute('class', 'circuit-component');
        antenna.setAttribute('fill', 'none');
        antenna.setAttribute('stroke', '#ffd700');
        antenna.setAttribute('stroke-width', '2');

        // Pin headers
        for (let i = 0; i < 8; i++) {
            const pin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pin.setAttribute('x', '8 + i * 10');
            pin.setAttribute('y', '-3');
            pin.setAttribute('width', '6');
            pin.setAttribute('height', '10');
            pin.setAttribute('class', 'circuit-component');
            pin.setAttribute('fill', '#ffd700');
            g.appendChild(pin);
        }

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '50');
        label.setAttribute('y', '35');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-weight', 'bold');
        label.setAttribute('font-size', '10');
        label.textContent = 'ESP32';

        this.addLabel(g, component.name, '', 50, 80);

        g.appendChild(board);
        g.appendChild(chip);
        g.appendChild(antenna);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw ESP32-CAM
    drawESP32CAM(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // ESP32-CAM board
        const board = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        board.setAttribute('x', '0');
        board.setAttribute('y', '0');
        board.setAttribute('width', '100');
        board.setAttribute('height', '60');
        board.setAttribute('class', 'circuit-component');
        board.setAttribute('fill', '#607d8b');
        board.setAttribute('rx', '3');

        // Camera module
        const camera = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        camera.setAttribute('x', '10');
        camera.setAttribute('y', '10');
        camera.setAttribute('width', '25');
        camera.setAttribute('height', '25');
        camera.setAttribute('class', 'circuit-component');
        camera.setAttribute('fill', '#333');
        camera.setAttribute('rx', '2');

        // Camera lens
        const lens = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        lens.setAttribute('cx', '22.5');
        lens.setAttribute('cy', '22.5');
        lens.setAttribute('r', '8');
        lens.setAttribute('class', 'circuit-component');
        lens.setAttribute('fill', '#666');

        // ESP32 chip
        const chip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        chip.setAttribute('x', '50');
        chip.setAttribute('y', '20');
        chip.setAttribute('width', '25');
        chip.setAttribute('height', '20');
        chip.setAttribute('class', 'circuit-component');
        chip.setAttribute('fill', '#333');

        // LED indicator
        const led = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        led.setAttribute('cx', '85');
        led.setAttribute('cy', '15');
        led.setAttribute('r', '3');
        led.setAttribute('class', 'circuit-component');
        led.setAttribute('fill', '#ff0000');

        // Pin headers
        for (let i = 0; i < 8; i++) {
            const pin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pin.setAttribute('x', '8 + i * 10');
            pin.setAttribute('y', '50');
            pin.setAttribute('width', '6');
            pin.setAttribute('height', '10');
            pin.setAttribute('class', 'circuit-component');
            pin.setAttribute('fill', '#ffd700');
            g.appendChild(pin);
        }

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '50');
        label.setAttribute('y', '45');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-weight', 'bold');
        label.setAttribute('font-size', '10');
        label.textContent = 'ESP32-CAM';

        this.addLabel(g, component.name, '', 50, 80);

        g.appendChild(board);
        g.appendChild(camera);
        g.appendChild(lens);
        g.appendChild(chip);
        g.appendChild(led);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw ESP8266 NodeMCU
    drawESP8266(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // NodeMCU board
        const board = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        board.setAttribute('x', '0');
        board.setAttribute('y', '0');
        board.setAttribute('width', '90');
        board.setAttribute('height', '55');
        board.setAttribute('class', 'circuit-component');
        board.setAttribute('fill', '#2e7d32');
        board.setAttribute('rx', '3');

        // USB port
        const usb = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        usb.setAttribute('x', '-8');
        usb.setAttribute('y', '15');
        usb.setAttribute('width', '12');
        usb.setAttribute('height', '25');
        usb.setAttribute('class', 'circuit-component');
        usb.setAttribute('fill', '#c0c0c0');

        // ESP8266 chip
        const chip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        chip.setAttribute('x', '30');
        chip.setAttribute('y', '18');
        chip.setAttribute('width', '20');
        chip.setAttribute('height', '18');
        chip.setAttribute('class', 'circuit-component');
        chip.setAttribute('fill', '#333');

        // WiFi symbol
        const wifi = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        wifi.setAttribute('x', '75');
        wifi.setAttribute('y', '20');
        wifi.setAttribute('class', 'circuit-text');
        wifi.setAttribute('fill', '#ffd700');
        wifi.setAttribute('font-size', '12');
        wifi.textContent = '📶';

        // Pin headers on both sides
        for (let i = 0; i < 7; i++) {
            const leftPin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            leftPin.setAttribute('x', '2');
            leftPin.setAttribute('y', '5 + i * 7');
            leftPin.setAttribute('width', '5');
            leftPin.setAttribute('height', '8');
            leftPin.setAttribute('class', 'circuit-component');
            leftPin.setAttribute('fill', '#ffd700');
            g.appendChild(leftPin);

            const rightPin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rightPin.setAttribute('x', '83');
            rightPin.setAttribute('y', '5 + i * 7');
            rightPin.setAttribute('width', '5');
            rightPin.setAttribute('height', '8');
            rightPin.setAttribute('class', 'circuit-component');
            rightPin.setAttribute('fill', '#ffd700');
            g.appendChild(rightPin);
        }

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '45');
        label.setAttribute('y', '32');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-weight', 'bold');
        label.setAttribute('font-size', '9');
        label.textContent = 'NodeMCU';

        this.addLabel(g, component.name, '', 45, 75);

        g.appendChild(board);
        g.appendChild(usb);
        g.appendChild(chip);
        g.appendChild(wifi);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw DHT22 Sensor
    drawDHT22(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // DHT22 body (larger than DHT11)
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', '0');
        body.setAttribute('y', '0');
        body.setAttribute('width', '50');
        body.setAttribute('height', '25');
        body.setAttribute('class', 'circuit-component');
        body.setAttribute('fill', '#0066cc');
        body.setAttribute('rx', '2');

        // Ventilation holes
        for (let i = 0; i < 3; i++) {
            const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            hole.setAttribute('cx', '10 + i * 15');
            hole.setAttribute('cy', '12');
            hole.setAttribute('r', '2');
            hole.setAttribute('class', 'circuit-component');
            hole.setAttribute('fill', '#333');
            g.appendChild(hole);
        }

        // Pins
        const pins = ['VCC', 'Data', 'NC', 'GND'];
        pins.forEach((pin, i) => {
            const pinRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pinRect.setAttribute('x', '5 + i * 10');
            pinRect.setAttribute('y', '20');
            pinRect.setAttribute('width', '4');
            pinRect.setAttribute('height', '8');
            pinRect.setAttribute('class', 'circuit-component');
            pinRect.setAttribute('fill', '#ffd700');
            g.appendChild(pinRect);
        });

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '25');
        label.setAttribute('y', '15');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-size', '9');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'DHT22';

        this.addLabel(g, component.name, '', 25, 45);

        g.appendChild(body);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw PIR Motion Sensor
    drawPIR(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // PIR sensor body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', '0');
        body.setAttribute('y', '0');
        body.setAttribute('width', '60');
        body.setAttribute('height', '35');
        body.setAttribute('class', 'circuit-component');
        body.setAttribute('fill', '#fff');
        body.setAttribute('stroke', '#333');
        body.setAttribute('stroke-width', '2');
        body.setAttribute('rx', '3');

        // PIR dome
        const dome = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dome.setAttribute('cx', '30');
        dome.setAttribute('cy', '15');
        dome.setAttribute('r', '10');
        dome.setAttribute('class', 'circuit-component');
        dome.setAttribute('fill', '#ff6b6b');
        dome.setAttribute('opacity', '0.7');

        // Sensing area lines
        for (let angle = -30; angle <= 30; angle += 15) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '30');
            line.setAttribute('y1', '15');
            line.setAttribute('x2', 30 + Math.cos(angle * Math.PI / 180) * 15);
            line.setAttribute('y2', 15 + Math.sin(angle * Math.PI / 180) * 15);
            line.setAttribute('class', 'circuit-component');
            line.setAttribute('stroke', '#ff6b6b');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0.5');
            g.appendChild(line);
        }

        // Pins
        const pins = ['VCC', 'OUT', 'GND'];
        pins.forEach((pin, i) => {
            const pinRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pinRect.setAttribute('x', '10 + i * 15');
            pinRect.setAttribute('y', '30');
            pinRect.setAttribute('width', '6');
            pinRect.setAttribute('height', '8');
            pinRect.setAttribute('class', 'circuit-component');
            pinRect.setAttribute('fill', '#ffd700');
            g.appendChild(pinRect);
        });

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '30');
        label.setAttribute('y', '20');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '8');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'PIR';

        this.addLabel(g, component.name, '', 30, 55);

        g.appendChild(body);
        g.appendChild(dome);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw Virtual Wall
    drawVirtualWall(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Wall with brick pattern
        const wall = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        wall.setAttribute('x', '0');
        wall.setAttribute('y', '0');
        wall.setAttribute('width', '60');
        wall.setAttribute('height', '40');
        wall.setAttribute('class', 'circuit-component');
        wall.setAttribute('fill', '#8b4513');
        wall.setAttribute('stroke', '#654321');
        wall.setAttribute('stroke-width', '2');

        // Brick lines
        for (let i = 0; i < 4; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', i * 10);
            line.setAttribute('x2', '60');
            line.setAttribute('y2', i * 10);
            line.setAttribute('class', 'circuit-component');
            line.setAttribute('stroke', '#654321');
            line.setAttribute('stroke-width', '1');
            g.appendChild(line);
        }

        this.addLabel(g, component.name, '', 30, 55);
        g.appendChild(wall);
        svg.appendChild(g);
    }

    // Draw Virtual Obstacle
    drawVirtualObstacle(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Obstacle circle
        const obstacle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        obstacle.setAttribute('cx', '30');
        obstacle.setAttribute('cy', '20');
        obstacle.setAttribute('r', '20');
        obstacle.setAttribute('class', 'circuit-component');
        obstacle.setAttribute('fill', '#ff6b6b');
        obstacle.setAttribute('stroke', '#dc3545');
        obstacle.setAttribute('stroke-width', '3');

        // Warning symbol
        const warning = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        warning.setAttribute('x', '30');
        warning.setAttribute('y', '25');
        warning.setAttribute('class', 'circuit-text');
        warning.setAttribute('text-anchor', 'middle');
        warning.setAttribute('fill', 'white');
        warning.setAttribute('font-weight', 'bold');
        warning.setAttribute('font-size', '16');
        warning.textContent = '!';

        this.addLabel(g, component.name, '', 30, 55);
        g.appendChild(obstacle);
        g.appendChild(warning);
        svg.appendChild(g);
    }

    // Draw Virtual Target
    drawVirtualTarget(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Target circles
        for (let i = 3; i > 0; i--) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '30');
            circle.setAttribute('cy', '20');
            circle.setAttribute('r', i * 8);
            circle.setAttribute('class', 'circuit-component');
            circle.setAttribute('fill', i % 2 === 0 ? '#4ecdc4' : 'white');
            circle.setAttribute('stroke', '#4ecdc4');
            circle.setAttribute('stroke-width', '2');
            g.appendChild(circle);
        }

        this.addLabel(g, component.name, '', 30, 55);
        svg.appendChild(g);
    }

    // Draw Virtual Light
    drawVirtualLight(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Light bulb
        const bulb = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bulb.setAttribute('cx', '30');
        bulb.setAttribute('cy', '20');
        bulb.setAttribute('r', '15');
        bulb.setAttribute('class', 'circuit-component');
        bulb.setAttribute('fill', '#ffd700');
        bulb.setAttribute('stroke', '#ffb300');
        bulb.setAttribute('stroke-width', '2');

        // Light rays
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
            const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            ray.setAttribute('x1', 30 + Math.cos(angle) * 18);
            ray.setAttribute('y1', 20 + Math.sin(angle) * 18);
            ray.setAttribute('x2', 30 + Math.cos(angle) * 28);
            ray.setAttribute('y2', 20 + Math.sin(angle) * 28);
            ray.setAttribute('class', 'circuit-component');
            ray.setAttribute('stroke', '#ffd700');
            ray.setAttribute('stroke-width', '3');
            g.appendChild(ray);
        }

        this.addLabel(g, component.name, '', 30, 55);
        g.appendChild(bulb);
        svg.appendChild(g);
    }

    // Draw Ultrasonic Sensor
    drawUltrasonic(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Sensor body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', '0');
        body.setAttribute('y', '0');
        body.setAttribute('width', '50');
        body.setAttribute('height', '25');
        body.setAttribute('class', 'circuit-component');
        body.setAttribute('fill', '#0066cc');
        body.setAttribute('rx', '3');

        // Ultrasonic transducers
        const transducer1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        transducer1.setAttribute('cx', '12');
        transducer1.setAttribute('cy', '12');
        transducer1.setAttribute('r', '8');
        transducer1.setAttribute('class', 'circuit-component');
        transducer1.setAttribute('fill', '#silver');

        const transducer2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        transducer2.setAttribute('cx', '38');
        transducer2.setAttribute('cy', '12');
        transducer2.setAttribute('r', '8');
        transducer2.setAttribute('class', 'circuit-component');
        transducer2.setAttribute('fill', '#silver');

        // Pins
        const pins = ['VCC', 'Trig', 'Echo', 'GND'];
        pins.forEach((pin, i) => {
            const pinRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pinRect.setAttribute('x', '5 + i * 10');
            pinRect.setAttribute('y', '20');
            pinRect.setAttribute('width', '6');
            pinRect.setAttribute('height', '10');
            pinRect.setAttribute('class', 'circuit-component');
            pinRect.setAttribute('fill', '#ffd700');
            g.appendChild(pinRect);
        });

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '25');
        label.setAttribute('y', '15');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-size', '10');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'HC-SR04';

        this.addLabel(g, component.name, '', 25, 50);

        g.appendChild(body);
        g.appendChild(transducer1);
        g.appendChild(transducer2);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw DHT11 Sensor
    drawDHT11(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Sensor body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', '0');
        body.setAttribute('y', '0');
        body.setAttribute('width', '40');
        body.setAttribute('height', '20');
        body.setAttribute('class', 'circuit-component');
        body.setAttribute('fill', '#0066cc');
        body.setAttribute('rx', '2');

        // Pins
        const pins = ['VCC', 'Data', 'NC', 'GND'];
        pins.forEach((pin, i) => {
            const pinRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pinRect.setAttribute('x', '5 + i * 8');
            pinRect.setAttribute('y', '15');
            pinRect.setAttribute('width', '4');
            pinRect.setAttribute('height', '8');
            pinRect.setAttribute('class', 'circuit-component');
            pinRect.setAttribute('fill', '#ffd700');
            g.appendChild(pinRect);
        });

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '20');
        label.setAttribute('y', '13');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-size', '9');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'DHT11';

        this.addLabel(g, component.name, '', 20, 40);

        g.appendChild(body);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw LDR (Light Dependent Resistor)
    drawLDR(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // LDR symbol (resistor with arrows)
        const resistorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        resistorPath.setAttribute('d', 'M 0 20 L 10 20 L 15 10 L 25 30 L 35 10 L 45 30 L 55 10 L 65 30 L 70 20 L 80 20');
        resistorPath.setAttribute('class', 'circuit-component');
        g.appendChild(resistorPath);

        // Light arrows
        const arrow1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow1.setAttribute('d', 'M 20 0 L 25 -5 L 25 -2 L 35 -2 L 35 2 L 25 2 L 25 5 Z');
        arrow1.setAttribute('class', 'circuit-component');
        arrow1.setAttribute('fill', '#fbbf24');

        const arrow2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow2.setAttribute('d', 'M 50 0 L 55 -5 L 55 -2 L 65 -2 L 65 2 L 55 2 L 55 5 Z');
        arrow2.setAttribute('class', 'circuit-component');
        arrow2.setAttribute('fill', '#fbbf24');

        g.appendChild(arrow1);
        g.appendChild(arrow2);

        this.addLabel(g, component.name, component.value, 40, 50);
        svg.appendChild(g);
    }

    // Draw Servo Motor
    drawServo(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Servo body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', '0');
        body.setAttribute('y', '0');
        body.setAttribute('width', '60');
        body.setAttribute('height', '40');
        body.setAttribute('class', 'circuit-component');
        body.setAttribute('fill', '#333');
        body.setAttribute('rx', '3');

        // Servo horn
        const horn = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        horn.setAttribute('cx', '50');
        horn.setAttribute('cy', '20');
        horn.setAttribute('r', '12');
        horn.setAttribute('class', 'circuit-component');
        horn.setAttribute('fill', '#666');

        const hornScrew = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hornScrew.setAttribute('cx', '50');
        hornScrew.setAttribute('cy', '20');
        hornScrew.setAttribute('r', '3');
        hornScrew.setAttribute('class', 'circuit-component');
        hornScrew.setAttribute('fill', '#silver');

        // Connector pins
        const pins = ['VCC', 'GND', 'SIG'];
        pins.forEach((pin, i) => {
            const pinRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pinRect.setAttribute('x', '10 + i * 15');
            pinRect.setAttribute('y', '35');
            pinRect.setAttribute('width', '8');
            pinRect.setAttribute('height', '10');
            pinRect.setAttribute('class', 'circuit-component');
            pinRect.setAttribute('fill', '#ffd700');
            g.appendChild(pinRect);
        });

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '30');
        label.setAttribute('y', '25');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-size', '10');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'SERVO';

        this.addLabel(g, component.name, component.value, 30, 60);

        g.appendChild(body);
        g.appendChild(horn);
        g.appendChild(hornScrew);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw DC Motor
    drawDCMotor(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Motor body (circle)
        const motorBody = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        motorBody.setAttribute('cx', '40');
        motorBody.setAttribute('cy', '20');
        motorBody.setAttribute('r', '20');
        motorBody.setAttribute('class', 'circuit-component');
        motorBody.setAttribute('fill', '#666');

        // Motor shaft
        const shaft = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shaft.setAttribute('cx', '40');
        shaft.setAttribute('cy', '20');
        shaft.setAttribute('r', '5');
        shaft.setAttribute('class', 'circuit-component');
        shaft.setAttribute('fill', '#silver');

        // Terminals
        const terminal1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        terminal1.setAttribute('x', '15');
        terminal1.setAttribute('y', '15');
        terminal1.setAttribute('width', '10');
        terminal1.setAttribute('height', '10');
        terminal1.setAttribute('class', 'circuit-component');
        terminal1.setAttribute('fill', '#ffd700');

        const terminal2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        terminal2.setAttribute('x', '55');
        terminal2.setAttribute('y', '15');
        terminal2.setAttribute('width', '10');
        terminal2.setAttribute('height', '10');
        terminal2.setAttribute('class', 'circuit-component');
        terminal2.setAttribute('fill', '#ffd700');

        // M label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '40');
        label.setAttribute('y', '25');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-size', '14');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'M';

        this.addLabel(g, component.name, component.value, 40, 55);

        g.appendChild(motorBody);
        g.appendChild(shaft);
        g.appendChild(terminal1);
        g.appendChild(terminal2);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw Relay
    drawRelay(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Relay coil
        const coil = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        coil.setAttribute('x', '0');
        coil.setAttribute('y', '10');
        coil.setAttribute('width', '30');
        coil.setAttribute('height', '20');
        coil.setAttribute('class', 'circuit-component');
        coil.setAttribute('fill', '#8b4513');

        // Relay switch contacts
        const contact1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        contact1.setAttribute('cx', '45');
        contact1.setAttribute('cy', '5');
        contact1.setAttribute('r', '3');
        contact1.setAttribute('class', 'circuit-terminal');

        const contact2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        contact2.setAttribute('cx', '45');
        contact2.setAttribute('cy', '20');
        contact2.setAttribute('r', '3');
        contact2.setAttribute('class', 'circuit-terminal');

        const contact3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        contact3.setAttribute('cx', '45');
        contact3.setAttribute('cy', '35');
        contact3.setAttribute('r', '3');
        contact3.setAttribute('class', 'circuit-terminal');

        // Switch arm
        const arm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arm.setAttribute('x1', '45');
        arm.setAttribute('y1', '20');
        arm.setAttribute('x2', '42');
        arm.setAttribute('y2', '8');
        arm.setAttribute('class', 'circuit-component');
        arm.setAttribute('stroke-width', '3');

        // Coil pins
        const pin1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        pin1.setAttribute('x', '5');
        pin1.setAttribute('y', '25');
        pin1.setAttribute('width', '6');
        pin1.setAttribute('height', '8');
        pin1.setAttribute('class', 'circuit-component');
        pin1.setAttribute('fill', '#ffd700');

        const pin2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        pin2.setAttribute('x', '19');
        pin2.setAttribute('y', '25');
        pin2.setAttribute('width', '6');
        pin2.setAttribute('height', '8');
        pin2.setAttribute('class', 'circuit-component');
        pin2.setAttribute('fill', '#ffd700');

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '15');
        label.setAttribute('y', '23');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'white');
        label.setAttribute('font-size', '10');
        label.setAttribute('font-weight', 'bold');
        label.textContent = 'RELAY';

        this.addLabel(g, component.name, component.value, 25, 50);

        g.appendChild(coil);
        g.appendChild(contact1);
        g.appendChild(contact2);
        g.appendChild(contact3);
        g.appendChild(arm);
        g.appendChild(pin1);
        g.appendChild(pin2);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Draw Buzzer
    drawBuzzer(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Buzzer body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        body.setAttribute('cx', '40');
        body.setAttribute('cy', '20');
        body.setAttribute('r', '18');
        body.setAttribute('class', 'circuit-component');
        body.setAttribute('fill', '#333');

        // Sound waves
        const wave1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wave1.setAttribute('d', 'M 60 10 Q 70 20, 60 30');
        wave1.setAttribute('class', 'circuit-component');
        wave1.setAttribute('fill', 'none');

        const wave2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wave2.setAttribute('d', 'M 65 5 Q 75 20, 65 35');
        wave2.setAttribute('class', 'circuit-component');
        wave2.setAttribute('fill', 'none');

        // Pins
        const pin1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        pin1.setAttribute('x', '30');
        pin1.setAttribute('y', '35');
        pin1.setAttribute('width', '8');
        pin1.setAttribute('height', '8');
        pin1.setAttribute('class', 'circuit-component');
        pin1.setAttribute('fill', '#ffd700');

        const pin2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        pin2.setAttribute('x', '42');
        pin2.setAttribute('y', '35');
        pin2.setAttribute('width', '8');
        pin2.setAttribute('height', '8');
        pin2.setAttribute('class', 'circuit-component');
        pin2.setAttribute('fill', '#ffd700');

        // Plus sign
        const plus = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        plus.setAttribute('x', '30');
        plus.setAttribute('y', '25');
        plus.setAttribute('class', 'circuit-text');
        plus.setAttribute('fill', 'white');
        plus.setAttribute('font-weight', 'bold');
        plus.textContent = '+';

        this.addLabel(g, component.name, '', 40, 55);

        g.appendChild(body);
        g.appendChild(wave1);
        g.appendChild(wave2);
        g.appendChild(pin1);
        g.appendChild(pin2);
        g.appendChild(plus);
        svg.appendChild(g);
    }

    // Draw LCD 16x2
    drawLCD(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // LCD screen
        const screen = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        screen.setAttribute('x', '0');
        screen.setAttribute('y', '0');
        screen.setAttribute('width', '80');
        screen.setAttribute('height', '35');
        screen.setAttribute('class', 'circuit-component');
        screen.setAttribute('fill', '#0066cc');
        screen.setAttribute('rx', '3');

        // Display area
        const display = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        display.setAttribute('x', '5');
        display.setAttribute('y', '5');
        display.setAttribute('width', '70');
        display.setAttribute('height', '25');
        display.setAttribute('class', 'circuit-component');
        display.setAttribute('fill', '#99ccff');

        // Pin header
        for (let i = 0; i < 16; i++) {
            const pin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pin.setAttribute('x', '5 + i * 4.5');
            pin.setAttribute('y', '30');
            pin.setAttribute('width', '3');
            pin.setAttribute('height', '8');
            pin.setAttribute('class', 'circuit-component');
            pin.setAttribute('fill', '#ffd700');
            g.appendChild(pin);
        }

        // LCD text
        const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text1.setAttribute('x', '40');
        text1.setAttribute('y', '16');
        text1.setAttribute('class', 'circuit-text');
        text1.setAttribute('text-anchor', 'middle');
        text1.setAttribute('fill', '#0066cc');
        text1.setAttribute('font-size', '8');
        text1.textContent = 'Hello World!';

        const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text2.setAttribute('x', '40');
        text2.setAttribute('y', '26');
        text2.setAttribute('class', 'circuit-text');
        text2.setAttribute('text-anchor', 'middle');
        text2.setAttribute('fill', '#0066cc');
        text2.setAttribute('font-size', '8');
        text2.textContent = 'Arduino LCD';

        this.addLabel(g, component.name, '16x2', 40, 55);

        g.appendChild(screen);
        g.appendChild(display);
        g.appendChild(text1);
        g.appendChild(text2);
        svg.appendChild(g);
    }

    // Draw Potentiometer
    drawPotentiometer(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Potentiometer body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        body.setAttribute('cx', '40');
        body.setAttribute('cy', '20');
        body.setAttribute('r', '15');
        body.setAttribute('class', 'circuit-component');
        body.setAttribute('fill', '#8b4513');

        // Adjustment screw
        const screw = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        screw.setAttribute('x1', '40');
        screw.setAttribute('y1', '20');
        screw.setAttribute('x2', '50');
        screw.setAttribute('y2', '15');
        screw.setAttribute('class', 'circuit-component');
        screw.setAttribute('stroke-width', '3');

        // Terminals
        const terminal1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        terminal1.setAttribute('cx', '25');
        terminal1.setAttribute('cy', '20');
        terminal1.setAttribute('r', '3');
        terminal1.setAttribute('class', 'circuit-terminal');

        const terminal2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        terminal2.setAttribute('cx', '40');
        terminal2.setAttribute('cy', '35');
        terminal2.setAttribute('r', '3');
        terminal2.setAttribute('class', 'circuit-terminal');

        const terminal3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        terminal3.setAttribute('cx', '55');
        terminal3.setAttribute('cy', '20');
        terminal3.setAttribute('r', '3');
        terminal3.setAttribute('class', 'circuit-terminal');

        // Connection lines
        const conn1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn1.setAttribute('x1', '25');
        conn1.setAttribute('y1', '20');
        conn1.setAttribute('x2', '10');
        conn1.setAttribute('y2', '20');
        conn1.setAttribute('class', 'circuit-wire');

        const conn2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn2.setAttribute('x1', '40');
        conn2.setAttribute('y1', '35');
        conn2.setAttribute('x2', '40');
        conn2.setAttribute('y2', '50');
        conn2.setAttribute('class', 'circuit-wire');

        const conn3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn3.setAttribute('x1', '55');
        conn3.setAttribute('y1', '20');
        conn3.setAttribute('x2', '70');
        conn3.setAttribute('y2', '20');
        conn3.setAttribute('class', 'circuit-wire');

        g.appendChild(body);
        g.appendChild(screw);
        g.appendChild(terminal1);
        g.appendChild(terminal2);
        g.appendChild(terminal3);
        g.appendChild(conn1);
        g.appendChild(conn2);
        g.appendChild(conn3);

        this.addLabel(g, component.name, component.value, 40, 65);
        svg.appendChild(g);
    }

    // Draw Push Button
    drawPushButton(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // Button base
        const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        base.setAttribute('x', '15');
        base.setAttribute('y', '15');
        base.setAttribute('width', '30');
        base.setAttribute('height', '20');
        base.setAttribute('class', 'circuit-component');
        base.setAttribute('fill', '#666');
        base.setAttribute('rx', '3');

        // Button cap
        const cap = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cap.setAttribute('x', '20');
        cap.setAttribute('y', '5');
        cap.setAttribute('width', '20');
        cap.setAttribute('height', '15');
        cap.setAttribute('class', 'circuit-component');
        cap.setAttribute('fill', '#ff0000');
        cap.setAttribute('rx', '2');

        // Terminals
        const terminal1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        terminal1.setAttribute('cx', '20');
        terminal1.setAttribute('cy', '35');
        terminal1.setAttribute('r', '3');
        terminal1.setAttribute('class', 'circuit-terminal');

        const terminal2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        terminal2.setAttribute('cx', '40');
        terminal2.setAttribute('cy', '35');
        terminal2.setAttribute('r', '3');
        terminal2.setAttribute('class', 'circuit-terminal');

        // Connection lines
        const conn1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn1.setAttribute('x1', '20');
        conn1.setAttribute('y1', '35');
        conn1.setAttribute('x2', '20');
        conn1.setAttribute('y2', '50');
        conn1.setAttribute('class', 'circuit-wire');

        const conn2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        conn2.setAttribute('x1', '40');
        conn2.setAttribute('y1', '35');
        conn2.setAttribute('x2', '40');
        conn2.setAttribute('y2', '50');
        conn2.setAttribute('class', 'circuit-wire');

        g.appendChild(base);
        g.appendChild(cap);
        g.appendChild(terminal1);
        g.appendChild(terminal2);
        g.appendChild(conn1);
        g.appendChild(conn2);

        this.addLabel(g, component.name, '', 30, 65);
        svg.appendChild(g);
    }

    // Draw RGB LED
    drawRGBLED(svg, component) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${component.x}, ${component.y})`);

        // LED housing (clear)
        const housing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        housing.setAttribute('cx', '40');
        housing.setAttribute('cy', '20');
        housing.setAttribute('r', '12');
        housing.setAttribute('class', 'circuit-component');
        housing.setAttribute('fill', '#f0f0f0');
        housing.setAttribute('stroke', '#333');
        housing.setAttribute('stroke-width', '2');

        // RGB elements inside
        const redElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        redElement.setAttribute('cx', '35');
        redElement.setAttribute('cy', '18');
        redElement.setAttribute('r', '3');
        redElement.setAttribute('fill', '#ff0000');

        const greenElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        greenElement.setAttribute('cx', '40');
        greenElement.setAttribute('cy', '20');
        greenElement.setAttribute('r', '3');
        greenElement.setAttribute('fill', '#00ff00');

        const blueElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        blueElement.setAttribute('cx', '45');
        blueElement.setAttribute('cy', '22');
        blueElement.setAttribute('r', '3');
        blueElement.setAttribute('fill', '#0000ff');

        // Pins (4 pins for common cathode)
        const pins = ['R', 'G', 'B', 'GND'];
        pins.forEach((pin, i) => {
            const pinRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pinRect.setAttribute('x', '25 + i * 7');
            pinRect.setAttribute('y', '28');
            pinRect.setAttribute('width', '4');
            pinRect.setAttribute('height', '8');
            pinRect.setAttribute('class', 'circuit-component');
            pinRect.setAttribute('fill', '#ffd700');
            
            // Pin labels
            const pinLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            pinLabel.setAttribute('x', '27 + i * 7');
            pinLabel.setAttribute('y', '42');
            pinLabel.setAttribute('class', 'circuit-text');
            pinLabel.setAttribute('font-size', '8');
            pinLabel.setAttribute('text-anchor', 'middle');
            pinLabel.textContent = pin;
            
            g.appendChild(pinRect);
            g.appendChild(pinLabel);
        });

        // RGB label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '40');
        label.setAttribute('y', '23');
        label.setAttribute('class', 'circuit-text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '8');
        label.setAttribute('font-weight', 'bold');
        label.setAttribute('fill', '#333');
        label.textContent = 'RGB';

        this.addLabel(g, component.name, '', 40, 55);

        g.appendChild(housing);
        g.appendChild(redElement);
        g.appendChild(greenElement);
        g.appendChild(blueElement);
        g.appendChild(label);
        svg.appendChild(g);
    }

    // Add component label
    addLabel(group, name, value, x, y) {
        const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameLabel.setAttribute('x', x);
        nameLabel.setAttribute('y', y);
        nameLabel.setAttribute('class', 'circuit-text');
        nameLabel.setAttribute('text-anchor', 'middle');
        nameLabel.setAttribute('font-weight', 'bold');
        nameLabel.textContent = name;

        group.appendChild(nameLabel);

        if (value) {
            const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueLabel.setAttribute('x', x);
            valueLabel.setAttribute('y', y + 15);
            valueLabel.setAttribute('class', 'circuit-text');
            valueLabel.setAttribute('text-anchor', 'middle');
            valueLabel.setAttribute('font-size', '10');
            valueLabel.textContent = value;

            group.appendChild(valueLabel);
        }
    }

    // Export circuit as SVG
    exportSVG() {
        const svg = document.getElementById('circuit-svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'circuit-diagram.svg';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Export circuit as PNG
    exportPNG() {
        const svg = document.getElementById('circuit-svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = 800;
            canvas.height = 600;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'circuit-diagram.png';
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png');
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }

    // Zoom functionality
    zoomIn() {
        this.zoom = Math.min(this.zoom + 0.1, 3);
        this.applyZoom();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom - 0.1, 0.5);
        this.applyZoom();
    }

    applyZoom() {
        const svg = document.getElementById('circuit-svg');
        svg.style.transform = `scale(${this.zoom})`;
    }
}

// Initialize the circuit engine
const circuitEngine = new CircuitEngine();