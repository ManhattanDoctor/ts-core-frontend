import { UrlUtil } from "@ts-core/common";
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
    //	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected createUrl(baseUrl: string, directory: string, name: string, extension: string): string {
        let value = `${baseUrl}${UrlUtil.parseUrl(directory)}${name}`;
        return !_.isNil(extension) ? `${value}.${extension}` : value;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public getUrl(directory: string, name: string, extension: string): string {
        return this.createUrl(this.url, directory, name, extension);
    }
}
