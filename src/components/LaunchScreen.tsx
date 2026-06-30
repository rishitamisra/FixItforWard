import React, { useState, useEffect } from "react";
import { 
  Compass, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Check, 
  Send, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface LaunchScreenProps {
  onLoginSuccess: (userProfile: {
    name: string;
    age: number;
    phone: string;
    city: string;
    email: string;
    username: string;
  }) => void;
  mousePos: { x: number; y: number };
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onLoginSuccess, mousePos }) => {
  const [activeMode, setActiveMode] = useState<"signin" | "signup">("signin");
  
  // Sign In State
  const [signinUsername, setSigninUsername] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinError, setSigninError] = useState("");

  // Sign Up States
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1); // 1: Personal Details, 2: OTP & Credentials
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");

  // Reset errors on mode toggle
  useEffect(() => {
    setSigninError("");
    setSignUpError("");
    setOtpError("");
  }, [activeMode]);

  // Demo Sign In accounts fallback list
  const getDemoAccounts = () => {
    const saved = localStorage.getItem("fixitforward_registered_users");
    const registered = saved ? JSON.parse(saved) : [];
    return [
      { username: "citizen", password: "password123", name: "Diana Prince", age: 28, phone: "+91 9876543210", city: "Bengaluru", email: "diana@fixitforward.in" },
      ...registered
    ];
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinUsername.trim() || !signinPassword.trim()) {
      setSigninError("Please fill in all credentials.");
      return;
    }

    const accounts = getDemoAccounts();
    const match = accounts.find(
      (a) => a.username.toLowerCase() === signinUsername.toLowerCase().trim() && a.password === signinPassword
    );

    if (match) {
      onLoginSuccess({
        name: match.name,
        age: match.age,
        phone: match.phone,
        city: match.city,
        email: match.email,
        username: match.username
      });
    } else {
      setSigninError("Invalid username or password. Try 'citizen' / 'password123'");
    }
  };

  const handleSendOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim() || !phone.trim() || !city.trim() || !email.trim()) {
      setSignUpError("Please fill in all profile fields before sending OTP.");
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 12 || ageNum > 110) {
      setSignUpError("Please enter a valid age (12-110).");
      return;
    }
    if (phone.length < 10) {
      setSignUpError("Please enter a valid phone number.");
      return;
    }
    if (!email.includes("@")) {
      setSignUpError("Please enter a valid email address.");
      return;
    }

    setSignUpError("");
    setOtpSent(true);
    setSignUpStep(2);
  };

  const handleVerifyOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (otpInput === "1947" || otpInput === "1234" || otpInput.length === 4) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Invalid OTP. Hint: Enter '1947' (Year of Independence) to instantly verify!");
    }
  };

  const handleSignUpComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setSignUpError("Please generate a username and password.");
      return;
    }
    if (username.length < 3) {
      setSignUpError("Username must be at least 3 characters long.");
      return;
    }
    if (password.length < 6) {
      setSignUpError("Password must be at least 6 characters long.");
      return;
    }

    // Save user in local storage
    const saved = localStorage.getItem("fixitforward_registered_users");
    const registered = saved ? JSON.parse(saved) : [];
    
    // Check if username is taken
    if (registered.some((u: any) => u.username.toLowerCase() === username.toLowerCase().trim()) || username.toLowerCase().trim() === "citizen") {
      setSignUpError("This username is already taken. Try a different one.");
      return;
    }

    const newUser = {
      username: username.toLowerCase().trim(),
      password,
      name: name.trim(),
      age: parseInt(age),
      phone: phone.trim(),
      city: city.trim(),
      email: email.trim()
    };

    registered.push(newUser);
    localStorage.setItem("fixitforward_registered_users", JSON.stringify(registered));

    // Log user in automatically
    onLoginSuccess({
      name: newUser.name,
      age: newUser.age,
      phone: newUser.phone,
      city: newUser.city,
      email: newUser.email,
      username: newUser.username
    });
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess({
      name: "Diana Prince",
      age: 28,
      phone: "+91 9876543210",
      city: "Bengaluru",
      email: "diana@fixitforward.in",
      username: "citizen"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans select-none py-12">
      
      {/* Background Flag Glow Backdrops */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Saffron Aura top-right */}
        <div 
          className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-[#FF9933]/25 to-amber-500/5 blur-3xl mix-blend-multiply dark:mix-blend-screen transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * -35}px, ${mousePos.y * -35}px) scale(1.05)`,
          }}
        />
        {/* Green Aura bottom-left */}
        <div 
          className="absolute -bottom-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-tr from-[#128807]/20 to-emerald-500/5 blur-3xl mix-blend-multiply dark:mix-blend-screen transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px) scale(1.05)`,
          }}
        />
        {/* Ashoka Chakra spinning overlay behind */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] border border-[#000080]/8 dark:border-indigo-500/5 rounded-full flex items-center justify-center transition-transform duration-500"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 15}px), calc(-50% + ${mousePos.y * 15}px)) rotate(${mousePos.x * 20}deg)`,
          }}
        >
          <div className="absolute w-full h-full animate-spin-slow" style={{ animationDuration: "120s" }}>
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className="absolute top-1/2 left-1/2 w-[1.5px] h-1/2 bg-[#000080]/6 dark:bg-indigo-400/4 origin-top"
                style={{
                  transform: `translate(-50%, -100%) rotate(${i * 15}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/70 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col text-center">
        
        {/* Animated Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-750 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none animate-pulse">
            <Compass size={24} className="animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-2">
            <span className="bg-gradient-to-r from-[#FF9933] via-slate-800 to-[#128807] dark:via-slate-100 bg-clip-text text-transparent">
              FixItforWard
            </span>
          </h1>
          
          {/* Bold visual tagline with high-contrast badge highlighted parts */}
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-sm leading-relaxed mt-2">
            "Fix It for your{" "}
            <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-md font-bold text-xs uppercase tracking-wider">
              Ward
            </span>
            , your{" "}
            <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-md font-bold text-xs uppercase tracking-wider">
              City
            </span>
            , your{" "}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500/10 via-white/20 to-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-900/30 rounded-md font-black text-xs tracking-widest">
              INDIA
            </span>{" "}
            and{" "}
            <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-md font-bold text-xs uppercase tracking-wider">
              you
            </span>
            ."
          </p>
        </div>

        {/* Auth Navigation Pills */}
        <div className="flex bg-slate-100/80 dark:bg-slate-950/40 p-1.5 rounded-2xl gap-1.5 mb-6">
          <button
            onClick={() => setActiveMode("signin")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeMode === "signin"
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-350"
            }`}
          >
            Sign In with Account
          </button>
          <button
            onClick={() => {
              setActiveMode("signup");
              setSignUpStep(1);
              setOtpSent(false);
              setOtpVerified(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeMode === "signup"
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-350"
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Error Banners */}
        {signinError && activeMode === "signin" && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 text-left border border-rose-100 dark:border-rose-900/30">
            <AlertCircle size={14} className="shrink-0" />
            <span>{signinError}</span>
          </div>
        )}

        {signUpError && activeMode === "signup" && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 text-left border border-rose-100 dark:border-rose-900/30">
            <AlertCircle size={14} className="shrink-0" />
            <span>{signUpError}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM PANEL */}
        {activeMode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                Username / Email ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="e.g. citizen"
                  value={signinUsername}
                  onChange={(e) => setSigninUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 text-slate-900 dark:text-slate-55 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="password"
                  placeholder="e.g. password123"
                  value={signinPassword}
                  onChange={(e) => setSigninPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 text-slate-900 dark:text-slate-55 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Authenticate Profile</span>
              <ArrowRight size={14} />
            </button>

            {/* Quick Fast-Track Entry Button */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Fast-Track Demo Access
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} className="text-amber-500 animate-spin-slow" />
              <span>Login as Guest (Diana Prince)</span>
            </button>
          </form>
        )}

        {/* 2. SIGN UP FORM PANEL */}
        {activeMode === "signup" && (
          <div className="space-y-4 text-left">
            {/* Step Indicators */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-1.5 rounded-full flex-1 transition-all ${signUpStep === 1 ? "bg-amber-500" : "bg-emerald-500"}`} />
              <div className={`h-1.5 rounded-full flex-1 transition-all ${signUpStep === 2 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`} />
            </div>

            {/* SIGN UP STEP 1: Personal Profile Fields */}
            {signUpStep === 1 && (
              <form className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input
                        type="text"
                        placeholder="e.g. Kabir Dev"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Age
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input
                        type="number"
                        placeholder="e.g. 24"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      City / Ward
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input
                        type="email"
                        placeholder="e.g. dev@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Send OTP Verification Code</span>
                </button>
              </form>
            )}

            {/* SIGN UP STEP 2: OTP Entry + Credentials Generation */}
            {signUpStep === 2 && (
              <div className="space-y-4">
                {/* Simulated OTP Sending notice */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                    🚨 <strong>Verification Required:</strong> An OTP verification code was dispatched to your coordinates at <span className="font-mono">{phone}</span> and <span className="font-mono">{email}</span>.
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 italic mt-1">
                    Demo Code Challenge: Enter Independence Year <strong>"1947"</strong> to verify!
                  </p>
                </div>

                {otpError && (
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold rounded-lg border border-rose-100 dark:border-rose-900/30">
                    {otpError}
                  </div>
                )}

                {/* OTP input & button row */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                      4-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="XXXX"
                      disabled={otpVerified}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-2.5 text-center tracking-widest bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpVerified || otpInput.length < 4}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 transition-colors shrink-0 cursor-pointer h-[40px] flex items-center justify-center gap-1"
                  >
                    {otpVerified ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                </div>

                {/* SUCCESS OTP VERIFIED - SHOW CREDENTIAL CREATOR */}
                {otpVerified ? (
                  <form onSubmit={handleSignUpComplete} className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-350">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/15 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <ShieldCheck size={15} />
                      <span>Verification Successful! Setup your login credentials:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Create Username
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. kabir_dev"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Choose Password
                        </label>
                        <input
                          type="password"
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Register & Login</span>
                    </button>
                  </form>
                ) : (
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button 
                      type="button" 
                      onClick={() => setSignUpStep(1)}
                      className="hover:text-indigo-600 transition-colors uppercase"
                    >
                      ← Back to details
                    </button>
                    <span>Check spam if code doesn't arrive</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
      
      {/* Short disclaimer details inside footer */}
      <div className="mt-8 text-center text-[11px] text-slate-400 relative z-10 max-w-sm space-y-1 leading-normal">
        <p>Official India Ward-Level Democratic Civic Portal.</p>
        <p className="font-mono text-[9px] text-slate-300 dark:text-slate-800">Precision Sandbox | Built using React & Tailwind</p>
      </div>
    </div>
  );
};
