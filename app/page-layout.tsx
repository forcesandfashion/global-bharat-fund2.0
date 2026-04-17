import { AuthProvider } from '@/store/auth';

// Root page is wrapped separately since it sits outside route groups
// The Navbar inside uses useAuth() which requires the AuthProvider context
export default function RootPageLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
