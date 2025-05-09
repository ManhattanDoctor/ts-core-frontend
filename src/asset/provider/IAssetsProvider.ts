export interface IAssetsProvider {
    getUrl(directory: string, name: string, extension: string): string;
}