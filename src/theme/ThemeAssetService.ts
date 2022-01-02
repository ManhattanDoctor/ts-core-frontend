import { DestroyableContainer } from '@ts-core/common';
import * as _ from 'lodash';
import { Assets } from '../asset';
import { ThemeService } from './ThemeService';

export class ThemeAssetService extends DestroyableContainer {
    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(protected theme: ThemeService) {
        super();
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected isThemeDark(): boolean {
        return !_.isNil(this.theme.theme) ? this.theme.theme.isDark : true;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public getIcon(id: string, extension?: string, isIgnoreTheme?: boolean): string {
        return Assets.getIcon(this.getName(id, isIgnoreTheme), extension);
    }

    public getImage(id: string, extension?: string, isIgnoreTheme?: boolean): string {
        return Assets.getImage(this.getName(id, isIgnoreTheme), extension);
    }

    public getSound(id: string, extension?: string, isIgnoreTheme?: boolean): string {
        return Assets.getSound(this.getName(id, isIgnoreTheme), extension);
    }

    public getVideo(id: string, extension?: string, isIgnoreTheme?: boolean): string {
        return Assets.getVideo(this.getName(id, isIgnoreTheme), extension);
    }

    public getFile(id: string, extension?: string, isIgnoreTheme?: boolean): string {
        return Assets.getFile(this.getName(id, isIgnoreTheme), extension);
    }

    public getBackground(id: string, extension?: string, isIgnoreTheme?: boolean): string {
        return Assets.getBackground(this.getName(id, isIgnoreTheme), extension);
    }

    
    public getName(id: string, isIgnoreTheme?: boolean): string {
        return isIgnoreTheme || !this.isThemeDark() ? id : `${id}Dark`;
    }
}
