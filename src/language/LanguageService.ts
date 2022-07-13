import { Loadable, ExtendedError, MapCollection, ObservableData, LoadableEvent, LoadableStatus } from '@ts-core/common';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs';
import { CookieStorageUtil, ICookieStorageOptions } from '../cookie';
import { LanguageFileLoader, LanguageUrlLoader, LanguageTranslator, ILanguageLoader, ILanguageTranslator, Language, LanguageLocale, LanguageTranslatorEvent } from '@ts-core/language';

export class LanguageService<T = any> extends Loadable<LanguageTranslatorEvent, Language> {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    protected isInitialized: boolean;

    protected _language: Language;
    protected _languages: MapCollection<Language>;
    protected _rawTranslation: any;

    protected _loader: ILanguageLoader<T>;
    protected _translator: ILanguageTranslator;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private options?: ILanguageServiceOptions) {
        super();
        this._loader = new LanguageFileLoader(null);
        this._translator = new LanguageTranslator();

        this.addDestroyable(this.translator);
        this.translator.events.pipe(takeUntil(this.destroyed)).subscribe(event => this.observer.next(new ObservableData(event.type, this.language, event.error)));
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    protected async load(locale?: string | Language): Promise<void> {
        if (this.isDestroyed) {
            return;
        }

        if (locale instanceof Language) {
            locale = locale.locale;
        }

        let language = this.languages.get(locale);
        if (_.isNil(language)) {
            throw new ExtendedError(`Unable to find language with locale "${locale}"`);
        }

        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED, language));

        try {
            let translation = await this.loader.load(language.locale);
            if (this.isDestroyed) {
                return;
            }
            this._language = language;
            this._rawTranslation = translation;
            this._translator.locale = new LanguageLocale(language, translation);
            CookieStorageUtil.put(this.options, locale);

            this.status = LoadableStatus.LOADED;
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, language));
        } catch (error) {
            this.status = LoadableStatus.ERROR;
            this.observer.next(new ObservableData(LoadableEvent.ERROR, language, ExtendedError.create(error)));
        } finally {
            this.observer.next(new ObservableData(LoadableEvent.FINISHED, language));
        }
    }

    protected commitLoaderProperties(): void { }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public initialize(url: string, languages: MapCollection<Language>): void {
        if (this.isInitialized) {
            throw new ExtendedError('Service already initialized');
        }
        if (_.isEmpty(url)) {
            throw new ExtendedError('Url is nil');
        }
        if (_.isEmpty(languages)) {
            throw new ExtendedError('Languages is empty');
        }

        if (this.loader instanceof LanguageFileLoader || this.loader instanceof LanguageUrlLoader) {
            this.loader.url = url;
        }

        this._languages = languages;
        this.isInitialized = true;
    }

    public loadIfExist(defaultLocale?: string): void {
        if (!this.isInitialized) {
            throw new ExtendedError('Service in not initialized');
        }
        this.load(CookieStorageUtil.get(this.options) || defaultLocale);
    }

    public compile(key: string, params?: Object): string {
        return this.translator.compile({ key, params });
    }

    public translate(key: string, params?: Object): string {
        return this.translator.translate({ key, params });
    }

    public isHasTranslation(key: string, isOnlyIfNotEmpty?: boolean): boolean {
        return this.translator.isHasTranslation(key, isOnlyIfNotEmpty);
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        super.destroy();

        this.loader = null;
        this._language = null;
        this._languages = null;
        this._rawTranslation = null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get loader(): ILanguageLoader<T> {
        return this._loader;
    }
    public set loader(value: ILanguageLoader<T>) {
        if (value === this._loader) {
            return;
        }
        this._loader = value;
        if (!_.isNil(value)) {
            this.commitLoaderProperties();
        }
    }

    public get translator(): ILanguageTranslator {
        return this._translator;
    }

    public get rawTranslation(): any {
        return this._loader.translation;
    }

    public get locale(): string {
        return this.language ? this.language.locale : null;
    }

    public get language(): Language {
        return this._language;
    }
    public set language(value: Language) {
        if (value === this._language) {
            return;
        }
        this._language = value;
        this.load(value);
    }

    public get languages(): MapCollection<Language> {
        return this._languages;
    }
}

export interface ILanguageServiceOptions extends ICookieStorageOptions { }
