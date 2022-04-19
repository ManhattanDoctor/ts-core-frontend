import { UrlUtil } from "@ts-core/common/util";
import { IAssetsProvider } from "./IAssetsProvider";

export class AssetUrlProvider implements IAssetsProvider {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    public url: string;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(url: string) {
        this.url = UrlUtil.parseUrl(url);
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public getUrl(directory: string, name: string, extension: string): string {
        return `${this.url}${UrlUtil.parseUrl(directory)}${name}.${extension}`;
    }
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