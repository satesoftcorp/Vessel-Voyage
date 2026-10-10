import React, { useState, useEffect } from 'react';
import {
  SystemUser,
  UserType,
} from '../types';
import {
  Ship,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  User,
  RefreshCw,
  Building,
  Anchor,
  UserCheck,
  Check,
  Smartphone,
  ChevronRight,
  Fingerprint,
  Radio,
  FileCheck2,
  Globe,
  LifeBuoy,
} from 'lucide-react';

interface AuthPageProps {
  usersList: SystemUser[];
  onLoginSuccess: (user: SystemUser) => void;
  onCancel?: () => void;
  initialMode?: 'login' | 'forgot-password';
  initialUserType?: UserType;
  darkMode?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  usersList,
  onLoginSuccess,
  onCancel,
  initialMode = 'login',
  initialUserType = 'Superadmin',
  darkMode = false,
}) => {
  // Navigation mode: 'login' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'login' | 'forgot-password'>(initialMode);

  // Selected User Type tab for Login
  const [selectedUserType, setSelectedUserType] = useState<UserType>(initialUserType);

  // Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotChannel, setForgotChannel] = useState<'email' | 'sms'>('email');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpGeneratedCode, setOtpGeneratedCode] = useState('749102');
  const [resendTimer, setResendTimer] = useState(45);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // User type categorization helper
  const userTypeOptions: {
    type: UserType;
    label: string;
    badge: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'Superadmin',
      label: 'Super Admin',
      badge: 'Tier 1 Governance',
      description: 'System-wide governance, global tenant settings, root permissions & audits',
      icon: <ShieldCheck className="h-4 w-4" />,
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    },
    {
      type: 'Port users',
      label: 'Port & Terminal Users',
      badge: 'Operations & Fleet',
      description: 'Fleet managers, vessel captains, safety officers, engineers, and logistics terminal staff',
      icon: <Anchor className="h-4 w-4" />,
      color: 'bg-blue-50 text-[#465FFF] dark:bg-blue-950/50 dark:text-[#80CAEE] border-blue-200 dark:border-blue-800/60',
    },
    {
      type: 'Stakeholders',
      label: 'Stakeholders & Regulators',
      badge: 'External & Customs',
      description: 'Port authorities, customs & border protection, cargo shippers, charterers, and insurance surveyors',
      icon: <Building className="h-4 w-4" />,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
  ];

  // Quick preset accounts for the selected user type
  const presetUsers = usersList.filter(
    (u) => (u.userType || u.roleCategory) === selectedUserType
  );

  // Auto-fill a preset user
  const handleSelectPresetUser = (user: SystemUser) => {
    setIdentifier(user.email || user.username);
    setPassword('Maritime@2026');
    setLoginError(null);
  };

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authMode === 'forgot-password' && forgotStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, forgotStep, resendTimer]);

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanIdentifier = identifier.trim().toLowerCase();
    if (!cleanIdentifier) {
      setLoginError('Please enter your registered email address or username.');
      return;
    }

    if (!password) {
      setLoginError('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching user in system
      const foundUser = usersList.find(
        (u) =>
          u.email.toLowerCase() === cleanIdentifier ||
          u.username.toLowerCase() === cleanIdentifier ||
          cleanIdentifier.includes(u.username.toLowerCase())
      );

      if (foundUser) {
        if (foundUser.status === 'Suspended') {
          setLoginError(`Account access suspended for ${foundUser.fullName}. Please contact the Super Admin.`);
          setIsSubmitting(false);
          return;
        }

        setLoginSuccessMsg(`Welcome back, ${foundUser.fullName}! Authenticating terminal session...`);
        setTimeout(() => {
          setIsSubmitting(false);
          onLoginSuccess(foundUser);
        }, 600);
      } else {
        // Fallback demo user for custom login inputs
        const fallbackUser: SystemUser = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          username: cleanIdentifier.split('@')[0],
          email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@voyageis.com`,
          fullName: cleanIdentifier
            .split('@')[0]
            .split('.')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' '),
          userType: selectedUserType,
          role: selectedUserType === 'Superadmin'
            ? 'Super Admin'
            : selectedUserType === 'Port users'
            ? 'Fleet Operations Manager'
            : 'Port & Maritime Authority Officer',
          roleId: selectedUserType === 'Superadmin' ? 'ROL-001' : selectedUserType === 'Port users' ? 'ROL-003' : 'ROL-010',
          roleCategory: selectedUserType,
          organization: selectedUserType === 'Superadmin' ? 'Voyage IS Global HQ' : 'Port of Rotterdam Authority',
          department: 'Maritime Operations',
          status: 'Active',
          isSuperAdmin: selectedUserType === 'Superadmin',
          mfaEnabled: true,
          lastLogin: 'Just now',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString().split('T')[0],
        };

        setLoginSuccessMsg(`Authentication successful for ${fallbackUser.fullName}.`);
        setTimeout(() => {
          setIsSubmitting(false);
          onLoginSuccess(fallbackUser);
        }, 600);
      }
    }, 700);
  };

  // Handle Forgot Password Step 1 (Request OTP / Link)
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) {
      setForgotError('Please enter your registered email address or username.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Generate new 6-digit random code
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpGeneratedCode(generated);
      setForgotStep(2);
      setResendTimer(45);
    }, 600);
  };

  // Handle OTP Code changes
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const nextDigits = [...otpDigits];
    nextDigits[index] = val;
    setOtpDigits(nextDigits);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setForgotError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForgotStep(3);
    }, 600);
  };

  // Quick fill OTP code
  const handleFillDemoOtp = () => {
    setOtpDigits(otpGeneratedCode.split(''));
    setForgotError(null);
  };

  // Handle Password Reset Step 3
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-type and confirm.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForgotStep(4);
    }, 700);
  };

  // Return to Login with reset password populated
  const handleProceedToLoginWithReset = () => {
    setIdentifier(forgotEmail || 'musharof@voyageis.com');
    setPassword(newPassword || 'Maritime@2026');
    setAuthMode('login');
    setForgotStep(1);
    setForgotSuccess(false);
    setLoginSuccessMsg('Password updated successfully. You can now sign in with your new credentials.');
  };

  // Password strength calculation helper
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passScore = calculatePasswordStrength(newPassword);

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center py-6 px-3 sm:px-4 lg:px-6">
      {/* Background Ambience Card */}
      <div className="w-full max-w-5xl rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* Left Side: Maritime Hero & System Overview Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#0B1120] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background wave glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#465FFF]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          {/* Top Logo & App ID */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#465FFF] text-white shadow-lg shadow-[#465FFF]/30">
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1.5 h-3 bg-white rounded-xs" />
                  <span className="w-1.5 h-5 bg-white rounded-xs" />
                  <span className="w-1.5 h-4 bg-white rounded-xs" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-white">Voyage IS</h1>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-white/10">
                    v3.4 Enterprise
                  </span>
                </div>
                <p className="text-xs text-gray-400">Integrated Marine Operations Portal</p>
              </div>
            </div>

            {/* Quick System Description */}
            <div className="mt-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-gray-300 border border-white/10">
                <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Active AIS Bridge & Harbor Telemetry</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl leading-snug">
                Unified Maritime Management System
              </h2>
              <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed">
                Secure portal for Port Authorities, Fleet Operators, Vessel Masters, and Regulators. IMO FAL & ISPS Code compliant.
              </p>
            </div>
          </div>

          {/* Middle: Feature Highlights for Multi-tenant Tiers */}
          <div className="my-8 space-y-3 relative z-10">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 border border-white/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white">Role-Based Access Control</span>
                <p className="text-[11px] text-gray-400">Granular permissions across 3 SaaS tiers & 15 roles</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 border border-white/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                <Ship className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white">Live Voyage & FAL Manifests</span>
                <p className="text-[11px] text-gray-400">IMO FAL Forms 1-7, Ro-Pax Cargo, Passenger SMS 8199</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 border border-white/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                <Lock className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white">Port Security & Multi-Factor</span>
                <p className="text-[11px] text-gray-400">256-Bit TLS encryption & audit trails</p>
              </div>
            </div>
          </div>

          {/* Bottom Notice */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 relative z-10">
            <span>© 2026 Voyage IS Maritime</span>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>TLS 1.3 Secure</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms (Login / Forgot Password) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          
          {/* ==================================================== */}
          {/* 1. SIGN IN (LOGIN) VIEW                             */}
          {/* ==================================================== */}
          {authMode === 'login' && (
            <div className="space-y-6">
              {/* Header Titles */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Sign In to Terminal
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#8A99AD]">
                    Select your User Tier and enter your maritime portal credentials.
                  </p>
                </div>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    Close
                  </button>
                )}
              </div>

              {/* USER TYPE SELECTOR TABS */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#8A99AD]">
                  User Type / Provisioning Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {userTypeOptions.map((opt) => {
                    const isSelected = selectedUserType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        id={`auth-usertype-${opt.type.toLowerCase().replace(/\s+/g, '-')}-btn`}
                        onClick={() => {
                          setSelectedUserType(opt.type);
                          setLoginError(null);
                        }}
                        className={`flex flex-col items-center justify-center rounded-2xl p-2.5 sm:p-3 text-center border transition-all ${
                          isSelected
                            ? 'border-[#465FFF] bg-[#465FFF]/10 dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] shadow-xs font-bold ring-2 ring-[#465FFF]/30'
                            : 'border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#24303F]'
                        }`}
                      >
                        <div className={`mb-1 p-1.5 rounded-xl ${isSelected ? 'bg-[#465FFF] text-white' : 'bg-gray-200 dark:bg-[#2E3A47] text-gray-600 dark:text-gray-300'}`}>
                          {opt.icon}
                        </div>
                        <span className="text-xs font-bold truncate max-w-full">{opt.label}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-400 truncate max-w-full">
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ONE-TAP PRESET ACCOUNT SELECTOR FOR FAST TESTING */}
              {presetUsers.length > 0 && (
                <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#465FFF]" />
                      <span>One-Tap Test Accounts ({selectedUserType})</span>
                    </span>
                    <span className="text-[10px] text-gray-400">Click to autofill</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {presetUsers.slice(0, 4).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectPresetUser(user)}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:border-[#465FFF] hover:text-[#465FFF] transition-all shadow-2xs group"
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          referrerPolicy="no-referrer"
                          className="h-5 w-5 rounded-full object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-left">
                          <p className="font-semibold text-[11px] leading-tight group-hover:text-[#465FFF] dark:group-hover:text-[#80CAEE]">
                            {user.fullName}
                          </p>
                          <p className="text-[9px] text-gray-400 leading-tight">
                            {user.role}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Login Alerts */}
              {loginError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccessMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{loginSuccessMsg}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email or Username */}
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Email Address or Username
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. musharof@voyageis.com or capt.henrik"
                      className="block w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:ring-2 focus:ring-[#465FFF]/20 outline-hidden transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password with Show/Hide */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      id="auth-forgot-password-link"
                      onClick={() => {
                        setAuthMode('forgot-password');
                        setForgotStep(1);
                        setForgotEmail(identifier);
                        setLoginError(null);
                      }}
                      className="text-xs font-bold text-[#465FFF] dark:text-[#80CAEE] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-10 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:ring-2 focus:ring-[#465FFF]/20 outline-hidden transition-colors font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & MFA note */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="login-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#465FFF] focus:ring-[#465FFF] dark:border-[#2E3A47] dark:bg-[#1C2434]"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Remember terminal session
                    </span>
                  </label>

                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>MFA Enabled</span>
                  </span>
                </div>

                {/* Primary Sign In Button */}
                <button
                  id="auth-sign-in-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#465FFF] py-3 text-xs font-bold text-white shadow-md hover:bg-[#3b51e6] active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying Credentials & Permissions...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {selectedUserType}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Single Sign-On (SSO) Options */}
              <div className="pt-4 border-t border-gray-100 dark:border-[#2E3A47] space-y-2">
                <div className="flex items-center justify-center">
                  <span className="bg-white dark:bg-[#1C2434] px-2 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Or enterprise maritime SSO
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const superUser = usersList[0] || presetUsers[0];
                      if (superUser) {
                        setLoginSuccessMsg(`SSO verified for ${superUser.fullName} (Port SAML 2.0)`);
                        setTimeout(() => onLoginSuccess(superUser), 500);
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
                  >
                    <Fingerprint className="h-4 w-4 text-purple-500" />
                    <span>Port Digital ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const captainUser = usersList.find((u) => u.role === 'Vessel Captain') || usersList[0];
                      if (captainUser) {
                        setLoginSuccessMsg(`Bridge SSO token verified for ${captainUser.fullName}`);
                        setTimeout(() => onLoginSuccess(captainUser), 500);
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
                  >
                    <Anchor className="h-4 w-4 text-[#465FFF]" />
                    <span>Bridge Master SSO</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. FORGOT PASSWORD VIEW (MULTI-STEP WIZARD)          */}
          {/* ==================================================== */}
          {authMode === 'forgot-password' && (
            <div className="space-y-6">
              {/* Back to Login header */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  id="forgot-back-to-login-btn"
                  onClick={() => {
                    setAuthMode('login');
                    setForgotError(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#465FFF] dark:hover:text-[#80CAEE] cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Sign In</span>
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                  <span className={`px-2 py-0.5 rounded-full ${forgotStep === 1 ? 'bg-[#465FFF] text-white' : 'bg-gray-100 dark:bg-[#24303F] text-gray-600 dark:text-gray-300'}`}>1</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className={`px-2 py-0.5 rounded-full ${forgotStep === 2 ? 'bg-[#465FFF] text-white' : 'bg-gray-100 dark:bg-[#24303F] text-gray-600 dark:text-gray-300'}`}>2</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className={`px-2 py-0.5 rounded-full ${forgotStep >= 3 ? 'bg-[#465FFF] text-white' : 'bg-gray-100 dark:bg-[#24303F] text-gray-600 dark:text-gray-300'}`}>3</span>
                </div>
              </div>

              {/* STEP 1: Enter Email / Username */}
              {forgotStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <KeyRound className="h-6 w-6 text-[#465FFF]" />
                      <span>Password Recovery</span>
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-[#8A99AD]">
                      Enter your verified enterprise email or system username. We will dispatch a 6-digit security verification code to reset your credentials.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {/* Channel options: Email or SMS */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Select Verification Dispatch Channel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForgotChannel('email')}
                        className={`flex items-center gap-2 rounded-xl p-2.5 border text-xs font-semibold transition-all ${
                          forgotChannel === 'email'
                            ? 'border-[#465FFF] bg-[#465FFF]/10 text-[#465FFF] dark:text-[#80CAEE]'
                            : 'border-gray-200 dark:border-[#2E3A47] text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Mail className="h-4 w-4" />
                        <span>Corporate Email (SMTP)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForgotChannel('sms')}
                        className={`flex items-center gap-2 rounded-xl p-2.5 border text-xs font-semibold transition-all ${
                          forgotChannel === 'sms'
                            ? 'border-[#465FFF] bg-[#465FFF]/10 text-[#465FFF] dark:text-[#80CAEE]'
                            : 'border-gray-200 dark:border-[#2E3A47] text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Smartphone className="h-4 w-4" />
                        <span>SMS Gateway (8199)</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                      >
                        {forgotChannel === 'email' ? 'Registered Email Address' : 'Registered Mobile Number or Username'}
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          {forgotChannel === 'email' ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                        </div>
                        <input
                          id="forgot-email"
                          type="text"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder={forgotChannel === 'email' ? 'musharof@voyageis.com' : '+256 772 890123'}
                          className="block w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:ring-2 focus:ring-[#465FFF]/20 outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    <button
                      id="forgot-request-otp-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#465FFF] py-3 text-xs font-bold text-white shadow-md hover:bg-[#3b51e6] active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Dispatching Security OTP Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification OTP Code</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: Enter 6-digit OTP Code */}
              {forgotStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-emerald-500" />
                      <span>Enter Verification Code</span>
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-[#8A99AD]">
                      We sent a 6-digit OTP code to <strong className="text-gray-900 dark:text-white">{forgotEmail || 'your account'}</strong>. Enter it below to proceed.
                    </p>
                  </div>

                  {/* Simulated Dispatch Notification Banner */}
                  <div className="rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/80 dark:bg-blue-950/40 p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs text-[#465FFF] dark:text-[#80CAEE]">
                      <Radio className="h-4 w-4 animate-pulse text-emerald-500" />
                      <div>
                        <span className="font-bold">Simulated OTP Code:</span>{' '}
                        <span className="font-mono font-black text-sm text-gray-900 dark:text-white bg-white dark:bg-[#1C2434] px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                          {otpGeneratedCode}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="forgot-autofill-otp-btn"
                      onClick={handleFillDemoOtp}
                      className="rounded-lg bg-[#465FFF] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-[#3b51e6]"
                    >
                      Autofill Code
                    </button>
                  </div>

                  {forgotError && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {/* OTP 6 Digits Inputs */}
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="flex justify-between gap-2 max-w-sm mx-auto">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          className="w-11 h-13 text-center text-lg font-mono font-bold rounded-xl border border-gray-300 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white focus:border-[#465FFF] focus:ring-2 focus:ring-[#465FFF]/20 outline-hidden"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD]">
                      <span>
                        Didn't receive code?{' '}
                        {resendTimer > 0 ? (
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Resend in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const gen = Math.floor(100000 + Math.random() * 900000).toString();
                              setOtpGeneratedCode(gen);
                              setResendTimer(45);
                            }}
                            className="font-bold text-[#465FFF] dark:text-[#80CAEE] hover:underline"
                          >
                            Resend OTP Code
                          </button>
                        )}
                      </span>
                    </div>

                    <button
                      id="forgot-verify-otp-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#465FFF] py-3 text-xs font-bold text-white shadow-md hover:bg-[#3b51e6] active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Set New Password</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 3: Enter New Password */}
              {forgotStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <Lock className="h-6 w-6 text-[#465FFF]" />
                      <span>Set New Password</span>
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-[#8A99AD]">
                      Choose a strong, compliant maritime security password for <strong className="text-gray-900 dark:text-white">{forgotEmail}</strong>.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="forgot-new-password"
                        className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="forgot-new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="block w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-10 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:ring-2 focus:ring-[#465FFF]/20 outline-hidden font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password Strength Bar */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-500">
                          <span>Password Strength</span>
                          <span className="font-bold">
                            {passScore <= 1 && 'Weak'}
                            {passScore === 2 && 'Medium'}
                            {passScore === 3 && 'Strong'}
                            {passScore === 4 && 'Very Secure'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 h-1.5">
                          <div className={`rounded-full ${passScore >= 1 ? 'bg-amber-400' : 'bg-gray-200 dark:bg-[#2E3A47]'}`} />
                          <div className={`rounded-full ${passScore >= 2 ? 'bg-amber-500' : 'bg-gray-200 dark:bg-[#2E3A47]'}`} />
                          <div className={`rounded-full ${passScore >= 3 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-[#2E3A47]'}`} />
                          <div className={`rounded-full ${passScore >= 4 ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-[#2E3A47]'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="forgot-confirm-password"
                        className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="forgot-confirm-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="block w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:ring-2 focus:ring-[#465FFF]/20 outline-hidden font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      id="forgot-save-password-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Updating Encrypted Credentials...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Update Password & Secure Account</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4: Success Screen */}
              {forgotStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-md">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Password Reset Successfully!
                    </h3>
                    <p className="mt-1.5 max-w-sm mx-auto text-xs text-gray-500 dark:text-[#8A99AD]">
                      Your account credentials for <strong className="text-gray-900 dark:text-white">{forgotEmail}</strong> have been updated. You can now sign in to your terminal.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      id="forgot-finish-login-btn"
                      onClick={handleProceedToLoginWithReset}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#465FFF] py-3 text-xs font-bold text-white shadow-md hover:bg-[#3b51e6] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>Proceed to Sign In with New Password</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Security Compliance Badges */}
          <div className="pt-6 border-t border-gray-100 dark:border-[#2E3A47] flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#465FFF]" />
                <span>IMO FAL Standard 2024</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>ISPS Code Tier 1</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              Voyage Information Systems Auth Gateway
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
