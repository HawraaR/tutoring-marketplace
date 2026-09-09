import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import {
  Mail,
  Globe,
  MessageCircle,
  Share2,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">AcademiConnect</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering Lebanese students through peer-to-peer knowledge sharing and academic excellence since 2024.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/find-tutors" className="hover:text-primary transition-colors">Find a Tutor</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Become a Tutor</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Success Stories</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">AI Matching Logic</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Payment Security</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 pt-8 border-t">
          <div className="max-w-md mx-auto lg:mx-0">
            <h3 className="font-semibold mb-2">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join 2,000+ students getting study tips and early access.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 AcademiConnect Lebanon. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link to="#" className="hover:text-primary">Terms</Link>
            <Link to="#" className="hover:text-primary">Privacy</Link>
            <Link to="#" className="hover:text-primary">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
