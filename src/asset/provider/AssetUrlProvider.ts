import { UrlUtil } from "@ts-core/common/util";
import { IAssetsProvider } from "./IAssetsProvider";
import * as _ from 'lodash';

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
        let value = `${this.url}${UrlUtil.parseUrl(directory)}${name}`;
        return !_.isNil(extension) ? `${value}.${extension}` : value;
    }
}
