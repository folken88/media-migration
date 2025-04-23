class MediaMigration {
    static MODULE_ID = 'media-migration';
    static migrationStats = {
        actors: 0,
        items: 0,
        journals: 0,
        scenes: 0,
        tokens: 0,
        totalImages: 0
    };

    static async checkAndMigrateImage(imagePath) {
        if (!imagePath) return imagePath;
        
        // Only process jpg and png files
        if (!imagePath.match(/\.(jpg|jpeg|png)$/i)) return imagePath;

        // Create the potential webp path
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        // Check if webp version exists
        try {
            const response = await fetch(webpPath, { method: 'HEAD' });
            if (response.ok) {
                console.log(`MediaMigration | Found WebP version for: ${imagePath}`);
                this.migrationStats.totalImages++;
                return webpPath;
            }
        } catch (error) {
            // If fetch fails, return original path
            return imagePath;
        }

        return imagePath;
    }

    static async migrateEntity(entity) {
        if (!entity) return;

        let wasUpdated = false;

        // Handle different entity types
        if (entity.img) {
            const newPath = await this.checkAndMigrateImage(entity.img);
            if (newPath !== entity.img) {
                await entity.update({ 'img': newPath });
                wasUpdated = true;
            }
        }

        // Handle token
        if (entity.prototypeToken?.texture?.src) {
            const newTokenPath = await this.checkAndMigrateImage(entity.prototypeToken.texture.src);
            if (newTokenPath !== entity.prototypeToken.texture.src) {
                await entity.update({ 'prototypeToken.texture.src': newTokenPath });
                wasUpdated = true;
            }
        }

        // Handle items within actors
        if (entity.items) {
            for (let item of entity.items) {
                const itemWasUpdated = await this.migrateEntity(item);
                wasUpdated = wasUpdated || itemWasUpdated;
            }
        }

        return wasUpdated;
    }

    static createProgressBar() {
        const progress = document.createElement("div");
        progress.id = "media-migration-progress";
        progress.style.position = "fixed";
        progress.style.top = "50%";
        progress.style.left = "50%";
        progress.style.transform = "translate(-50%, -50%)";
        progress.style.width = "50%";
        progress.style.backgroundColor = "#0000004d";
        progress.style.padding = "20px";
        progress.style.borderRadius = "8px";
        progress.style.zIndex = "100000";
        
        const label = document.createElement("div");
        label.style.color = "white";
        label.style.marginBottom = "10px";
        label.style.textAlign = "center";
        label.id = "media-migration-label";
        
        const bar = document.createElement("div");
        bar.style.width = "100%";
        bar.style.height = "20px";
        bar.style.backgroundColor = "#666";
        bar.style.borderRadius = "5px";
        bar.style.overflow = "hidden";
        
        const fill = document.createElement("div");
        fill.id = "media-migration-progress-fill";
        fill.style.width = "0%";
        fill.style.height = "100%";
        fill.style.backgroundColor = "#4CAF50";
        fill.style.transition = "width 0.3s ease";
        
        bar.appendChild(fill);
        progress.appendChild(label);
        progress.appendChild(bar);
        document.body.appendChild(progress);
        
        return { progress, label, fill };
    }

    static updateProgress(current, total, label) {
        const fill = document.getElementById("media-migration-progress-fill");
        const labelEl = document.getElementById("media-migration-label");
        if (fill && labelEl) {
            const percentage = Math.round((current / total) * 100);
            fill.style.width = percentage + "%";
            labelEl.textContent = `${label} (${current}/${total})`;
        }
    }

    static removeProgressBar() {
        const progress = document.getElementById("media-migration-progress");
        if (progress) {
            progress.remove();
        }
    }

    static async migrateWorld() {
        // Reset stats
        this.migrationStats = {
            actors: 0,
            items: 0,
            journals: 0,
            scenes: 0,
            tokens: 0,
            totalImages: 0
        };

        ui.notifications.info("Starting media migration to WebP...");
        const progressBar = this.createProgressBar();

        // Calculate total entities for progress bar
        const totalEntities = game.actors.size + game.items.size + game.journal.size + game.scenes.size;
        let currentProgress = 0;

        // Migrate Actors
        for (let actor of game.actors) {
            const wasUpdated = await this.migrateEntity(actor);
            if (wasUpdated) this.migrationStats.actors++;
            currentProgress++;
            this.updateProgress(currentProgress, totalEntities, "Migrating entities");
        }

        // Migrate Items
        for (let item of game.items) {
            const wasUpdated = await this.migrateEntity(item);
            if (wasUpdated) this.migrationStats.items++;
            currentProgress++;
            this.updateProgress(currentProgress, totalEntities, "Migrating entities");
        }

        // Migrate Journal Entries
        for (let journal of game.journal) {
            if (journal.img) {
                const newPath = await this.checkAndMigrateImage(journal.img);
                if (newPath !== journal.img) {
                    await journal.update({ 'img': newPath });
                    this.migrationStats.journals++;
                }
            }
            currentProgress++;
            this.updateProgress(currentProgress, totalEntities, "Migrating entities");
        }

        // Migrate Scenes
        for (let scene of game.scenes) {
            let sceneUpdated = false;
            
            if (scene.background?.src) {
                const newBgPath = await this.checkAndMigrateImage(scene.background.src);
                if (newBgPath !== scene.background.src) {
                    await scene.update({ 'background.src': newBgPath });
                    sceneUpdated = true;
                }
            }

            // Migrate tokens in the scene
            for (let token of scene.tokens) {
                if (token.texture?.src) {
                    const newTokenPath = await this.checkAndMigrateImage(token.texture.src);
                    if (newTokenPath !== token.texture.src) {
                        await token.update({ 'texture.src': newTokenPath });
                        this.migrationStats.tokens++;
                    }
                }
            }
            
            if (sceneUpdated) this.migrationStats.scenes++;
            currentProgress++;
            this.updateProgress(currentProgress, totalEntities, "Migrating entities");
        }

        // Remove progress bar
        this.removeProgressBar();

        // Create chat message with results
        const chatContent = `
            <h3>Media Migration Complete</h3>
            <p>The following entities were updated to use WebP images:</p>
            <ul>
                <li>${this.migrationStats.actors} Actors</li>
                <li>${this.migrationStats.items} Items</li>
                <li>${this.migrationStats.journals} Journal Entries</li>
                <li>${this.migrationStats.scenes} Scenes</li>
                <li>${this.migrationStats.tokens} Tokens</li>
            </ul>
            <p><strong>Total images migrated to WebP: ${this.migrationStats.totalImages}</strong></p>
        `;

        ChatMessage.create({
            content: chatContent,
            whisper: [game.user.id]
        });

        ui.notifications.success("Media migration to WebP complete!");
    }
}

Hooks.once('ready', () => {
    game.settings.registerMenu(MediaMigration.MODULE_ID, 'runMigration', {
        name: 'Run Media Migration',
        label: 'Run Migration',  // The text that goes on the button
        hint: 'Scan through all entities and migrate compatible images to WebP format if available.',
        icon: 'fas fa-images',  // Font Awesome icon
        type: MediaMigrationForm,
        restricted: true  // Only GM can see this
    });
});

class MediaMigrationForm extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "media-migration-form",
            title: "Media Migration",
            template: `modules/media-migration/templates/migration-form.html`,
            width: 350,
            height: 'auto',
            classes: ['media-migration']
        });
    }

    getData(options={}) {
        return {
            content: `<p>This will scan through all entities in your world and update image references to use WebP versions where available.</p>
                     <p>It is recommended to:</p>
                     <ol>
                         <li>Create a backup of your world</li>
                         <li>Run the Media Optimizer first</li>
                         <li>Then run this migration</li>
                     </ol>
                     <p>Click "Begin Migration" to start the process.</p>`
        };
    }

    async _updateObject(event, formData) {
        await MediaMigration.migrateWorld();
    }
} 