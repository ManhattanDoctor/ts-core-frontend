import { UrlUtil, ExtendedError, LoggerLevel, IDestroyable, AbstractSettingsStorage, MapCollection } from '@ts-core/common';
import * as _ from 'lodash';
import { Language } from '@ts-core/language';

export class SettingsBaseService extends AbstractSettingsStorage implements IDestroyable {
    // --------------------------------------------------------------------------
    //
    //	Static Properties
    //
    // --------------------------------------------------------------------------

    public static LANGUAGE_SEPARATOR: string = ';';
    public static LANGUAGE_CODE_SEPARATOR: string = '|';

    // --------------------------------------------------------------------------
    //
    //	Static Methods
    //
    // --------------------------------------------------------------------------

    public static parseUrl(value: any): string {
        return UrlUtil.parseUrl(value);
    }

    // --------------------------------------------------------------------------
    //
    //	Private Properties
    //
    // --------------------------------------------------------------------------

    protected isInitialized: boolean;

    protected _apiUrl: string;
    protected _assetsUrl: string;
    protected _languages: MapCollection<Language>;
    protected _versionDate: Date;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this._languages = new MapCollection<Language>('locale');
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public initialize(config: any, routerParams: any): void {
        if (this.isInitialized) {
            throw new ExtendedError('Service already initialized');
        }

        this.isInitialized = true;

        let params = {};
        _.assign(params, config);
        _.assign(params, this.getParamsFromCookies());
        _.assign(params, routerParams);

        this._data = params;
        for (let name of Object.keys(params)) {
            this.parseParam(name, params[name]);
        }
        this.setParamsToCookies();
        this.initializedHandler();
    }

    public destroy(): void {
        if (!_.isNil(this._languages)) {
            this._languages.destroy();
            this._languages = null;
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Parse Methods
    //
    // --------------------------------------------------------------------------

    protected setParamsToCookies(): any { }

    protected getParamsFromCookies(): any { }

    protected parseParam(name: string, value: any): void {
        switch (name) {
            case 'languages':
                this.parseLanguages(value);
                break;
            case 'versionDate':
                this._versionDate = new Date(value);
                break;
            case 'apiUrl':
                this._apiUrl = SettingsBaseService.parseUrl(value);
                break;
            case 'assetsUrl':
                this._assetsUrl = SettingsBaseService.parseUrl(value);
                break;
        }

        // SettingsBaseService.parseUrl(this.getValue('apiUrl'));
        // SettingsBaseService.parseUrl(this.getValue('assetsUrl'));
    }

    // --------------------------------------------------------------------------
    //
    //	Parse Languages
    //
    // --------------------------------------------------------------------------

    protected parseLanguages(value: any): void {
        this._languages.clear();
        if (_.isString(value)) {
            this.parseLanguagesString(value);
        }
        else if (_.isArray(value)) {
            this.parseLanguagesArray(value);
        }
    }

    protected parseLanguagesString(value: string): void {
        let items = value.split(SettingsBaseService.LANGUAGE_SEPARATOR);
        for (let item of items) {
            let language = item.split(SettingsBaseService.LANGUAGE_CODE_SEPARATOR);
            if (language.length === 2) {
                this._languages.add(new Language(language[0], language[1]));
            }
        }
    }

    protected parseLanguagesArray(value: Array<{ name: string, locale: string }>): void {
        for (let item of value) {
            this._languages.add(new Language(item.locale, item.name));
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get loggerLevel(): LoggerLevel {
        return this.getValue('loggerLevel', LoggerLevel.ALL);
    }

    public get apiUrl(): string {
        return this._apiUrl;
    }

    public get assetsUrl(): string {
        return this._assetsUrl;
    }

    public get theme(): string {
        return this.getValue('theme');
    }
    public get themes(): any {
        return this.getValue('themes');
    }

    public get language(): string {
        return this.getValue('language');
    }

    public get cookieDomain(): string {
        return this.getValue('cookieDomain');
    }

    public get languages(): MapCollection<Language> {
        return this._languages;
    }

    public get version(): string {
        return this.getValue('version');
    }

    public get versionDate(): Date {
        return this._versionDate;
    }
}
