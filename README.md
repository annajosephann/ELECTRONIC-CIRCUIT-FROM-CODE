# AI Circuit Designer - Code to Circuit Diagrams

A powerful web application that transforms simple code descriptions into professional circuit diagrams instantly. Built with modern web technologies and an intelligent parsing engine.

## 🌟 Features

- **Intuitive Code Syntax**: Write circuits in plain text with simple, readable syntax
- **Real-time Preview**: See your circuit diagram update as you type
- **Component Library**: Click-to-insert common electronic components
- **Multiple Export Formats**: Download circuits as SVG or PNG images
- **Example Circuits**: Start with pre-built templates for common circuits
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Professional SVG Output**: High-quality, scalable circuit diagrams
- **Zoom Controls**: Zoom in/out for detailed circuit inspection
- **Syntax Highlighting**: CodeMirror editor with beautiful themes

## 🚀 Quick Start

1. **Open the Website**: Open `index.html` in your web browser
2. **Write Circuit Code**: Use the intuitive syntax to describe your circuit
3. **Click Generate**: Your circuit diagram appears instantly
4. **Export**: Download as SVG or PNG for documentation

## 📝 Circuit Code Syntax

### Component Syntax
```
// Basic format: NAME: TYPE [VALUE] [POSITION]
R1: resistor 1k (100, 100)
C1: capacitor 100uF
LED1: led red
V1: battery 9V
```

### Connection Syntax
```
// Connect components with arrows
R1 -> LED1
V1 -> R1
LED1 -> GND
```

### Supported Components

| Component | Type | Example | Value Format |
|-----------|------|---------|--------------|
| Resistor | `resistor` | `R1: resistor 1k` | Ohms (1k, 470, 10M) |
| Capacitor | `capacitor` | `C1: capacitor 100uF` | Farads (100uF, 10nF, 1pF) |
| Inductor | `inductor` | `L1: inductor 10mH` | Henry (10mH, 1uH, 100nH) |
| LED | `led` | `LED1: led red` | Colors (red, green, blue) |
| Battery | `battery` | `V1: battery 9V` | Voltage (5V, 12V, 9V) |
| Ground | `ground` | `GND: ground` | No value needed |
| Switch | `switch` | `SW1: switch` | No value needed |
| Transistor | `npn` or `transistor` | `Q1: npn` | No value needed |

#### 🎯 Arduino Components

| Component | Type | Example | Description |
|-----------|------|---------|-------------|
| Arduino Uno | `arduino_uno` | `ARDUINO1: arduino_uno` | Main microcontroller board |
| Ultrasonic | `ultrasonic` | `HC1: ultrasonic HC-SR04` | Distance measurement sensor |
| DHT11 | `dht11` | `DHT1: dht11` | Temperature & humidity sensor |
| LDR | `ldr` | `LDR1: ldr` | Light dependent resistor |
| Servo | `servo` | `SERVO1: servo SG90` | Rotary actuator |
| DC Motor | `dc_motor` | `M1: dc_motor` | Direct current motor |
| Relay | `relay` | `RELAY1: relay 5V` | Electromechanical switch |
| Buzzer | `buzzer` | `BUZZ1: buzzer` | Sound output device |
| LCD | `lcd` | `LCD1: lcd 16x2` | 16x2 character display |
| Potentiometer | `potentiometer` | `POT1: potentiometer 10k` | Variable resistor |
| Push Button | `pushbutton` | `BTN1: pushbutton` | Momentary switch |
| RGB LED | `rgb_led` | `RGB1: rgb_led` | Multi-color LED |

## 💡 Example Circuits

### Simple LED Circuit
```
// Basic LED with current limiting resistor
V1: battery 9V (100, 100)
R1: resistor 330 (250, 100)
LED1: led red (400, 100)
GND: ground (550, 100)

V1 -> R1
R1 -> LED1
LED1 -> GND
```

### Voltage Divider
```
// Divide 12V to 6V
VIN: battery 12V (50, 100)
R1: resistor 10k (150, 100)
R2: resistor 10k (250, 100)
GND: ground (350, 200)

VIN -> R1
R1 -> R2
R2 -> GND
```

### RC Low-Pass Filter
```
// Simple RC filter circuit
VIN: battery 5V (50, 100)
R1: resistor 10k (150, 100)
C1: capacitor 100nF (250, 100)
GND: ground (250, 200)

VIN -> R1
R1 -> C1
C1 -> GND
```

### Transistor Amplifier
```
// Basic NPN amplifier
VCC: battery 12V (100, 50)
R1: resistor 47k (200, 50)
R2: resistor 10k (200, 150)
R3: resistor 4.7k (350, 50)
Q1: npn (300, 150)
GND: ground (400, 250)

VCC -> R1
R1 -> Q1
R2 -> GND
VCC -> R3
R3 -> Q1
Q1 -> GND
```

### 🎯 Arduino LED Blink
```
// Arduino LED Blink Circuit
ARDUINO1: arduino_uno (100, 100)
R1: resistor 220 (300, 150)
LED1: led red (400, 150)
GND1: ground (500, 150)

// Arduino Digital Pin 13 -> Resistor -> LED -> Ground
ARDUINO1 -> R1
R1 -> LED1
LED1 -> GND1

// Arduino Code Reference:
// pinMode(13, OUTPUT);
// digitalWrite(13, HIGH); // LED on
// delay(1000);
// digitalWrite(13, LOW);  // LED off
```

### Arduino Ultrasonic Sensor
```
// Arduino Distance Measurement with HC-SR04
ARDUINO1: arduino_uno (100, 100)
HC1: ultrasonic HC-SR04 (300, 100)
GND1: ground (400, 200)
VCC1: battery 5V (100, 200)

// Power connections
VCC1 -> HC1
HC1 -> GND1

// Arduino connections
ARDUINO1 -> HC1  // Trigger pin (digital pin 9)
ARDUINO1 -> HC1  // Echo pin (digital pin 10)

// Arduino Code Reference:
// const int trigPin = 9;
// const int echoPin = 10;
// digitalWrite(trigPin, LOW);
// delayMicroseconds(2);
// digitalWrite(trigPin, HIGH);
// delayMicroseconds(10);
// digitalWrite(trigPin, LOW);
// duration = pulseIn(echoPin, HIGH);
// distance = duration * 0.034 / 2;
```

### Arduino Servo Control
```
// Arduino Servo Motor Control
ARDUINO1: arduino_uno (100, 100)
SERVO1: servo SG90 (300, 100)
GND1: ground (400, 200)
VCC1: battery 5V (100, 200)

// Power connections
VCC1 -> SERVO1
SERVO1 -> GND1

// Control signal
ARDUINO1 -> SERVO1

// Arduino Code Reference:
// #include <Servo.h>
// Servo myservo;
// myservo.attach(9);  // Servo on pin 9
// myservo.write(90);  // Move to 90 degrees
```

### Arduino RGB LED
```
// Arduino RGB LED Color Control
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
ARDUINO1 -> R1  // Red via pin 9 (PWM)
ARDUINO1 -> R2  // Green via pin 10 (PWM)
ARDUINO1 -> R3  // Blue via pin 11 (PWM)

// Current limiting resistors
R1 -> RGB1
R2 -> RGB1
R3 -> RGB1
RGB1 -> GND1

// Arduino Code Reference:
// analogWrite(9, 255);  // Red full brightness
// analogWrite(10, 128); // Green half brightness
// analogWrite(11, 0);   // Blue off
```

## 🎮 How to Use the Interface

### 1. Code Editor
- **Syntax Highlighting**: Professional code editor with dark theme
- **Auto-complete**: Components are highlighted with proper syntax
- **Line Numbers**: Easy navigation and error reference
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + Enter`: Generate circuit
  - `Ctrl/Cmd + S`: Export as SVG
  - `Ctrl/Cmd + P`: Export as PNG
  - `Ctrl/Cmd + L`: Clear editor

### 2. Component Library
- **Click to Insert**: Click any component card to insert its code
- **Visual Preview**: See component symbols before inserting
- **Code Examples**: Each card shows the exact syntax

### 3. Circuit Preview
- **Real-time Updates**: Circuit updates as you type (with 1-second delay)
- **Zoom Controls**: Use zoom buttons for detailed inspection
- **Grid Background**: Professional grid for alignment
- **Connection Dots**: Clear visual indication of connections

### 4. Export Options
- **SVG Export**: Vector format, perfect for documentation
- **PNG Export**: Raster image, good for presentations
- **High Quality**: Professional output suitable for technical documents

## 🔧 Advanced Features

### Component Positioning
You can specify exact positions for components:
```
R1: resistor 1k (100, 100)  // Position at x=100, y=100
C1: capacitor 10uF (200, 150)  // Position at x=200, y=150
```

If positions aren't specified, components are auto-positioned in a grid layout.

### Comments
Add comments to explain your circuit:
```
// This is a comment
V1: battery 9V  // Power supply
R1: resistor 330  // Current limiting resistor
```

### Complex Circuits
Build multi-stage circuits with proper connections:
```
// Multi-stage amplifier with filtering
VCC: battery 12V
R1: resistor 47k
R2: resistor 10k
R3: resistor 4.7k
R4: resistor 1k
C1: capacitor 10uF
C2: capacitor 100uF
C3: capacitor 100nF
Q1: npn
GND: ground

VCC -> R1
R1 -> Q1
R2 -> GND
VCC -> R3
R3 -> Q1
C1 -> R2
C2 -> Q1
Q1 -> R4
R4 -> GND
C3 -> GND
```

## 🎨 Customization

### Adding New Components
To add new component types, modify `circuit-engine.js`:

1. Add the component type to the `drawComponent` switch statement
2. Create a new drawing function following the naming convention `draw[ComponentName]`
3. Update the component validation in `main.js`

### Styling Customization
Modify `styles.css` to customize:
- Color scheme
- Component appearance
- Layout and spacing
- Typography and fonts

## 🌐 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Responsive design works on all modern mobile browsers

## 📱 Mobile Usage

The interface is fully responsive:
- **Touch-friendly**: Large buttons and touch targets
- **Scrollable Code**: Code editor works with touch scrolling
- **Adaptive Layout**: Components stack vertically on small screens

## 🔍 Troubleshooting

### Common Issues

**Circuit doesn't generate:**
- Check for syntax errors in your code
- Ensure component names are unique
- Verify all connections reference existing components

**Components overlap:**
- Specify manual positions using (x, y) coordinates
- Use the auto-positioning feature by omitting positions
- Adjust spacing in the component layout

**Export fails:**
- Ensure your browser supports file downloads
- Check if popup blockers are interfering
- Try generating the circuit first, then exporting

### Error Messages

- **"No valid components found"**: Check your component syntax
- **"Duplicate component name"**: Use unique names for each component
- **"Component not found"**: Ensure all referenced components exist

## 🚀 Performance Tips

- **Keep circuits moderate**: Very large circuits may slow down rendering
- **Use meaningful names**: Component names help with debugging
- **Add comments**: Document complex circuits for future reference
- **Export early**: Save your work frequently

## 📚 Educational Resources

This tool is perfect for:
- **Electronics Students**: Learn circuit design and component connections
- **Hobbyists**: Quick prototyping and documentation
- **Engineers**: Fast diagram creation for technical documents
- **Teachers**: Create educational circuit examples
- **Documentation**: Add circuit diagrams to reports and papers

## 🎯 Arduino Integration Guide

### Connecting Arduino Components

The AI Circuit Designer now supports comprehensive Arduino circuit design. Here's how to get started:

#### 1. Basic Setup
Always include an Arduino Uno board as your main controller:
```
ARDUINO1: arduino_uno (100, 100)
VCC1: battery 5V (50, 200)
GND1: ground (150, 200)
```

#### 2. Power Connections
Most Arduino components need 5V power and ground:
```
VCC1 -> COMPONENT_NAME
COMPONENT_NAME -> GND1
```

#### 3. Digital/Analog Connections
Connect Arduino pins to sensors and actuators:
```
ARDUINO1 -> SENSOR_NAME     // Digital pin
ARDUINO1 -> ACTUATOR_NAME   // PWM pin for analog control
```

#### 4. Common Arduino Circuits

**LED Control with Current Limiting:**
```
ARDUINO1 -> R1 (current limiting resistor)
R1 -> LED1
LED1 -> GND1
```

**Sensor Reading:**
```
VCC1 -> SENSOR1
SENSOR1 -> ARDUINO1
SENSOR1 -> GND1
```

**Motor Control with Transistor:**
```
ARDUINO1 -> R1
R1 -> Q1 (NPN transistor)
VCC2 -> M1 (motor)
M1 -> Q1
Q1 -> GND1
```

### Arduino Code References

Each circuit includes Arduino code comments to help with programming:
- Use `pinMode()` for digital outputs
- Use `analogWrite()` for PWM control
- Use `digitalRead()` for sensor inputs
- Use `analogRead()` for analog sensors

### Component Pinouts

**Arduino Uno:**
- Digital pins: 0-13 (including PWM pins 3, 5, 6, 9, 10, 11)
- Analog pins: A0-A5
- Power: 5V, 3.3V, GND

**Common Sensors:**
- DHT11: VCC, Data, NC, GND
- HC-SR04: VCC, Trig, Echo, GND
- LDR: Two terminals (no polarity)

**Common Actuators:**
- Servo: VCC, GND, Signal
- DC Motor: Two terminals
- Relay: Coil pins and switch contacts

## 🔮 Future Features

Planned enhancements:
- **More Arduino Components**: Additional sensors and actuators
- **Arduino Code Generation**: Auto-generate Arduino sketches from circuits
- **Simulation**: Basic Arduino circuit simulation
- **Pin Assignment Helper**: Visual pin configuration tool
- **Component Library Search**: Quick component lookup
- **Import/Export**: Save and load Arduino circuit files
- **Collaboration**: Share Arduino designs with others
- **Advanced Analysis**: Circuit analysis and calculations

## 🤝 Contributing

Contributions are welcome! Areas to help:
- **Bug Reports**: Found an issue? Please report it
- **Feature Requests**: Ideas for new components or features
- **Documentation**: Help improve the guides and examples
- **Code Contributions**: Fork and submit pull requests

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Circuit Designing!** ⚡

Built with ❤️ for the electronics community