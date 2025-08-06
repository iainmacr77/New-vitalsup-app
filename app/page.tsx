import { redirect } from 'next/navigation';

// The root page for the application.
// Its only purpose is to redirect all traffic to the login page.
export default function RootPage() {
  redirect('/login');
}