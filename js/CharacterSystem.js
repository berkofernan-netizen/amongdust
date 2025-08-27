// CharacterSystem.js - Manages character animations, states, and tinting system
class CharacterSystem {
    constructor(scene) {
        this.scene = scene;
        this.characters = new Map();
        this.animationConfigs = {
            idle: {
                texture: 'character_idle',
                scale: 0.6,
                animation: null,
                breathing: true
            },
            walk: {
                texture: 'character_walk',
                scale: 0.6,
                animation: 'character_walk',
                breathing: false
            },
            vent: {
                texture: 'character_vent',
                scale: 0.6,
                animation: null,
                breathing: false
            },
            vent_player: {
                texture: 'character_vent_player',
                scale: 0.6,
                animation: null,
                breathing: false
            },
            ghost: {
                texture: 'character_ghost',
                scale: 0.6,
                animation: null,
                breathing: false,
                alpha: 0.7,
                floating: true
            },
            lobby: {
                texture: 'character_lobby',
                scale: 0.6,
                animation: null,
                breathing: false
            },
            vote_icon: {
                texture: 'character_vote_icon',
                scale: 0.6,
                animation: null,
                breathing: false
            },
            death: {
                texture: 'character_death',
                scale: 0.8,
                animation: null,
                breathing: false
            },
            ejected: {
                texture: 'character_ejected',
                scale: 0.6,
                animation: null,
                breathing: false
            },
            kill_animation: {
                texture: 'character_kill_animation',
                scale: 0.8,
                animation: 'character_kill',
                breathing: false,
                oneTime: true
            }
        };
        
        this.initializeAnimations();
    }
    
    initializeAnimations() {
        // Create all character animations
        if (!this.scene.anims.exists('character_walk')) {
            this.scene.anims.create({
                key: 'character_walk',
                frames: this.scene.anims.generateFrameNumbers('character_walk', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('character_kill')) {
            this.scene.anims.create({
                key: 'character_kill',
                frames: this.scene.anims.generateFrameNumbers('character_kill_animation', { start: 0, end: 7 }),
                frameRate: 12,
                repeat: 0
            });
        }
    }
    
    createCharacter(id, x, y, config = {}) {
        const {
            color = 0xff0000,
            name = 'Player',
            state = 'idle',
            isLocal = false,
            hat = null,
            skin = null,
            pet = null
        } = config;
        
        // Create character sprite
        const stateConfig = this.animationConfigs[state];
        let sprite;
        
        if (stateConfig.animation) {
            sprite = this.scene.add.sprite(x, y, stateConfig.texture);
            if (state === 'walk') {
                sprite.play(stateConfig.animation);
            }
        } else {
            sprite = this.scene.add.image(x, y, stateConfig.texture);
        }
        
        // Apply scale and tinting
        sprite.setScale(stateConfig.scale);
        this.applyCharacterTint(sprite, color);
        
        // Apply alpha if specified
        if (stateConfig.alpha) {
            sprite.setAlpha(stateConfig.alpha);
        }
        
        // Create name tag
        const nameTag = this.scene.add.text(x, y - 40, name, {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        
        // Create character object
        const character = {
            id,
            sprite,
            nameTag,
            state,
            color,
            name,
            isLocal,
            hat: null,
            skin: null,
            pet: null,
            direction: { x: 0, y: 0 },
            speed: 2,
            lastPosition: { x, y },
            tweens: []
        };
        
        // Add accessories if specified
        if (hat) {
            this.addHat(character, hat);
        }
        if (skin) {
            this.addSkin(character, skin);
        }
        if (pet) {
            this.addPet(character, pet);
        }
        
        // Apply state-specific effects
        this.applyStateEffects(character);
        
        // Store character
        this.characters.set(id, character);
        
        return character;
    }
    
    applyCharacterTint(sprite, color) {
        // Apply tinting to grayscale sprites
        // This system allows one sprite to work with all colors
        sprite.setTint(color);
        
        // For better visibility, we can also adjust the brightness
        const brightness = this.getColorBrightness(color);
        if (brightness < 0.3) {
            // For dark colors, add a subtle outline effect
            sprite.setStrokeStyle(1, 0xffffff, 0.3);
        }
    }
    
    getColorBrightness(color) {
        // Calculate relative brightness of a color
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        
        // Using luminance formula
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    
    setState(characterId, newState, options = {}) {
        const character = this.characters.get(characterId);
        if (!character || character.state === newState) return;
        
        const oldState = character.state;
        character.state = newState;
        
        // Clear existing tweens
        this.clearCharacterTweens(character);
        
        const config = this.animationConfigs[newState];
        
        // Special handling for death state
        if (newState === 'death') {
            character.isDead = true;
            character.canMove = false;
            // Hide name tag for corpses (until reported)
            character.nameTag.setVisible(false);
        }
        
        // Special handling for ghost state
        if (newState === 'ghost') {
            character.isGhost = true;
            character.canPhaseWalls = true;
            character.canMove = true;
            // Show name tag again for ghosts
            character.nameTag.setVisible(true);
            character.nameTag.setAlpha(0.7);
        }
        
        // Update sprite texture and animation
        if (config.animation) {
            if (character.sprite.anims) {
                character.sprite.setTexture(config.texture);
                character.sprite.play(config.animation);
            } else {
                // Convert image to sprite if needed for animation
                const x = character.sprite.x;
                const y = character.sprite.y;
                const tint = character.sprite.tint;
                const alpha = character.sprite.alpha;
                
                character.sprite.destroy();
                character.sprite = this.scene.add.sprite(x, y, config.texture);
                character.sprite.setTint(tint);
                character.sprite.setAlpha(alpha);
                character.sprite.play(config.animation);
            }
        } else {
            character.sprite.setTexture(config.texture);
        }
        
        // Apply scale and effects
        character.sprite.setScale(config.scale);
        this.applyCharacterTint(character.sprite, character.color);
        
        if (config.alpha) {
            character.sprite.setAlpha(config.alpha);
        } else {
            character.sprite.setAlpha(1);
        }
        
        // Apply state-specific effects
        this.applyStateEffects(character);
        
        return character;
    }
    
    applyStateEffects(character) {
        const config = this.animationConfigs[character.state];
        
        // Clear existing tweens first
        this.clearCharacterTweens(character);
        
        // Breathing effect for idle state
        if (config.breathing) {
            const breathingTween = this.scene.tweens.add({
                targets: character.sprite,
                scaleY: config.scale + 0.02,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            character.tweens.push(breathingTween);
        }
        
        // Floating effect for ghost state
        if (config.floating) {
            const floatingTween = this.scene.tweens.add({
                targets: character.sprite,
                y: character.sprite.y - 10,
                duration: 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            character.tweens.push(floatingTween);
            
            // Update name tag to follow
            const nameFloatingTween = this.scene.tweens.add({
                targets: character.nameTag,
                y: character.nameTag.y - 10,
                duration: 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            character.tweens.push(nameFloatingTween);
        }
        
        // One-time animations
        if (config.oneTime && character.sprite.anims) {
            character.sprite.once('animationcomplete', () => {
                // Animation finished, could transition to another state
                if (character.state === 'kill_animation') {
                    this.setState(character.id, 'death');
                }
            });
        }
    }
    
    clearCharacterTweens(character) {
        character.tweens.forEach(tween => {
            if (tween) {
                tween.destroy();
            }
        });
        character.tweens = [];
    }
    
    updateCharacterPosition(characterId, x, y) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        character.sprite.x = x;
        character.sprite.y = y;
        character.nameTag.x = x;
        character.nameTag.y = y - 40;
        
        // Update accessory positions
        this.updateAccessoryPositions(character);
    }
    
    setCharacterDirection(characterId, directionX, directionY) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        character.direction.x = directionX;
        character.direction.y = directionY;
        
        // Auto-switch between idle and walk based on movement
        const isMoving = Math.abs(directionX) > 0.1 || Math.abs(directionY) > 0.1;
        
        if (isMoving && character.state === 'idle') {
            this.setState(characterId, 'walk');
        } else if (!isMoving && character.state === 'walk') {
            this.setState(characterId, 'idle');
        }
    }
    
    addHat(character, hatType) {
        if (character.hat) {
            character.hat.destroy();
        }
        
        const hatSprite = this.scene.add.image(character.sprite.x, character.sprite.y - 20, `hat_${hatType}`);
        hatSprite.setScale(0.4);
        hatSprite.setTint(character.color); // Some hats might be tinted to match
        
        character.hat = hatSprite;
        this.updateAccessoryPositions(character);
    }
    
    addSkin(character, skinType) {
        // Skin overlays would be applied here
        // For now, we'll just store the skin type
        character.skinType = skinType;
        
        // In a full implementation, this would add skin sprites over the character
    }
    
    addPet(character, petType) {
        if (character.pet) {
            character.pet.destroy();
        }
        
        const petSprite = this.scene.add.image(character.sprite.x - 25, character.sprite.y + 10, `pet_${petType}`);
        petSprite.setScale(0.3);
        
        character.pet = petSprite;
        this.updateAccessoryPositions(character);
    }
    
    updateAccessoryPositions(character) {
        if (character.hat) {
            character.hat.x = character.sprite.x;
            character.hat.y = character.sprite.y - 20;
        }
        
        if (character.pet) {
            character.pet.x = character.sprite.x - 25;
            character.pet.y = character.sprite.y + 10;
        }
    }
    
    removeCharacter(characterId) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        // Clear tweens
        this.clearCharacterTweens(character);
        
        // Destroy sprites
        character.sprite.destroy();
        character.nameTag.destroy();
        
        if (character.hat) character.hat.destroy();
        if (character.pet) character.pet.destroy();
        
        // Remove from map
        this.characters.delete(characterId);
    }
    
    getCharacter(characterId) {
        return this.characters.get(characterId);
    }
    
    getAllCharacters() {
        return Array.from(this.characters.values());
    }
    
    // Kill animation system
    performKill(killerCharacterId, victimCharacterId, isLocalKiller = false) {
        const killer = this.characters.get(killerCharacterId);
        const victim = this.characters.get(victimCharacterId);
        
        if (!killer || !victim) return;
        
        // Only show kill animation to the killer
        if (isLocalKiller) {
            this.showKillAnimation(killer, victim);
        }
        
        // Set victim to death state for all players
        this.setState(victimCharacterId, 'death');
        
        // Create corpse marker
        this.createCorpse(victim);
        
        return { killer, victim };
    }
    
    showKillAnimation(killer, victim) {
        // Create kill animation sprite at victim's position
        const killSprite = this.scene.add.sprite(victim.sprite.x, victim.sprite.y, 'character_kill_animation');
        killSprite.setScale(0.8);
        
        // Apply victim's color and accessories to the kill animation
        killSprite.setTint(victim.color);
        
        // Copy victim's accessories to kill animation if they exist
        let killHat = null;
        let killPet = null;
        
        if (victim.hat) {
            killHat = this.scene.add.image(killSprite.x, killSprite.y - 20, victim.hat.texture.key);
            killHat.setScale(victim.hat.scaleX);
            killHat.setTint(victim.hat.tint);
        }
        
        if (victim.pet) {
            killPet = this.scene.add.image(killSprite.x - 25, killSprite.y + 10, victim.pet.texture.key);
            killPet.setScale(victim.pet.scaleX);
            killPet.setTint(victim.pet.tint);
        }
        
        // Play kill animation
        killSprite.play('character_kill');
        
        // When animation completes, clean up
        killSprite.once('animationcomplete', () => {
            killSprite.destroy();
            if (killHat) killHat.destroy();
            if (killPet) killPet.destroy();
        });
        
        // Hide victim during kill animation
        victim.sprite.setVisible(false);
        victim.nameTag.setVisible(false);
        if (victim.hat) victim.hat.setVisible(false);
        if (victim.pet) victim.pet.setVisible(false);
        
        // Show victim corpse after animation
        this.scene.time.delayedCall(1000, () => {
            this.setState(victim.id, 'death');
            victim.sprite.setVisible(true);
        });
    }
    
    createCorpse(victim) {
        // Store corpse data for reporting
        const corpse = {
            id: `corpse_${victim.id}`,
            victimId: victim.id,
            x: victim.sprite.x,
            y: victim.sprite.y,
            color: victim.color,
            name: victim.name,
            reported: false,
            discoveredBy: null
        };
        
        // Add to scene's corpse list
        if (!this.scene.corpses) {
            this.scene.corpses = [];
        }
        this.scene.corpses.push(corpse);
        
        return corpse;
    }
    
    reportCorpse(corpseId, reporterId) {
        if (!this.scene.corpses) return null;
        
        const corpse = this.scene.corpses.find(c => c.id === corpseId);
        if (!corpse || corpse.reported) return null;
        
        corpse.reported = true;
        corpse.discoveredBy = reporterId;
        
        // Show name tag again when corpse is reported
        const victim = this.characters.get(corpse.victimId);
        if (victim) {
            victim.nameTag.setVisible(true);
            victim.nameTag.setText(`${corpse.name} (DEAD)`);
            victim.nameTag.setStyle({ fill: '#ff0000' });
        }
        
        return corpse;
    }
    
    convertToGhost(characterId) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        this.setState(characterId, 'ghost');
        
        // Ghost-specific properties
        character.canPhaseWalls = true;
        character.speed = 2.5; // Slightly faster
        character.isGhost = true;
        
        return character;
    }
    
    // Utility method to get all available colors
    static getAvailableColors() {
        return [
            { name: 'Red', value: 0xff0000 },
            { name: 'Blue', value: 0x0000ff },
            { name: 'Green', value: 0x00ff00 },
            { name: 'Pink', value: 0xff69b4 },
            { name: 'Orange', value: 0xffa500 },
            { name: 'Yellow', value: 0xffff00 },
            { name: 'Black', value: 0x000000 },
            { name: 'White', value: 0xffffff },
            { name: 'Purple', value: 0x800080 },
            { name: 'Cyan', value: 0x00ffff },
            { name: 'Lime', value: 0x32cd32 },
            { name: 'Brown', value: 0x8b4513 }
        ];
    }
}