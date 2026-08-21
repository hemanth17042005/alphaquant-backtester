import React, { useEffect, useRef } from 'react';

export default function PlotWrapper({ data = [], layout = {}, config = {}, style = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if window.Plotly is available
    if (window.Plotly) {
      window.Plotly.react(containerRef.current, data, layout, {
        responsive: true,
        displayModeBar: false,
        displaylogo: false,
        ...config
      });
    } else {
      // Fallback: dynamically load script if not loaded
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.31.0.min.js';
      script.async = true;
      script.onload = () => {
        if (window.Plotly && containerRef.current) {
          window.Plotly.newPlot(containerRef.current, data, layout, {
            responsive: true,
            displayModeBar: false,
            displaylogo: false,
            ...config
          });
        }
      };
      document.head.appendChild(script);
    }
  }, [data, layout, config]);

  useEffect(() => {
    const handleResize = () => {
      if (window.Plotly && containerRef.current) {
        window.Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={containerRef} style={{ width: '100%', minHeight: '280px', ...style }} />;
}
