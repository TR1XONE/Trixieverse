import CounterpickPage from './pages/CounterpickPage';

export default function App() {
    return (
        <div className="min-h-screen bg-background">
            {/* Main Content */}
            <main className="container mx-auto py-8">
                <CounterpickPage />
            </main>

            {/* Footer */}
            <footer className="border-t border-primary/20 py-6 mt-12">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    <p>Made with 💜 for Wild Rift players — inspired by TR1XON</p>
                    <p className="mt-1 text-xs">
                        Data reference:{' '}
                        <a href="https://wrstats.online" target="_blank" rel="noopener" className="text-primary hover:text-secondary transition-colors">
                            wrstats.online
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
