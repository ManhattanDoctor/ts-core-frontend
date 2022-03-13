export interface IAssetsProvider {
    getUrl(folder: string, name: string, extension: string): string;
}

/*
private static getAssetUrl(name: string, folder: string, extension: string): string {
    let value = Assets.getAssetFolderUrl(folder) + name;
    if (!_.isNil(value)) {
        value += `.${extension}`;
    }
    return value;
}
*/