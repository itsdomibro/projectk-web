"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ShoppingCart, Package } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(4, "Password minimal 4 karakter").max(32),
});

export default function Home() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { login, role, accessToken } = authStore;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize auth from localStorage on mount
  useEffect(() => {
    if (authStore.initializeAuth) {
      authStore.initializeAuth();
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (accessToken && role) {
      if (role === "admin" || role === "owner") {
        router.push("/owner/dashboard");
      } else if (role === "cashier") {
        router.push("/cashier");
      }
    }
  }, [accessToken, role, router]);

  // Handle redirect after login when role is updated
  useEffect(() => {
    if (shouldRedirect && role) {
      console.log("Login successful. Redirecting to role:", role);
      
      if (role === "admin" || role === "owner") {
        router.push("/owner/dashboard");
      } else if (role === "cashier") {
        router.push("/cashier");
      } else {
        router.push("/cashier");
      }
      
      setShouldRedirect(false);
    }
  }, [shouldRedirect, role, router]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(values);
      setShouldRedirect(true);
    } catch (err: any) {
      console.error("Login failed: ", err);
      setError(err?.response?.data?.message || "Login gagal. Periksa email dan password Anda.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ProjectK</h1>
          <p className="text-gray-600">Sistem Kasir & Manajemen Toko</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Masuk ke Sistem</CardTitle>
            <CardDescription className="text-center">
              Masukkan kredensial Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="nama@example.com"
                          disabled={isLoading}
                          {...field}
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="pt-4 border-t border-gray-200 w-full">
              <div className="text-xs text-gray-500 text-center space-y-2">
                <p className="font-semibold text-gray-700">Login sebagai:</p>
                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Admin/Owner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    <span>Kasir</span>
                  </div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 ProjectK. Sistem POS Modern untuk UMKM.
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}