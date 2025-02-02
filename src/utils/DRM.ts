export class DRM {
    private static readonly WIN_EPOCH = 11644473600; // Windows epoch (1601-01-01) in seconds
    private static readonly S_TO_NS = 10000000; // Seconds to 100-nanosecond intervals
    private static readonly TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

    /**
     * Get Unix timestamp with clock skew correction
     */
    private static getUnixTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * Generates the Sec-MS-GEC token value.
     * 
     * This function generates a token value based on the current time in Windows file time format
     * adjusted for clock skew, and rounded down to the nearest 5 minutes. The token is then hashed
     * using SHA256 and returned as an uppercased hex digest.
     * 
     * @returns The generated Sec-MS-GEC token value.
     */
    public static async generateSecMsGec(): Promise<string> {
        // Get the current timestamp in Unix format with clock skew correction
        let ticks = this.getUnixTimestamp();

        // Switch to Windows file time epoch (1601-01-01 00:00:00 UTC)
        ticks += this.WIN_EPOCH;

        // Round down to the nearest 5 minutes (300 seconds)
        ticks -= ticks % 300;

        // Convert the ticks to 100-nanosecond intervals (Windows file time format)
        ticks *= this.S_TO_NS;

        // Create the string to hash
        const strToHash = `${ticks.toFixed(0)}${this.TRUSTED_CLIENT_TOKEN}`;

        // Compute the SHA256 hash
        const hash = await this.sha256(strToHash);
        return hash.toUpperCase();
    }

    /**
     * Compute SHA256 hash of a string
     */
    private static async sha256(str: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        
        // 在 Node.js 环境中使用 crypto 模块
        if (typeof window === 'undefined') {
            const crypto = require('crypto');
            return crypto.createHash('sha256').update(str, 'ascii').digest('hex');
        }

        // 在浏览器环境中使用 Web Crypto API
        try {
            const hash = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hash));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (err) {
            console.error('Error generating hash:', err);
            return '';
        }
    }
} 