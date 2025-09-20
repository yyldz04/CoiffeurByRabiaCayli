"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  appointmentId?: string;
  serviceName?: string;
  customerName?: string;
}

export function PaymentDialog({ isOpen, onClose, amount = 0, appointmentId, serviceName, customerName }: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | null>(null);

  const handleCardPayment = async () => {
    setIsProcessing(true);
    setPaymentMethod('card');
    
    try {
      // Check if Global Payments SDK is loaded
      if (typeof window !== 'undefined' && (window as any).GlobalPayments) {
        const payments = new (window as any).GlobalPayments();
        
        // Configure payment parameters
        const paymentData = {
          amount: amount.toFixed(2),
          currency: 'EUR',
          // Note: In production, you would collect card details securely
          // For demo purposes, we'll use test data
          cardNumber: '4111111111111111',
          cardExpiry: '12/25',
          cardCvc: '123',
        };

        // Process the payment
        const response = await payments.charge(paymentData);
        
        if (response.status === 'success') {
          alert('Kartenzahlung erfolgreich verarbeitet!');
          console.log('Payment successful:', response);
          onClose();
        } else {
          alert('Zahlung fehlgeschlagen: ' + response.message);
        }
      } else {
        // Fallback: Simulate payment processing
        console.log('Processing card payment for amount:', amount);
        console.log('Appointment ID:', appointmentId);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert('Kartenzahlung erfolgreich verarbeitet! (Demo)');
        onClose();
      }
    } catch (error) {
      console.error('Card payment failed:', error);
      alert('Kartenzahlung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsProcessing(false);
      setPaymentMethod(null);
    }
  };

  const handleCashPayment = () => {
    setPaymentMethod('cash');
    // For cash payments, we might just mark it as paid without external processing
    console.log('Cash payment recorded for amount:', amount);
    console.log('Appointment ID:', appointmentId);
    
    alert('Cash payment recorded successfully!');
    onClose();
    setPaymentMethod(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white tracking-[0.05em] uppercase">
            Zahlung
          </DialogTitle>
          <DialogDescription className="text-white/60 tracking-[0.05em] uppercase space-y-1">
            <div>Kunde: {customerName || 'N/A'}</div>
            <div>Service: {serviceName || 'N/A'}</div>
            <div>Betrag: €{amount.toFixed(2)}</div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleCardPayment}
            disabled={isProcessing}
            className="w-full bg-transparent border border-white/20 text-white hover:bg-white hover:text-black transition-colors tracking-[0.05em] uppercase py-6"
          >
            {isProcessing && paymentMethod === 'card' ? 'Verarbeitung...' : 'KARTE'}
          </Button>
          
          <Button
            onClick={handleCashPayment}
            disabled={isProcessing}
            className="w-full bg-transparent border border-white/20 text-white hover:bg-white hover:text-black transition-colors tracking-[0.05em] uppercase py-6"
          >
            BAR
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-transparent border border-white/20 px-8 py-3 tracking-[0.1em] hover:bg-white hover:text-black transition-colors uppercase"
          >
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}