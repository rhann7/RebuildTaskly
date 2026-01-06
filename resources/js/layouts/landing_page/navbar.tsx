import { Menu } from "lucide-react";
import AppLogoIcon from "../../components/app-logo-icon";
import { home, login, register } from "@/routes";
import { Link } from "@inertiajs/react";

export function Navbar() {
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
            
            // Opsional: Update URL tanpa reload agar history tetap terjaga
            window.history.pushState(null, "", `#${id}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center flex-shrink-0">
                        <Link href={home()}>
                            <div className="flex h-16 w-16 items-center justify-center">
                                <AppLogoIcon className="size-full fill-current text-black" />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-10">
                        {/* Panggil fungsi scrollToSection di onClick */}
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

                    <div className="hidden md:flex items-center space-x-5">
                        <Link href={login()} className="text-sm font-semibold text-gray-700">
                            Log in
                        </Link>
                        <Link
                            href={register()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all"
                        >
                            Register
                        </Link>
                    </div>

                    <button className="md:hidden p-2 rounded-xl hover:bg-gray-100">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>
        </nav>
    );
}