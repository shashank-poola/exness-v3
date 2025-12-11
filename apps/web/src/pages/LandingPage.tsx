import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TradingButton from "@/components/ui/trading-button";
import { ArrowUpRight } from "lucide-react";
import tradexLogoImage from "@/assets/tradex-logo.png";
import heroBgImage from "@/assets/hero-bg.png";
import backgroundTradexImage from "@/assets/background-tradex.png";
import demo1Image from "@/assets/demoimage.png";
import whiteLogoImage from "@/assets/whitelogo.png";
import { useEffect, useRef, useState } from 'react';

const LandingPage = () => {
  const [demoVisible, setDemoVisible] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDemoVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (demoRef.current) {
      observer.observe(demoRef.current);
    }

    return () => {
      if (demoRef.current) {
        observer.unobserve(demoRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section - Full page with blur transition from navbar */}
      <section
        className="relative h-screen flex items-center justify-center px-6"
        style={{
          backgroundImage: `url(${heroBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Navigation overlay on hero background */}
        <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm z-10">
          <nav className="px-6 lg:px-12 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                {/* TradeX logo on left */}
                <div className="flex items-center">
                  <img src={tradexLogoImage} alt="TradeX" className="h-10" />
                </div>

                {/* Navigation links in center - capsule shape */}
                <div className="landing-heading hidden md:flex items-center gap-1 px-4 py-2 border-2 border-black rounded-half">
                  <Link
                    to="/"
                    className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/docs"
                    className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors"
                  >
                    Documentation
                  </Link>
                  <Link
                    to="/trade"
                    className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors"
                  >
                    Trade
                  </Link>
                </div>

                {/* Sign up button on right - black with arrow */}
                <Button
                  asChild
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm font-medium rounded-full flex items-center gap-2"
                >
                  <Link to="/signin">
                    Sign up
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </nav>
        </div>
        {/* Content container */}
        <div className="max-w-4xl mx-auto text-center z-20" style={{ fontFamily: 'Inter, sans-serif' }}>
          {/* Logo above heading - decreased size */}
          <img
            src={backgroundTradexImage}
            alt="TradeX Logo"
            className="h-14 mx-auto mb-4"
          />

          {/* Main heading - black text with Halo Grotesk */}
          <h1 className="landing-heading text-4xl md:text-5xl lg:text-8xl xl:text-8xl font-black text-black mb-12 tracking-tight leading-tight text-center">
            One Platform
            <br />
            Infinite Trades
          </h1>

          {/* Start Trading button */}
          <div className="flex justify-center mt-18">
            <Link to="/trade">
              <TradingButton />
            </Link>
          </div>
        </div>
      </section>

      {/* Trading Platform Demo Section - Below Hero */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-white to-gray-50">

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="landing-heading text-4xl md:text-5xl font-bold text-black mb-4">
              A High-Performance Trading Platform
            </h2>
            <p className="text-lg text-gray-600">
              Trade global markets with precision, speed, and confidence.
            </p>
          </div>

          {/* Trading Platform Demo Image with animation and no outline */}
          <div
            ref={demoRef}
            className={`flex justify-center transition-all duration-1000 ease-out transform ${
              demoVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-12 scale-95'
            }`}
          >
            <img
              src={demo1Image}
              alt="Trading Platform Demo"
              className="w-full max-w-5xl rounded-lg shadow-2xl"
              style={{ border: 'none', outline: 'none' }}
            />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description */}
            <div className="col-span-1 md:col-span-2">
              <img src={whiteLogoImage} alt="TradeX" className="h-8 mb-4" />
              <p className="text-gray-400 mb-6 max-w-md">
                Your trusted platform for global trading. Execute trades with precision and confidence on markets worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="https://x.com/shashankpoola" className="text-gray-400 hover:text-white transition-colors">
                  X
                </a>
                <a href="https://github.com/shashank-poola/exness-v3" className="text-gray-400 hover:text-white transition-colors">
                  Github
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="landing-heading font-semibold text-lg mb-4">Products</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/trade" className="text-gray-400 hover:text-white transition-colors">
                    Trading Platform
                  </Link>
                </li>
                <li>
                  <Link to="/docs" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    API Access
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Mobile App
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="landing-heading font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 TradeX Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;