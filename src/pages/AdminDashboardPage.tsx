import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Database, Edit, Box, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboardPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground flex items-center gap-3">
                            <Shield className="w-8 h-8 text-primary" />
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage Trixieverse data, users, and global configurations. Welcome back, {user?.username}.
                        </p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">Back to App</Button>
                    </Link>
                </div>

                {/* Grid of Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {/* Counterpick Data Management */}
                    <Link href="/admin/counterpicks">
                        <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <Database className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Counterpick Data</h3>
                            <p className="text-muted-foreground text-sm">
                                Add, edit, or remove champions, builds, runes, and matchup advice in the database.
                            </p>
                        </div>
                    </Link>

                    {/* Future: User Management */}
                    <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-6 opacity-60 cursor-not-allowed">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">User Management</h3>
                        <p className="text-muted-foreground text-sm">
                            (Coming Soon) Manage user roles, bans, and permissions.
                        </p>
                    </div>

                    {/* Future: Global Settings */}
                    <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-6 opacity-60 cursor-not-allowed">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <Box className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">Global Settings</h3>
                        <p className="text-muted-foreground text-sm">
                            (Coming Soon) Configure site-wide alerts and maintenance mode.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
