import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Shield, ArrowLeft, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCounterpicksPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [champions, setChampions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/counterpick/champions')
            .then(res => res.json())
            .then(data => {
                setChampions(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch champions:", err);
                setIsLoading(false);
            });
    }, []);

    const filteredChampions = champions?.filter((name: string) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon" className="text-muted-foreground mr-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <DatabaseBadge /> Counterpick Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage champions, builds, and matchup data.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-border/50 shadow-sm">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search champions to edit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button className="w-full sm:w-auto gap-2">
                        <Plus className="w-4 h-4" /> Add New Champion
                    </Button>
                </div>

                {/* Champion List */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading champions...</div>
                    ) : filteredChampions.length > 0 ? (
                        <div className="divide-y divide-border/50">
                            {filteredChampions.map((name: string) => (
                                <div key={name} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit Data
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">No champions found matching "{searchTerm}".</div>
                    )}
                </div>

            </div>
        </div>
    );
}

function DatabaseBadge() {
    return (
        <span className="bg-primary/10 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
        </span>
    );
}
