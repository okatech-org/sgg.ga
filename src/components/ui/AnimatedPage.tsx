/**
 * AnimatedPage — Wrapper pour les transitions de page
 *
 * Utilise les animations CSS définies dans index.css (pas de Framer Motion).
 * Ajoute automatiquement l'animation d'entrée de page + stagger sur les enfants.
 */

import type { ReactNode } from 'react';

interface AnimatedPageProps {
    children: ReactNode;
    className?: string;
    /** Activer le stagger cascade sur les enfants directs */
    stagger?: boolean;
}

export function AnimatedPage({ children, className = '', stagger = false }: AnimatedPageProps) {
    return (
        <div className={`animate-page-enter ${stagger ? 'stagger-children' : ''} ${className}`}>
            {children}
        </div>
    );
}
