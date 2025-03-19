export class ScreenshotService {
    constructor(config) {
        this.config = config;
    }

    async captureOfferPreview(offer) {
        try {
            return await this.generateDataUrl(offer);
        } catch (error) {
            console.error('Screenshot error:', error);
            return this.createFallbackImage(offer.title);
        }
    }

    async generateDataUrl(offer) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 400;

        // Create preview
        await this.drawPreview(ctx, offer);
        
        return canvas.toDataURL('image/png');
    }

    async drawPreview(ctx, offer) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 400);

        // Title
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(offer.title, 20, 40);

        // Description
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666666';
        this.wrapText(ctx, offer.description, 20, 80, 560, 20);

        // Payout
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#00aa00';
        ctx.fillText(`$${offer.payout}`, 20, 360);
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    createFallbackImage(title) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 400;

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 600, 400);
        gradient.addColorStop(0, '#f3f4f6');
        gradient.addColorStop(1, '#e5e7eb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 400);

        // Add title
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#4b5563';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, 300, 200);

        return canvas.toDataURL('image/png');
    }
}
