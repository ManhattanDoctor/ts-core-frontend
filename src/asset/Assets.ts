import { ExtendedError } from '@ts-core/common/error';
import * as _ from 'lodash';
import { IAssetsProvider, AssetUrlProvider } from './provider';

export class Assets {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    private static PROVIDER: IAssetsProvider;

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public static initialize(urlOrProvider: string | IAssetsProvider): void {
        Assets.PROVIDER = _.isString(urlOrProvider) ? new AssetUrlProvider(urlOrProvider) : urlOrProvider;
    }

    public static getIcon(name: string, extension: string = 'png'): string {
        return Assets.getAssetUrl('icon', name, extension);
    }

    public static getImage(name: string, extension: string = 'png'): string {
        return Assets.getAssetUrl('image', name, extension);
    }

    public static getBackground(name: string, extension: string = 'png'): string {
        return Assets.getAssetUrl('background', name, extension);
    }

    public static getVideo(name: string, extension: string = 'mp4'): string {
        return Assets.getAssetUrl('video', name, extension);
    }
    public static getSound(name: string, extension: string = 'mp3'): string {
        return Assets.getAssetUrl('sound', name, extension);
    }

    public static getFile(name: string, extension: string): string {
        return Assets.getAssetUrl('file', name, extension);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private static getAssetUrl(folder: string, name: string, extension: string): string {
        if (_.isNil(Assets.PROVIDER)) {
            throw new ExtendedError('Unable to get asset: initialization is required');
        }
        return Assets.PROVIDER.getUrl(folder, name, extension);
    }


}
