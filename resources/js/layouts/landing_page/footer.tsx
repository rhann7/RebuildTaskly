import React from "react";
import { Link } from "@inertiajs/react";
import { Earth, Instagram, Linkedin, Mail } from "lucide-react";
import AppLogoIcon from "../../components/app-logo-icon"; // Sesuaikan jika tidak terpakai

export function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-400 py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center bg-white rounded-lg">
                                <AppLogoIcon className="size-6 fill-current text-black" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Sada Taskly</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed max-w-sm">
                            The modern task and workspace management platform designed to help teams collaborate, organize, and achieve more together.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            <SocialLink href="https://www.instagram.com/sadata.indonesia/" icon={Instagram} />
                            <SocialLink href="https://www.linkedin.com/company/teknologi-sada-indonesia/" icon={Linkedin} />
                            <SocialLink href="https://sada.id/" icon={Earth} />
                            <SocialLink href="mailto:info@sada.id" icon={Mail} />
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-white font-bold mb-6 tracking-wide">Product</h3>
                        <ul className="space-y-4 text-sm">
                            <li><FooterLink href="#features">Features</FooterLink></li>
                            <li><FooterLink href="#pricing">Pricing</FooterLink></li>
                            <li><FooterLink href="#">Integrations</FooterLink></li>
                            <li><FooterLink href="#">API</FooterLink></li>
                            <li><FooterLink href="#">Roadmap</FooterLink></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-white font-bold mb-6 tracking-wide">Company</h3>
                        <ul className="space-y-4 text-sm">
                            <li><FooterLink href="#about">About Us</FooterLink></li>
                            <li><FooterLink href="#">Careers</FooterLink></li>
                            <li><FooterLink href="#">Blog</FooterLink></li>
                            <li><FooterLink href="#">Press Kit</FooterLink></li>
                            <li><FooterLink href="#">Contact</FooterLink></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="text-white font-bold mb-6 tracking-wide">Resources</h3>
                        <ul className="space-y-4 text-sm">
                            <li><FooterLink href="#">Documentation</FooterLink></li>
                            <li><FooterLink href="#">Help Center</FooterLink></li>
                            <li><FooterLink href="#">Community</FooterLink></li>
                            <li><FooterLink href="#">Tutorials</FooterLink></li>
                            <li><FooterLink href="#">Status</FooterLink></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-900">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-sm">
                            © {new Date().getFullYear()} Sada Taskly. All rights reserved.
                        </p>
                        <div className="flex gap-8 text-xs font-medium">
                            <a href="#" className="hover:text-red-500 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-red-500 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-red-500 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Sub-komponen agar kode lebih bersih
function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-sm"
        >
            <Icon className="w-5 h-5" />
        </a>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} className="hover:text-red-500 transition-colors duration-200">
            {children}
        </a>
    );
}