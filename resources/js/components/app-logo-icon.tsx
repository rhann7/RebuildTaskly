export default function AppLogoIcon({ className }: { className?: string }) {
    return (
        <img 
            src="/images/logos/logo-sada.png" 
            alt="Logo" 
            className={`${className} object-contain`}
            style={{ 
                imageRendering: 'auto', 
            }} 
        />
    );
}