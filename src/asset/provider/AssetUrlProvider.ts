import { UrlUtil } from "@ts-core/common/util";
import { IAssetsProvider } from "./IAssetsProvider";

export class AssetUrlProvider implements IAssetsProvider {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    protected url: string;

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

    public getUrl(folder: string, name: string, extension: string): string {
        return `${this.url}${UrlUtil.parseUrl(folder)}${name}.${extension}`;
    }
}