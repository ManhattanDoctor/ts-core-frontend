export interface IAssetsProvider {
    getUrl(folder: string, name: string, extension: string): string;
}