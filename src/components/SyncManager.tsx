"use client";

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Cloud, Upload, Download, Settings, Check, AlertCircle, Loader2, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SyncManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState('');
    const [repo, setRepo] = useState(''); // format: owner/repo
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedToken = localStorage.getItem('gh_token');
        const savedRepo = localStorage.getItem('gh_repo');
        if (savedToken) setToken(savedToken);
        if (savedRepo) setRepo(savedRepo);
    }, []);

    const saveSettings = () => {
        localStorage.setItem('gh_token', token);
        localStorage.setItem('gh_repo', repo);
        setStatus('success');
        setMessage('Settings saved!');
        setTimeout(() => {
            setStatus('idle');
            setMessage('');
        }, 2000);
    };

    const syncToGitHub = async () => {
        if (!token || !repo) {
            setStatus('error');
            setMessage('Please configure GitHub settings first.');
            return;
        }

        setStatus('loading');
        setMessage('Backing up to GitHub...');

        try {
            const data = localStorage.getItem('upsc-dashboard-v1');
            if (!data) throw new Error('No data to sync');

            const content = btoa(unescape(encodeURIComponent(data))); // Base64 encode
            const path = 'upsc_dashboard_backup.json';
            const url = `https://api.github.com/repos/${repo}/contents/${path}`;

            // Check if file exists to get SHA
            let sha = '';
            try {
                const checkRes = await fetch(url, {
                    headers: { Authorization: `token ${token}` }
                });
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    sha = checkData.sha;
                }
            } catch (e) {
                // File doesn't exist yet, ignore
            }

            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Backup: ${new Date().toISOString()}`,
                    content: content,
                    sha: sha || undefined
                })
            });

            if (!res.ok) throw new Error('Failed to sync');

            setStatus('success');
            setMessage('Backup successful!');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Backup failed. Check settings/permissions.');
        } finally {
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 3000);
        }
    };

    const syncFromGitHub = async () => {
        if (!token || !repo) {
            setStatus('error');
            setMessage('Please configure GitHub settings first.');
            return;
        }

        setStatus('loading');
        setMessage('Restoring from GitHub...');

        try {
            const path = 'upsc_dashboard_backup.json';
            const url = `https://api.github.com/repos/${repo}/contents/${path}`;

            const res = await fetch(url, {
                headers: { Authorization: `token ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch backup');

            const data = await res.json();
            const content = decodeURIComponent(escape(atob(data.content))); // Base64 decode

            localStorage.setItem('upsc-dashboard-v1', content);

            setStatus('success');
            setMessage('Restore successful! Reloading...');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Restore failed. File may not exist.');
        } finally {
            if (status !== 'success') {
                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, 3000);
            }
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-50 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-stone-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md transition-all text-stone-600 dark:text-slate-300"
                title="Cloud Sync"
            >
                <Cloud className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-700 w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-stone-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Github className="w-5 h-5 text-slate-800 dark:text-white" />
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cloud Sync</h2>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-slate-200">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">GitHub Token</label>
                                    <input
                                        type="password"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="ghp_..."
                                        className="w-full bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <p className="text-[10px] text-stone-400">Requires 'repo' scope.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Repository</label>
                                    <input
                                        type="text"
                                        value={repo}
                                        onChange={(e) => setRepo(e.target.value)}
                                        placeholder="username/repo-name"
                                        className="w-full bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={saveSettings}
                                    className="w-full py-2 bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Save Settings
                                </button>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 dark:border-slate-800">
                                    <button
                                        onClick={syncToGitHub}
                                        disabled={status === 'loading'}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                                    >
                                        {status === 'loading' && message.includes('Backing') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        Backup
                                    </button>
                                    <button
                                        onClick={syncFromGitHub}
                                        disabled={status === 'loading'}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                    >
                                        {status === 'loading' && message.includes('Restoring') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        Restore
                                    </button>
                                </div>

                                {message && (
                                    <div className={`text-center text-sm py-2 rounded-lg ${status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                            status === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                'text-stone-500'
                                        }`}>
                                        {message}
                                    </div>
                                )}
                            </div>

                            <div className="bg-stone-50 dark:bg-slate-800/50 p-4 text-center">
                                <button onClick={() => setIsOpen(false)} className="text-sm text-stone-500 hover:text-stone-700 dark:text-slate-400">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
