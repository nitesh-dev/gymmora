import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { supabase } from '../services/supabase';

export function useLoginViewModel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Validate admin role via backend API
      const profile = await authService.getAdminProfile();
      
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      queryClient.setQueryData(['auth-user'], profile);
      notifications.show({
        title: 'Login successful',
        message: `Welcome back, ${profile.name || email}!`,
        color: 'green',
      });
      navigate('/');
    } catch (error: any) {
      notifications.show({
        title: 'Login failed',
        message: error.message || 'Invalid credentials',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleLogin,
  };
}
