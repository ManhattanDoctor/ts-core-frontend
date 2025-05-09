import { UrlUtil, ExtendedError, LoggerLevel, IDestroyable, AbstractSettingsStorage, MapCollection } from '@ts-core/common';
import { Language } from '@ts-core/language';
import * as _ from 'lodash';

export class SettingsServiceBase extends AbstractSettingsStorage implements IDestroyable {
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
    protected _assetsCdnUrl: string;
    protected _languages: MapCollection<Language>;
    protected _versionDate: Date;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
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

        let params = {};
        _.assign(params, config);
        _.assign(params, this.getParamsFromCookies());
        _.assign(params, routerParams);

        this._data = params;
        Object.keys(params).forEach(name => this.parseParam(name, params[name]));
        this.setParamsToCookies();

        this.isInitialized = true;
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
            case 'apiUrl':
                this._apiUrl = SettingsServiceBase.parseUrl(value);
                break;
            case 'assetsUrl':
                this._assetsUrl = SettingsServiceBase.parseUrl(value);
                break;
            case 'assetsCdnUrl':
                this._assetsCdnUrl = SettingsServiceBase.parseUrl(value);
                break;
            case 'languages':
                this._languages = this.getLanguages(value);
                break;
            case 'versionDate':
                this._versionDate = new Date(value);
                break;
        }
    }

    // --------------------------------------------------------------------------
    //
    //	Parse Languages
    //
    // --------------------------------------------------------------------------

    protected getLanguages(value: any): MapCollection<Language> {
        let items = new Array();
        if (_.isString(value)) {
            items = this.getLanguagesFromString(value);
        }
        else if (_.isArray(value)) {
            items = this.getLanguagesFromArray(value);
        }
        let collection = new MapCollection<Language>('locale');
        items.forEach(item => collection.add(item));
        return collection;
    }

    protected getLanguagesFromString(value: string): Array<Language> {
        let items = new Array();
        for (let item of value.split(SettingsServiceBase.LANGUAGE_SEPARATOR)) {
            let language = item.split(SettingsServiceBase.LANGUAGE_CODE_SEPARATOR);
            if (language.length === 2) {
                items.push(new Language(language[0], language[1]));
            }
        }
        return items;
    }

    protected getLanguagesFromArray(value: Array<{ name: string, locale: string }>): Array<Language> {
        let items = new Array();
        for (let item of value) {
            items.push(new Language(item.locale, item.name));
        }
        return items;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get loggerLevel(): LoggerLevel {
        return this.getValue('loggerLevel', LoggerLevel.ALL);
    }

    public get isProduction(): boolean {
        return AbstractSettingsStorage.parseBoolean(this.getValue('isProduction'));
    }

    public get apiUrl(): string {
        return this._apiUrl;
    }

    public get assetsUrl(): string {
        return this._assetsUrl;
    }

    public get assetsCdnUrl(): string {
        return this._assetsCdnUrl;
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
