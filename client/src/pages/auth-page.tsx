import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, Gamepad2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = React.useState(true);

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute h-32 w-32 rounded-full bg-purple-500 blur-xl animate-pulse top-20 left-20" />
        <div className="absolute h-40 w-40 rounded-full bg-blue-500 blur-xl animate-pulse delay-700 bottom-40 right-20" />
        <div className="absolute h-24 w-24 rounded-full bg-cyan-500 blur-xl animate-pulse delay-1000 top-60 right-40" />
      </div>

      <div className="flex min-h-screen">
        <div className="flex-1 flex flex-col justify-center p-8 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center mb-6">
              <Gamepad2 className="h-12 w-12 text-purple-400 animate-bounce" />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-white mb-8">
              Welcome to GameHub
            </h2>

            <div className="bg-black/30 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden transition-all duration-500">
              <div className="flex justify-center mb-4 p-4">
                <div className="inline-flex rounded-lg bg-black/20 p-1">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${isLogin ? 'bg-purple-600 text-white' : 'text-gray-400'
                      }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${!isLogin ? 'bg-purple-600 text-white' : 'text-gray-400'
                      }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isLogin ? <EnhancedLoginForm /> : <EnhancedRegisterForm />}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative w-1/2">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center space-y-6">
              <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
                Level Up Your Gaming Experience
              </h1>
              <p className="text-xl text-purple-200 max-w-xl mx-auto leading-relaxed">
                Join our elite gaming community to compete in epic battles,
                track your legendary progress, and climb the global leaderboards!
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <div className="bg-black/20 backdrop-blur p-4 rounded-lg">
                  <p className="text-3xl font-bold text-purple-400 mb-2">10k+</p>
                  <p className="text-sm text-purple-200">Active Players</p>
                </div>
                <div className="bg-black/20 backdrop-blur p-4 rounded-lg">
                  <p className="text-3xl font-bold text-purple-400 mb-2">50+</p>
                  <p className="text-sm text-purple-200">Games Available</p>
                </div>
                <div className="bg-black/20 backdrop-blur p-4 rounded-lg">
                  <p className="text-3xl font-bold text-purple-400 mb-2">24/7</p>
                  <p className="text-sm text-purple-200">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnhancedLoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-purple-200">Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-purple-400" />
                  <Input
                    {...field}
                    className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-purple-300/50"
                    placeholder="Enter your username"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-purple-200">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-purple-400" />
                  <Input
                    type="password"
                    {...field}
                    className="pl-10 bg-black/20 border-purple-500/20 text-white"
                    placeholder="Enter your password"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 h-11"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Enter the Arena"
          )}
        </Button>
      </form>
    </Form>
  );
}

function EnhancedRegisterForm() {
  const { registerMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-purple-200">Choose Your Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-purple-400" />
                  <Input
                    {...field}
                    className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-purple-300/50"
                    placeholder="Pick a unique username"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-purple-200">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-purple-400" />
                  <Input
                    type="email"
                    {...field}
                    className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-purple-300/50"
                    placeholder="Enter your email"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-purple-200">Create Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-purple-400" />
                  <Input
                    type="password"
                    {...field}
                    className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-purple-300/50"
                    placeholder="Create a strong password"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 h-11"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Begin Your Journey"
          )}
        </Button>
      </form>
    </Form>
  );
}
