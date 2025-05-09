import { Loadable, ExtendedError, ObservableData, LoadableEvent, LoadableStatus } from '@ts-core/common';
import { takeUntil } from 'rxjs';
import { CookieStorageUtil, ICookieStorageOptions } from '../cookie';
import { LanguageTranslator, ILanguageLoader, ILanguageTranslator, LanguageLocale, LanguageTranslatorEvent } from '@ts-core/language';
import * as _ from 'lodash';

export class LanguageService<T = any> extends Loadable<LanguageTranslatorEvent, string> {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    protected _locale: string;
    protected _loader: ILanguageLoader<T>;
    protected _options: ILanguageServiceOptions;
    protected _translator: ILanguageTranslator;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(options?: ILanguageServiceOptions) {
        super();

        this._options = options;
        this._translator = this.addDestroyable(new LanguageTranslator());
        this._translator.events.pipe(takeUntil(this.destroyed)).subscribe(event => this.observer.next(new ObservableData(event.type, this.locale, event.error)));
    }

    // --------------------------------------------------------------------------
    //
    //	Private Methods
    //
    // --------------------------------------------------------------------------

    protected async load(locale: string): Promise<void> {
        if (this.isDestroyed) {
            return;
        }
        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED, locale));

        try {
            this.translator.locale = new LanguageLocale(locale, await this.loader.load(locale));
            CookieStorageUtil.put(this.options, locale);

            this.status = LoadableStatus.LOADED;
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, locale));
        } catch (error) {
            this.status = LoadableStatus.ERROR;
            this.observer.next(new ObservableData(LoadableEvent.ERROR, locale, ExtendedError.create(error)));
        } finally {
            this.observer.next(new ObservableData(LoadableEvent.FINISHED, locale));
        }
    }

    protected commitLocaleProperties(): void {
        this.load(this.locale);
    }

    protected commitLoaderProperties(): void { }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public loadIfExist(defaultLocale?: string): void {
        this.locale = CookieStorageUtil.get(this.options) || defaultLocale;
    }

    public compile(key: string, params?: Object): string {
        return this.translator.compile(key, params);
    }

    public translate(key: string, params?: Object): string {
        return this.translator.translate(key, params);
    }

    public isHasTranslation(key: string, isOnlyIfNotEmpty?: boolean): boolean {
        return this.translator.isHasTranslation(key, isOnlyIfNotEmpty);
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        super.destroy();
        this._locale = null;
        this.loader = null;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get locale(): string {
        return this._locale;
    }
    public set locale(value: string) {
        if (value === this._locale) {
            return;
        }
        this._locale = value;
        this.commitLocaleProperties();
    }

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

    public get options(): ILanguageServiceOptions {
        return this._options;
    }

    public get translator(): ILanguageTranslator {
        return this._translator;
    }

    public get rawTranslation(): any {
        return this._loader.translation;
    }
}

export interface ILanguageServiceOptions extends ICookieStorageOptions { }
