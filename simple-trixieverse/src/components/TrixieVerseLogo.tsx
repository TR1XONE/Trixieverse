import './TrixieVerseLogo.css';

export default function TrixieVerseLogo() {
    return (
        <div className="trixie-logo-wrap">
            {/* Orbital rings */}
            <div className="trixie-orbit trixie-orbit-1" />
            <div className="trixie-orbit trixie-orbit-2" />
            <div className="trixie-orbit trixie-orbit-3" />

            {/* Core glow */}
            <div className="trixie-core" />

            {/* Brand text */}
            <div className="trixie-text">
                <span className="trixie-t">T</span>
                <span className="trixie-r">R</span>
                <span className="trixie-i">I</span>
                <span className="trixie-x1">X</span>
                <span className="trixie-i2">I</span>
                <span className="trixie-e">E</span>
                <span className="trixie-verse">VERSE</span>
            </div>

            {/* Tagline */}
            <div className="trixie-tagline">⚔️ Wild Rift Intel</div>
        </div>
    );
}
