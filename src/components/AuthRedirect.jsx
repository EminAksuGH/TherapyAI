import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component that redirects authenticated users away from auth pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if user is not authenticated
 * @param {string} props.redirectTo - Where to redirect authenticated users (default: '/')
 * @param {boolean} props.requireEmailVerification - Whether to check for email verification (default: false)
 * @param {boolean} props.allowOobCode - Skip redirect when oobCode query param is present (default: false)
 */
const AuthRedirect = ({ 
  children, 
  redirectTo = '/', 
  requireEmailVerification = false,
  allowOobCode = false
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasOobCode = allowOobCode && Boolean(searchParams.get('oobCode'));

  useEffect(() => {
    if (currentUser && !hasOobCode) {
      // If user is authenticated
      if (requireEmailVerification) {
        // Only redirect if email is also verified
        if (currentUser.emailVerified) {
          navigate(redirectTo, { replace: true });
        }
      } else {
        // Redirect regardless of email verification status
        navigate(redirectTo, { replace: true });
      }
    }
  }, [currentUser, navigate, redirectTo, requireEmailVerification, hasOobCode]);

  // Don't render children if user is authenticated and should be redirected
  if (currentUser && !hasOobCode) {
    if (requireEmailVerification) {
      // Only hide if email is verified
      if (currentUser.emailVerified) {
        return null;
      }
    } else {
      // Hide regardless of email verification
      return null;
    }
  }

  return children;
};

export default AuthRedirect;
