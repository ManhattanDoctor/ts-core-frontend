import { Destroyable, ExtendedError, MapCollection } from '@ts-core/common';
import * as _ from 'lodash';
import { Observable, filter, Subject } from 'rxjs';
import { } from 'rxjs';
import { CookieStorageUtil, ICookieStorageOptions } from '../cookie';
import { Theme } from './Theme';

export class ThemeService extends Destroyable {
    // --------------------------------------------------------------------------
    //
    //	Properties
    //
    // --------------------------------------------------------------------------

    protected _theme: Theme;
    protected _themes: MapCollection<Theme>;
    protected linkSymbol: string;

    protected observer: Subject<string>;
    protected isInitialized: boolean;

    private _document: Document;

    // --------------------------------------------------------------------------
    //
    //	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private options?: IThemeServiceOptions, item?: Document) {
        super();
        this._themes = new MapCollection('name');
        this._document = !_.isNil(item) ? item : document;

        this.observer = new Subject();
        this.linkSymbol = !_.isNil(options) && !_.isNil(options.linkSymbol) ? options.linkSymbol : '⇛';
    }

    // --------------------------------------------------------------------------
    //
    //	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getLink(text: string): string {
        if (_.isNil(text) || _.isNil(this.linkSymbol) || text.indexOf(this.linkSymbol) !== 0) {
            return null;
        }
        return text.substr(1).trim();
    }

    // --------------------------------------------------------------------------
    //
    //	Public Methods
    //
    // --------------------------------------------------------------------------

    public initialize(themes: Array<any>): void {
        if (this.isInitialized) {
            throw new ExtendedError('Service already initialized');
        }
        this.isInitialized = true;

        this.themes.clear();
        if (!_.isEmpty(themes)) {
            for (let item of themes) {
                let theme = new Theme();
                theme.update(item);
                this.themes.add(theme);
            }
        }
    }

    public loadIfExist(defaultTheme?: string): void {
        if (!this.isInitialized) {
            throw new ExtendedError('Service in not initialized');
        }

        let name = CookieStorageUtil.get(this.options) || defaultTheme;
        if (this.themes.has(name)) {
            this.theme = this.themes.get(name);
        } else if (this.themes.length > 0) {
            this.theme = this.themes.collection[0];
        }
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        super.destroy();

        this.observer.complete();
        this.observer = null;

        this._themes.destroy();
        this._themes = null;

        this._theme = null;
    }

    public getStyle<T>(name: string): T {
        if (_.isNil(name) || _.isNil(this.theme)) {
            return null;
        }
        let item = this.theme.getStyle<T>(name);
        if (!_.isString(item)) {
            return item;
        }
        let link = this.getLink(item);
        return !_.isNil(link) ? this.getStyle(link) : item;
    }

    // --------------------------------------------------------------------------
    //
    //	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<string> {
        return this.observer.asObservable();
    }

    public get changed(): Observable<string> {
        return this.events.pipe(filter(item => item === ThemeServiceEvent.CHANGED));
    }

    public get themes(): MapCollection<Theme> {
        return this._themes;
    }

    public get theme(): Theme {
        return this._theme;
    }
    public set theme(value: Theme) {
        if (value === this._theme) {
            return;
        }

        let element: HTMLElement = this.document.body;
        if (this._theme) {
            element.classList.remove(this._theme.styleName);
        }

        this._theme = value;
        CookieStorageUtil.put(this.options, this._theme ? this._theme.name : null);

        if (this._theme) {
            element.classList.add(this._theme.styleName);
        }
        this.observer.next(ThemeServiceEvent.CHANGED);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private get document(): Document {
        return this._document;
    }
}

export enum ThemeServiceEvent {
    CHANGED = 'CHANGED'
}

export interface IThemeServiceOptions extends ICookieStorageOptions {
    linkSymbol?: string;
}
