
import { Features } from '@/layouts/landing_page/features';
import { Footer } from '@/layouts/landing_page/footer';
import { Hero } from '@/layouts/landing_page/hero';
import { Navbar } from '@/layouts/landing_page/navbar';
import { PricingTeaser } from '@/layouts/landing_page/pricing';
import { ProductPreview } from '@/layouts/landing_page/productpreview';
import { Testimonials } from '@/layouts/landing_page/testimonial';
import { Head } from '@inertiajs/react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="min-h-screen bg-white">
                <Navbar canRegister={canRegister} />
                <Hero />
                <ProductPreview />
                <Features />
                <PricingTeaser />
                <Testimonials />
                <Footer />
            </div>
        </>
    );
}