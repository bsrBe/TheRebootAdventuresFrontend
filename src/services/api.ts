/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RegistrationData {
  fullName: string;
  email: string;
  phoneNumber: string;
  age: number;
  weight: number;   
  height: number;
  horseRidingExperience: string;
  referralSource: string;
  telegramData?: any;
}

export const api = {
  async registerUser(data: RegistrationData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to register');
    }

    return response.json();
  },

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }
};
