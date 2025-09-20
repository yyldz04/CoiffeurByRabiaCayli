"use client";

import { useState } from 'react';
import { Toggle, ToggleWithLabels } from './ui/toggle';

export function ToggleDemo() {
  const [basicToggle, setBasicToggle] = useState(false);
  const [labeledToggle, setLabeledToggle] = useState(true);
  const [disabledToggle, setDisabledToggle] = useState(false);

  return (
    <div className="p-8 space-y-8 bg-black text-white">
      <h1 className="text-2xl tracking-[0.1em] uppercase mb-8">Toggle Component Demo</h1>
      
      {/* Basic Toggle */}
      <div className="space-y-4">
        <h2 className="text-lg tracking-[0.05em] uppercase">Basic Toggle</h2>
        <div className="flex items-center gap-4">
          <Toggle
            active={basicToggle}
            onToggle={setBasicToggle}
          />
          <span className="text-white/70">
            Status: {basicToggle ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Toggle with Labels */}
      <div className="space-y-4">
        <h2 className="text-lg tracking-[0.05em] uppercase">Toggle with Labels</h2>
        <div className="flex items-center gap-4">
          <ToggleWithLabels
            active={labeledToggle}
            onToggle={setLabeledToggle}
            leftLabel="OFF"
            rightLabel="ON"
          />
          <span className="text-white/70">
            Status: {labeledToggle ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Disabled Toggle */}
      <div className="space-y-4">
        <h2 className="text-lg tracking-[0.05em] uppercase">Disabled Toggle</h2>
        <div className="flex items-center gap-4">
          <Toggle
            active={disabledToggle}
            onToggle={setDisabledToggle}
            disabled={true}
          />
          <span className="text-white/50">
            Disabled (cannot be clicked)
          </span>
        </div>
      </div>

      {/* Different States */}
      <div className="space-y-4">
        <h2 className="text-lg tracking-[0.05em] uppercase">All States</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Toggle active={false} onToggle={() => {}} />
            <span className="text-xs text-white/60">Inactive (OFF selected)</span>
          </div>
          <div className="flex flex-col gap-2">
            <Toggle active={true} onToggle={() => {}} />
            <span className="text-xs text-white/60">Active (ON selected)</span>
          </div>
          <div className="flex flex-col gap-2">
            <Toggle active={false} onToggle={() => {}} disabled />
            <span className="text-xs text-white/60">Disabled</span>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="space-y-4 pt-8 border-t border-white/20">
        <h2 className="text-lg tracking-[0.05em] uppercase">Usage Example</h2>
        <pre className="bg-white/5 border border-white/20 p-4 text-sm overflow-x-auto">
{`// Basic usage
<Toggle
  active={isActive}
  onToggle={setIsActive}
/>

// With labels
<ToggleWithLabels
  active={isOn}
  onToggle={setIsOn}
  leftLabel="OFF"
  rightLabel="ON"
/>

// Disabled
<Toggle
  active={value}
  onToggle={setValue}
  disabled={true}
/>`}
        </pre>
      </div>
    </div>
  );
}
