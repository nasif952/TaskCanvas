
import React, { useState } from 'react';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

enum AuthView {
  SIGN_IN,
  SIGN_UP,
  FORGOT_PASSWORD
}

const AuthPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>(AuthView.SIGN_IN);
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-2">TaskCanvas</h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          Your all-in-one project management solution
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {currentView === AuthView.SIGN_IN && (
          <SignInForm 
            onToggleForm={() => setCurrentView(AuthView.SIGN_UP)}
            onForgotPassword={() => setCurrentView(AuthView.FORGOT_PASSWORD)}
          />
        )}
        
        {currentView === AuthView.SIGN_UP && (
          <SignUpForm 
            onToggleForm={() => setCurrentView(AuthView.SIGN_IN)}
          />
        )}
        
        {currentView === AuthView.FORGOT_PASSWORD && (
          <ForgotPasswordForm 
            onBackToSignIn={() => setCurrentView(AuthView.SIGN_IN)}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
