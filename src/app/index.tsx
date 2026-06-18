import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RootIndex() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return <Redirect href={user ? '/(app)' : '/login'} />;
}
