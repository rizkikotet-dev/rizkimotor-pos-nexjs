"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  textMargin?: number;
  className?: string;
}

export function Barcode({
  value,
  width = 1.5,
  height = 40,
  displayValue = true,
  fontSize = 12,
  textMargin = 2,
  className = "",
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width,
          height,
          displayValue,
          fontSize,
          textMargin,
          margin: 5,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch {
        // invalid barcode value
      }
    }
  }, [value, width, height, displayValue, fontSize, textMargin]);

  return <svg ref={svgRef} className={className} />;
}
