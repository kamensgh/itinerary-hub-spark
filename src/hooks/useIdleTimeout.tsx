import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UseIdleTimeoutProps {
  timeoutMinutes?: number;
  onIdle?: () => void;
}

export const useIdleTimeout = ({ 
  timeoutMinutes = 60, 
  onIdle 
}: UseIdleTimeoutProps = {}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Session expired',
        description: 'You have been logged out due to inactivity',
      });
      navigate('/auth');
      if (onIdle) onIdle();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const showWarning = () => {
    toast({
      title: 'Session expiring soon',
      description: 'Your session will expire in 5 minutes due to inactivity',
    });
  };

  const resetTimer = () => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timeout (5 minutes before logout)
    const warningTime = (timeoutMinutes - 5) * 60 * 1000;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(showWarning, warningTime);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    // Only enable idle timeout for authenticated users
    if (!user) {
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle the reset function to avoid excessive calls
    let isThrottled = false;
    const throttledReset = () => {
      if (!isThrottled) {
        resetTimer();
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, 1000); // Throttle for 1 second
      }
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, throttledReset);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledReset);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [timeoutMinutes, user]);

  return { resetTimer };
};
