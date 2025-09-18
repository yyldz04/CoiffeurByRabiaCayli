// Example integration for AppointmentPage.tsx
// This shows how to use the new edge function service

import { edgeFunctionService } from '../utils/edge-function-service';

// In your AppointmentPage component, replace the existing form submission:

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate form data first
  const appointmentData = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    service_id: formData.service,
    gender: formData.gender,
    appointment_date: formData.date,
    appointment_time: formData.time,
    special_requests: formData.requests || undefined
  };

  // Client-side validation
  if (!edgeFunctionService.validateAppointmentData(appointmentData)) {
    alert('Bitte überprüfen Sie Ihre Eingaben.');
    return;
  }

  try {
    setShowOverview(true); // Show loading state
    
    // Call the edge function
    const result = await edgeFunctionService.createAppointment(appointmentData);
    
    if (result.success) {
      // Success - show confirmation
      alert(`Termin erfolgreich erstellt! ID: ${result.appointment_id}`);
      // Reset form or redirect
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        service: '',
        gender: '',
        date: '',
        time: '',
        requests: ''
      });
    } else {
      // Error - show error message
      alert(`Fehler beim Erstellen des Termins: ${result.error}`);
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
    alert('Ein unerwarteter Fehler ist aufgetreten.');
  } finally {
    setShowOverview(false);
  }
};
