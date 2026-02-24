import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { House, ArrowLeft, ShieldX, SearchX, ServerCrash } from 'lucide-react';

type Props = {
    status: number;
};

const errors = {
    403: {
        icon: ShieldX,
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
    },
    404: {
        icon: SearchX,
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist or has been moved.',
    },
    500: {
        icon: ServerCrash,
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
    },
    503: {
        icon: ServerCrash,
        title: 'Service Unavailable',
        description: 'We are currently under maintenance. Please check back soon.',
    },
};

export default function ErrorPage({ status }: Props) {
    const error = errors[status as keyof typeof errors] ?? {
        icon: ServerCrash,
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again.',
    };

    const Icon = error.icon;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
            <Head title={`${status} - ${error.title}`} />

            <div className="flex flex-col items-center gap-6 max-w-md">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-9 w-9 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <p className="text-6xl font-black tracking-tight text-foreground">{status}</p>
                    <h1 className="text-xl font-semibold text-foreground">{error.title}</h1>
                    <p className="text-sm text-muted-foreground">{error.description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </button>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                    >
                        <House className="h-4 w-4" /> Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}