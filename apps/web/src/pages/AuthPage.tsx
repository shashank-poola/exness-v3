import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import tradexLogo from "@/assets/tradex-logo.png";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log(isLogin ? "Login" : "Signup", { email, password });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <img src={tradexLogo} alt="TradeX" className="h-8" />
          </Link>
        </div>
      </nav>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground">
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
              className="w-full py-6 text-base font-extrabold rounded-full"
            >
              {isLogin ? "LOGIN" : "SIGN UP"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
