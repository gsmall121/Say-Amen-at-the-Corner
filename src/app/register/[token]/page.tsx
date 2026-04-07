import { redirect } from 'next/navigation';

// Registration via invite links is no longer used — login is code-based
export default function RegisterPage() {
  redirect('/login');
}
