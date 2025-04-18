import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckIcon, ArrowRightIcon, ChevronRightIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { name: "Basic Task Management", included: "free" },
  { name: "Up to 3 Projects", included: "free" },
  { name: "Basic Note Taking", included: "free" },
  { name: "Unlimited Projects", included: "plus" },
  { name: "Advanced Task Analytics", included: "plus" },
  { name: "Team Collaboration (up to 5)", included: "plus" },
  { name: "Custom Project Templates", included: "pro" },
  { name: "Priority Support", included: "pro" },
  { name: "Team Collaboration (unlimited)", included: "pro" },
];

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    level: "free",
    description: "Perfect for individuals and small projects",
  },
  {
    name: "Plus",
    price: { monthly: 9.99, yearly: 99.99 },
    level: "plus",
    popular: true,
    description: "Great for professionals and growing teams",
  },
  {
    name: "Pro",
    price: { monthly: 19.99, yearly: 199.99 },
    level: "pro",
    description: "For teams that need advanced features",
  },
];

const featureIcons = {
  project: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  task: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  note: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
};

const Index: React.FC = () => {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("plus");

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
  };

  const shouldShowCheck = (included: string, level: string): boolean => {
    if (included === "free") return true;
    if (included === "plus" && (level === "plus" || level === "pro")) return true;
    if (included === "pro" && level === "pro") return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <header className="py-6 px-8 flex justify-between items-center backdrop-blur-sm bg-white/70 sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
              TC
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">TaskCanvas</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/features">Features</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/pricing">Pricing</Link>
          </Button>
          {user ? (
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <section className="relative py-12 md:py-24">
          {/* Background blur elements */}
          <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/2 -translate-y-1/3 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          <div className="relative text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-block"
            >
              <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                Project Management Simplified
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
            >
              Manage Your Projects{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500">
                with Ease
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 max-w-2xl mx-auto text-xl text-gray-600"
            >
              TaskCanvas helps you organize your projects, tasks, and notes in one place. 
              Collaborate with your team and stay on top of your work.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4 justify-center"
            >
              <Button 
                size="lg" 
                asChild 
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Link to={user ? "/dashboard" : "/auth"} className="flex items-center gap-2">
                  {user ? "Go to Dashboard" : "Get Started for Free"}
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                asChild 
                className="px-8 py-6 text-lg rounded-xl border-2 transition-all hover:bg-gray-50"
              >
                <Link to="/features" className="flex items-center gap-2">
                  Take a Tour
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
          
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 max-w-5xl mx-auto relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <img 
                src="/main_img.png" 
                alt="TaskCanvas Dashboard" 
                className="w-full h-auto"
                onError={(e) => {
                  // If image fails to load, add a gray background
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.height = '400px';
                }}
              />
            </div>
            
            {/* Floating elements on the dashboard image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -left-4 top-1/4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 hidden md:block"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tasks Completed</p>
                  <p className="text-xl font-bold">12/15</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute -right-4 top-1/3 bg-white p-4 rounded-xl shadow-lg border border-gray-100 hidden md:block"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <StarIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Project Progress</p>
                  <p className="text-xl font-bold">80%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
        
        <section className="py-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your projects effectively
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="bg-purple-100 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                <div className="text-purple-600">
                  {featureIcons.project}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Project Management</h3>
              <p className="text-gray-600">
                Create and organize projects. Keep track of progress and deadlines with our intuitive interface.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="bg-blue-100 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <div className="text-blue-600">
                  {featureIcons.task}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Task Tracking</h3>
              <p className="text-gray-600">
                Create tasks, set priorities, and track progress to keep your projects on schedule and your team aligned.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="bg-indigo-100 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-indigo-200 transition-colors duration-300">
                <div className="text-indigo-600">
                  {featureIcons.note}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rich Note Taking</h3>
              <p className="text-gray-600">
                Capture ideas, requirements, and documentation with our rich text editor that supports markdown and media.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for you and your team
            </p>
            
            <div className="flex justify-center mt-8 mb-10">
              <div className="inline-flex items-center gap-2 bg-gray-100 p-1 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={`px-6 py-2 rounded-lg transition-all ${!isYearly ? "bg-white shadow-md text-purple-600 font-medium" : "text-gray-600"}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={`px-6 py-2 rounded-lg transition-all ${isYearly ? "bg-white shadow-md text-purple-600 font-medium" : "text-gray-600"}`}
                >
                  Yearly <span className="text-xs text-green-600 font-medium inline-block ml-1">Save 20%</span>
                </button>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                onClick={() => handlePlanSelect(plan.level)}
                className={`
                  bg-white rounded-2xl border-2 p-8 transition-all cursor-pointer relative
                  ${selectedPlan === plan.level 
                    ? 'ring-4 ring-purple-200 border-purple-500 shadow-xl transform scale-105 z-10' 
                    : 'hover:shadow-lg border-gray-200 hover:border-purple-200'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-1 rounded-full text-sm font-medium shadow-md">
                    Popular
                  </div>
                )}
                
                <div className={`mb-6 ${plan.popular ? 'mt-2' : ''}`}>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-bold">${isYearly ? plan.price.yearly : plan.price.monthly}</span>
                    <span className="text-gray-500">{plan.price.monthly > 0 ? `/${isYearly ? 'year' : 'month'}` : ''}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                </div>
                
                <Button 
                  className={`w-full mb-8 py-6 rounded-xl ${
                    plan.level === 'free' 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all'
                  }`}
                  asChild
                >
                  <Link to={plan.level === 'free' ? "/auth" : "/pricing"}>
                    {plan.level === 'free' ? 'Get Started' : 'Choose Plan'}
                  </Link>
                </Button>
                
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex items-center">
                      {shouldShowCheck(feature.included, plan.level) ? (
                        <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <CheckIcon className="h-3 w-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 text-gray-300 mr-3">-</div>
                      )}
                      <span className={`${shouldShowCheck(feature.included, plan.level) ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-3xl p-12 my-20 text-center text-white overflow-hidden relative"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-10 -top-10 h-64 w-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 h-64 w-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-6">Ready to get started?</h3>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join thousands of teams using TaskCanvas to manage their projects and boost productivity.
            </p>
            <Button size="lg" asChild className="bg-white text-purple-700 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg">
              <Link to={user ? "/dashboard" : "/auth"} className="flex items-center gap-2">
                {user ? "Go to Dashboard" : "Try TaskCanvas for Free"}
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </main>
      
      <footer className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
                  TC
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">TaskCanvas</h3>
              </div>
              <p className="text-gray-500 mb-4">
                Your complete project management solution for teams of all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-gray-800">Product</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-gray-800">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-gray-800">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} TaskCanvas. All rights reserved.
            </p>
            <div className="mt-6 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
