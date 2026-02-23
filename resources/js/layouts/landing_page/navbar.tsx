import React from "react";
import { Menu } from "lucide-react";
import AppLogoIcon from "../../components/app-logo-icon"; // Pastikan path ini benar
import { Link } from "@inertiajs/react";
// Jika menggunakan Ziggy, pastikan memanggil fungsi route() dengan benar.
// Di sini saya asumsikan kamu mem-passing URL secara langsung atau lewat prop jika tidak pakai Ziggy.

export function Navbar({ canRegister = true }: { canRegister?: boolean }) {
    // Fungsi untuk handle smooth scroll dengan offset
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);

        if (element) {
            // Sesuaikan angka 80 dengan tinggi navbar kamu
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });

            // Update URL tanpa reload agar history tetap terjaga
            window.history.pushState(null, "", `#${id}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center flex-shrink-0">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center bg-black rounded-lg">
                                {/* Ganti ini dengan logo aslimu jika perlu */}
                                <AppLogoIcon className="size-6 fill-current text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-zinc-900 hidden sm:block">
                                Sada Taskly
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-10">
                        <a
                            href="#about"
                            onClick={(e) => scrollToSection(e, "about")}
                            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                            About
                        </a>
                        <a
                            href="#features"
                            onClick={(e) => scrollToSection(e, "features")}
                            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#pricing"
                            onClick={(e) => scrollToSection(e, "pricing")}
                            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                            Pricing
                        </a>
                        <a
                            href="#testimonials"
                            onClick={(e) => scrollToSection(e, "testimonials")}
                            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                            Testimonials
                        </a>
                    </div>

                    {/* Auth Actions */}
                    <div className="hidden md:flex items-center space-x-5">
                        <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-black transition-colors">
                            Log in
                        </Link>
                        {canRegister && (
                            <Link
                                href="/register"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
                            >
                                Register
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>
        </nav>
    );
}