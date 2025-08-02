// 3DBall.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Paintbrush, X } from 'lucide-react';
import './3DBall.css';

/**
 * Sidebar component for selecting different ball skins.
 */
const SkinSidebar = ({ isOpen, onSelectSkin, activeSkin }) => {
    const skins = [
        { id: 'sphere', name: 'Sphere' },
        { id: 'fireball', name: 'Fireball Jutsu' },
        { id: 'pokeball', name: 'Pokéball' },
    ];

    return (
        <aside className={`skin-sidebar ${isOpen ? 'open' : ''}`}>
            <h3>Customize Skin</h3>
            <div className="skin-options">
                {skins.map((skin) => (
                    <button
                        key={skin.id}
                        className={`skin-button ${activeSkin === skin.id ? 'active' : ''}`}
                        onClick={() => onSelectSkin(skin.id)}
                    >
                        {skin.name}
                    </button>
                ))}
            </div>
        </aside>
    );
};


/**
 * The main component that renders a "faux 3D" ball and a sidebar for customization.
 */
const ThreeDBall = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeSkin, setActiveSkin] = useState('sphere');
    const [style, setStyle] = useState({});
    const containerRef = useRef(null);

    // This effect handles the mouse tracking for the interactive rotation.
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;

            const { width, height, left, top } = containerRef.current.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;

            // Calculate mouse position as a percentage from the center (-50 to +50)
            const mouseX = (x / width - 0.5) * 100;
            const mouseY = (y / height - 0.5) * 100;

            // Set these values as CSS custom properties
            setStyle({
                '--mouse-x': `${mouseX}%`,
                '--mouse-y': `${mouseY}%`,
                'transition': 'transform 0.05s linear'
            });
        };

        const handleMouseLeave = () => {
            // Smoothly reset the position when the mouse leaves.
            setStyle({
                '--mouse-x': '0%',
                '--mouse-y': '0%',
                'transition': 'all 0.5s ease-out'
            });
        };

        const currentContainer = containerRef.current;
        if (activeSkin === 'pokeball' && currentContainer) {
            currentContainer.addEventListener('mousemove', handleMouseMove);
            currentContainer.addEventListener('mouseleave', handleMouseLeave);
        } else {
             // Reset styles if not on pokeball skin
            setStyle({});
        }

        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('mousemove', handleMouseMove);
                currentContainer.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [activeSkin]);

    return (
        <div className="three-ball-container" ref={containerRef}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)} aria-label="Toggle skin customizer">
                {isSidebarOpen ? <X size={24} /> : <Paintbrush size={24} />}
            </button>

            <SkinSidebar
                isOpen={isSidebarOpen}
                onSelectSkin={setActiveSkin}
                activeSkin={activeSkin}
            />

            <div className={`ball ${activeSkin}`} style={activeSkin === 'pokeball' ? style : {}}>
              {activeSkin === 'fireball' && (
                <>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                </>
              )}
              {activeSkin === 'pokeball' && (
                <>
                  {/* The shine is now a pseudo-element controlled by CSS variables */}
                  <div className="pokeball-button"></div>
                </>
              )}
            </div>
        </div>
    );
};

export default ThreeDBall;
