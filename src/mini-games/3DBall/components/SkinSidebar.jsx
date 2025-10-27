import React from 'react';

/**
 * Sidebar component for selecting different ball skins.
 */
const SkinSidebar = ({ isOpen, onSelectSkin, activeSkin }) => {
    const categorizedSkins = {
        'Conceptual': [ { id: 'genesis-sphere', name: 'Genesis Sphere' } ],
        'Normal Objects': [ { id: 'sphere', name: 'Sphere' }, { id: 'pokeball', name: 'Pokéball' } ],
        'Magical': [ { id: 'fireball', name: 'Fireball Jutsu' }, { id: 'ice-orb', name: 'Ice Orb' }, { id: 'dragon-ball', name: 'Dragon Ball' }, { id: 'palantir', name: 'Palantír Stone' } ],
        'Sci-Fi': [ { id: 'energy-core', name: 'Energy Core' }, { id: 'arc-reactor', name: 'Arc Reactor' } ]
    };

    return (
        <aside className={`skin-sidebar ${isOpen ? 'open' : ''}`}>
            <h3>Customize Skin</h3>
            <div className="skin-options">
                {Object.entries(categorizedSkins).map(([category, skins]) => (
                    <div key={category} className="skin-category">
                        <h4>{category}</h4>
                        <div className="skin-category-buttons">
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
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default SkinSidebar;
