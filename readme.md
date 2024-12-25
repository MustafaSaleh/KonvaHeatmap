# React Konva Heatmap Component

A smooth, high-performance heatmap visualization component for React using React-Konva. This component allows you to create beautiful, gradient-based heatmaps with customizable colors, radius, and blur effects.

## Installation

```bash
npm install react-konva konva
# or
yarn add react-konva konva
```

## Usage

### Basic Example

```jsx
import React from 'react';
import KonvaHeatmap from './KonvaHeatmap';

const HeatmapExample = () => {
  const data = [
    { x: 100, y: 100, value: 100 },
    { x: 150, y: 150, value: 80 },
    { x: 200, y: 120, value: 60 },
  ];

  const config = {
    radius: 25,
    blur: 0.95,
    maxOpacity: 0.5,
    minOpacity: 0.05,
    gradient: {
      0.0: "rgb(0,0,255)",    // Start with pure blue
      0.2: "rgb(0,128,255)",  // Light blue
      0.4: "rgb(0,255,0)",    // Green
      0.6: "rgb(255,255,0)",  // Yellow
      0.7: "rgb(255,192,0)",  // Orange-yellow
      0.8: "rgb(255,128,0)",  // Orange
      0.9: "rgb(255,64,0)",   // Red-orange
      1.0: "rgb(255,0,0)"     // Pure red
    }
  };

  return (
    <KonvaHeatmap
      width={800}
      height={600}
      data={data}
      config={config}
    />
  );
};

export default HeatmapExample;
```

### Configuration Options

The component accepts the following props:

- `width` (number): Canvas width in pixels
- `height` (number): Canvas height in pixels
- `data` (array): Array of points with x, y coordinates and values
- `config` (object): Configuration object with the following properties:
  - `radius` (number): Size of each data point's influence
  - `blur` (number): Amount of blur (0-1)
  - `maxOpacity` (number): Maximum opacity of the heatmap
  - `minOpacity` (number): Minimum opacity of the heatmap
  - `gradient` (object): Color gradient configuration

### Advanced Usage

#### Random Data Generation

```jsx
const generateRandomData = (pointCount) => {
  const data = [];
  for (let i = 0; i < pointCount; i++) {
    data.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      value: Math.random() * 100
    });
  }
  return data;
};

const HeatmapWithRandomData = () => {
  const [data] = React.useState(() => generateRandomData(50));

  const config = {
    radius: 25,
    blur: 0.95,
    maxOpacity: 0.5,
    minOpacity: 0.05,
    gradient: {
      0.0: "rgb(0,0,255)",
      0.2: "rgb(0,128,255)",
      0.4: "rgb(0,255,0)",
      0.6: "rgb(255,255,0)",
      0.7: "rgb(255,192,0)",
      0.8: "rgb(255,128,0)",
      0.9: "rgb(255,64,0)",
      1.0: "rgb(255,0,0)"
    }
  };

  return (
    <KonvaHeatmap
      width={800}
      height={600}
      data={data}
      config={config}
    />
  );
};
```

#### Real-Time Updates

```jsx
const RealTimeHeatmap = () => {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => [
        ...prevData,
        {
          x: Math.random() * 800,
          y: Math.random() * 600,
          value: Math.random() * 100
        }
      ].slice(-50)); // Keep only last 50 points
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const config = {
    radius: 25,
    blur: 0.95,
    maxOpacity: 0.5,
    minOpacity: 0.05,
    gradient: {
      0.0: "rgb(0,0,255)",
      0.2: "rgb(0,128,255)",
      0.4: "rgb(0,255,0)",
      0.6: "rgb(255,255,0)",
      0.7: "rgb(255,192,0)",
      0.8: "rgb(255,128,0)",
      0.9: "rgb(255,64,0)",
      1.0: "rgb(255,0,0)"
    }
  };

  return (
    <KonvaHeatmap
      width={800}
      height={600}
      data={data}
      config={config}
    />
  );
};
```

### API Reference

#### KonvaHeatmap Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 800 | Width of the canvas in pixels |
| height | number | 600 | Height of the canvas in pixels |
| data | array | [] | Array of data points |
| config | object | defaultConfig | Configuration object |

#### Data Point Structure

```typescript
interface DataPoint {
  x: number;      // x-coordinate
  y: number;      // y-coordinate
  value: number;  // intensity value (0-100 recommended)
}
```

#### Configuration Structure

```typescript
interface Config {
  radius: number;     // Size of each data point's influence
  blur: number;       // Amount of blur (0-1)
  maxOpacity: number; // Maximum opacity (0-1)
  minOpacity: number; // Minimum opacity (0-1)
  gradient: {         // Color gradient configuration
    [key: number]: string; // position (0-1): color value
  };
}
```

## Performance Considerations

- The component uses canvas rendering for optimal performance
- Large datasets (>1000 points) might impact performance
- Adjust radius and blur values based on your use case
- Consider using requestAnimationFrame for real-time updates

## License

MIT License