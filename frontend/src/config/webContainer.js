import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;

export const getWebContainer = async () => {
    if(webContainerInstance === null) {
        try {
            webContainerInstance = await WebContainer.boot();
        } catch (error) {
            console.warn('WebContainer initialization failed:', error);
            console.warn('WebContainer requires CORS headers. Ensure your server sends:');
            console.warn('- Cross-Origin-Embedder-Policy: require-corp');
            console.warn('- Cross-Origin-Opener-Policy: same-origin');
            throw error;
        }
    }
    return webContainerInstance;
}