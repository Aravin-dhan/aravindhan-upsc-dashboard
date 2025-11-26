"use client";
// src/components/Navbar.tsx
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
    return (
        <nav className="glass-panel backdrop-blur-md p-4 rounded-xl flex items-center justify-between mb-6">
            <motion.div
                className="text-2xl font-bold text-primary"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                UPSC CSE 2027 Dashboard
            </motion.div>
            <ul className="flex space-x-4">
                <li>
                    <Link href="/" className="text-foreground hover:text-primary transition-colors">
                        Home
                    </Link>
                </li>
                <li>
                    <Link href="/resources" className="text-foreground hover:text-primary transition-colors">
                        Resources
                    </Link>
                </li>
                <li>
                    <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                        About
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
