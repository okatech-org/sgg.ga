/**
 * SGG Digital — Error Boundary
 * 
 * Attrape les erreurs React non gérées et affiche une page de secours
 * au lieu d'un écran blanc. Enregistre l'erreur via le logger structuré.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { logger } from '@/services/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('React Error Boundary caught an error', {
            error: error.message,
            stack: error.stack?.slice(0, 500),
            componentStack: errorInfo.componentStack?.slice(0, 500),
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        {/* Icon */}
                        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Une erreur est survenue
                            </h1>
                            <p className="text-muted-foreground">
                                L'application a rencontré une erreur inattendue.
                                Nos équipes ont été notifiées.
                            </p>
                        </div>

                        {/* Error details (dev only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-muted rounded-lg p-4 text-left">
                                <p className="text-xs font-mono text-destructive break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Réessayer
                            </button>
                            <button
                                onClick={() => window.location.assign('/')}
                                className="inline-flex items-center justify-center px-6 py-3 border border-input bg-background rounded-lg font-medium hover:bg-muted transition-colors"
                            >
                                Retour à l'accueil
                            </button>
                        </div>

                        {/* Branding */}
                        <p className="text-xs text-muted-foreground pt-4 border-t">
                            SGG Digital — Secrétariat Général du Gouvernement
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
