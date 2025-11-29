import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoImage from "@/assets/logo.png";
import { useSignup, useSignin } from "@/hooks/useAuth";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === "/signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = useSignup();
  const signin = useSignin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // Login
        await signin.mutateAsync({ email, password });
        alert("Login successful!");
        navigate("/trade");
      } else {
        // Signup - requires name field for backend
        await signup.mutateAsync({
          email,
          password,
          name: email.split('@')[0] // Use email username as name
        });
        alert("Signup successful!");
        navigate("/trade");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Authentication failed";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-8">
              <img src={logoImage} alt="TradeX" className="h-12 mx-auto" />
            </Link>
            <h1 className="text-4xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Login to continue trading"
                : "Sign up to start trading"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-extrabold mb-2 block">EMAIL</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="font-bold"
              />
            </div>

            <div>
              <label className="text-sm font-extrabold mb-2 block">PASSWORD</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="font-bold"
              />
            </div>

            <Button
              type="submit"
              disabled={signup.isPending || signin.isPending}
              className="w-full py-6 text-base font-extrabold rounded-full"
            >
              {signup.isPending || signin.isPending
                ? "LOADING..."
                : isLogin
                ? "LOGIN"
                : "SIGN UP"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to={isLogin ? "/signup" : "/signin"}
              className="text-sm font-bold hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
