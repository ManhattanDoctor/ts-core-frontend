import { UrlUtil } from "@ts-core/common";
import * as _ from 'lodash';
import { AssetUrlProvider } from "./AssetUrlProvider";

export class AssetsCdnProvider extends AssetUrlProvider {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    public cdnUrl: string;
    public cdnDirectories: Array<string>;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(url: string, cdnUrl?: string, cdnDirectories?: Array<string>) {
        super(url);
        this.cdnUrl = cdnUrl;
        this.cdnDirectories = !_.isNil(cdnDirectories) ? cdnDirectories : ['icon', 'image', 'background', 'video', 'sound', 'file'];
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public getUrl(directory: string, name: string, extension: string): string {
        if (_.isEmpty(this.cdnDirectories) || !this.cdnDirectories.includes(directory)) {
            return super.getUrl(directory, name, extension);
        }
        return this.createUrl(this.cdnUrl, directory, name, extension);
    }
}