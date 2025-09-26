"use client";

import { useState } from "react";
import { ButtonExamples } from "./ButtonExamples";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Toggle } from "./ui/toggle";
import { TabHeader } from "./TabHeader";
import { 
  Eye, 
  EyeOff, 
  Search, 
  Settings, 
  User, 
  Mail, 
  Phone,
  Calendar,
  Clock,
  Check,
  X,
  AlertTriangle,
  Info
} from "lucide-react";

export function UIShowcaseTab() {
  const [showPassword, setShowPassword] = useState(false);
  const [toggleState, setToggleState] = useState(false);

  return (
    <div className="space-y-12">
      {/* Header */}
      <TabHeader
        title="UI Components"
        subtitle="Design System Showcase"
      />
      
      {/* Buttons Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Button System</h2>
          <p className="text-white/60 uppercase">Comprehensive button variants and states</p>
        </div>
        <ButtonExamples />
      </section>

      {/* Form Components Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Form Components</h2>
          <p className="text-white/60 uppercase">Input fields, toggles, and form controls</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Input Examples */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Input Fields</CardTitle>
              <CardDescription className="text-white/60 uppercase tracking-[0.05em]">
                Text input variations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                  Standard Input
                </label>
                <Input 
                  type="text" 
                  placeholder="Enter text..." 
                  className="bg-transparent border-white/20 text-white placeholder-white/40 focus:border-white"
                />
              </div>
              
              <div>
                <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                  Search Input
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-10 bg-transparent border-white/20 text-white placeholder-white/40 focus:border-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm tracking-[0.05em] uppercase text-white/70 mb-2">
                  Password Input
                </label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="pr-10 bg-transparent border-white/20 text-white placeholder-white/40 focus:border-white"
                  />
                  <Button
                    variant="ghost"
                    size="iconSm"
                    iconOnly
                    icon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Toggle Examples */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Toggle Controls</CardTitle>
              <CardDescription className="text-white/60 uppercase tracking-[0.05em]">
                Switch and toggle components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg tracking-[0.05em] uppercase mb-2">Wartungsmodus</h3>
                  <p className="text-white/60 text-sm">
                    Aktivieren Sie den Wartungsmodus
                  </p>
                </div>
                <Toggle
                  active={toggleState}
                  onToggle={setToggleState}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg tracking-[0.05em] uppercase mb-2">Benachrichtigungen</h3>
                  <p className="text-white/60 text-sm">
                    E-Mail Benachrichtigungen erhalten
                  </p>
                </div>
                <Toggle
                  active={!toggleState}
                  onToggle={() => setToggleState(!toggleState)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Status Indicators</CardTitle>
              <CardDescription className="text-white/60 uppercase tracking-[0.05em]">
                Visual status feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Online</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Wartung</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Offline</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Verfügbar</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cards Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Card Components</h2>
          <p className="text-white/60 uppercase">Information containers and layouts</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Card */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Basic Card</CardTitle>
              <CardDescription className="text-white/60 uppercase tracking-[0.05em]">
                Standard card layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">
                This is a basic card component with header and content sections.
              </p>
            </CardContent>
          </Card>

          {/* Card with Actions */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Card with Actions</CardTitle>
              <CardDescription className="text-white/60 uppercase tracking-[0.05em]">
                Interactive card example
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80">
                This card includes action buttons and interactive elements.
              </p>
              <div className="flex gap-2">
                <Button variant="success" size="sm">Save</Button>
                <Button variant="secondary" size="sm">Cancel</Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Status Card
              </CardTitle>
              <CardDescription className="text-white/60 uppercase tracking-[0.05em]">
                Card with status indicator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">
                This card shows how to integrate status indicators with content.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Icon Showcase */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Icon System</h2>
          <p className="text-white/60 uppercase">Lucide React icons used throughout the system</p>
        </div>
        
        <Card className="bg-black border-white/20">
          <CardHeader>
            <CardTitle className="text-white tracking-[0.05em] uppercase">Common Icons</CardTitle>
            <CardDescription className="text-white/60 uppercase tracking-[0.05em]">
              Frequently used icons in the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
              {[
                { icon: User, name: "User" },
                { icon: Mail, name: "Mail" },
                { icon: Phone, name: "Phone" },
                { icon: Calendar, name: "Calendar" },
                { icon: Clock, name: "Clock" },
                { icon: Search, name: "Search" },
                { icon: Settings, name: "Settings" },
                { icon: Check, name: "Check" },
                { icon: X, name: "Close" },
                { icon: AlertTriangle, name: "Warning" },
                { icon: Info, name: "Info" },
                { icon: Eye, name: "Eye" },
              ].map(({ icon: Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-2 p-3 border border-white/10 rounded">
                  <Icon className="w-6 h-6 text-white/80" />
                  <span className="text-xs text-white/60 uppercase tracking-[0.05em]">{name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Color Palette */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Color Palette</h2>
          <p className="text-white/60 uppercase">Design system colors and usage</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Status Colors */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Status Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Success</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Warning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Danger</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Info</span>
              </div>
            </CardContent>
          </Card>

          {/* Primary Colors */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Primary Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-white rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">White</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-black border border-white/20 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Black</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-white/20 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">White/20</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-white/60 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">White/60</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Colors */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Category Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Allgemein</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Herren</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Färbung</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-pink-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Beauty</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Colors */}
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white tracking-[0.05em] uppercase">Payment Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Payment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Extensions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Kids</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-white/80 uppercase tracking-[0.05em]">Default</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Typography */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl tracking-[0.1em] uppercase border-b border-white/20 pb-2">Typography</h2>
          <p className="text-white/60 uppercase">Text styles and hierarchy</p>
        </div>
        
        <Card className="bg-black border-white/20">
          <CardContent className="pt-6 space-y-6">
            <div>
              <h1 className="text-4xl tracking-[0.2em] uppercase mb-2">Heading 1</h1>
              <p className="text-white/60 uppercase tracking-[0.05em]">Main page titles</p>
            </div>
            
            <div>
              <h2 className="text-3xl tracking-[0.2em] uppercase mb-2">Heading 2</h2>
              <p className="text-white/60 uppercase tracking-[0.05em]">Section titles</p>
            </div>
            
            <div>
              <h3 className="text-2xl tracking-[0.15em] uppercase mb-2">Heading 3</h3>
              <p className="text-white/60 uppercase tracking-[0.05em]">Subsection titles</p>
            </div>
            
            <div>
              <h4 className="text-xl tracking-[0.1em] uppercase mb-2">Heading 4</h4>
              <p className="text-white/60 uppercase tracking-[0.05em]">Card titles</p>
            </div>
            
            <div>
              <p className="text-lg tracking-[0.05em] uppercase mb-2">Body Large</p>
              <p className="text-white/60 uppercase tracking-[0.05em]">Important content</p>
            </div>
            
            <div>
              <p className="text-base tracking-[0.05em] uppercase mb-2">Body Regular</p>
              <p className="text-white/60 uppercase tracking-[0.05em]">Standard content</p>
            </div>
            
            <div>
              <p className="text-sm tracking-[0.05em] uppercase mb-2">Body Small</p>
              <p className="text-white/60 uppercase tracking-[0.05em]">Secondary content</p>
            </div>
            
            <div>
              <p className="text-xs tracking-[0.05em] uppercase mb-2">Caption</p>
              <p className="text-white/60 uppercase tracking-[0.05em]">Labels and captions</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
