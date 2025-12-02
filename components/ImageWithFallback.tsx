"use client";

import React, { useState } from 'react';
import { Package } from 'lucide-react';

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);

  if (didError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 ${props.className}`}>
        <Package className="w-8 h-8 opacity-50" />
      </div>
    );
  }

  return (
    <img 
      {...props} 
      onError={() => setDidError(true)} 
      alt={props.alt || "Product Image"}
    />
  );
}