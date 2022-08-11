import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Loadable, ObservableData, LoadableStatus } from '@ts-core/common';

export class NativeWindowService extends Loadable<NativeWindowServiceEvent, void> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _document: Document;
    protected _isFocused: boolean = true;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(item?: Document) {
        super();
        this.observer = new Subject();
        this._document = !_.isNil(item) ? item : document;

        if (this.document.readyState !== 'complete') {
            this.document.addEventListener('DOMContentLoaded', this.contentLoadedHandler);
        }
        else {
            this.contentLoadedHandler();
        }

        this.window.addEventListener('blur', this.blurHandler);
        this.window.addEventListener('focus', this.focusHandler);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected setFocus(value: boolean) {
        if (value === this._isFocused) {
            return;
        }
        this._isFocused = value;
        this.observer.next(new ObservableData(NativeWindowServiceEvent.FOCUS_CHANGED));
    }

    protected commitStatusChangedProperties(): void {
        if (this.isLoaded) {
            this.observer.next(new ObservableData(NativeWindowServiceEvent.LOADED));
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    protected blurHandler = (): void => this.setFocus(false);

    protected focusHandler = (): void => this.setFocus(true);

    protected contentLoadedHandler = (): void => { this.status = LoadableStatus.LOADED };

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public open(url?: string, target?: string): void {
        this.window.open(url, target);
    }

    public focus(): void {
        this.window.focus();
    }

    public blur(): void {
        this.window.blur();
    }

    public getParam(name: string): string {
        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        let results: Array<string> = regex.exec(this.window.location.href);

        if (_.isNil(results)) {
            return null;
        }
        if (_.isNil(results[2])) {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    public getParams(source?: string): URLSearchParams {
        if (_.isNil(source)) {
            source = this.window.location.search;
        }
        return new URLSearchParams(source);
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get isFocused(): boolean {
        return this._isFocused;
    }

    public get url(): string {
        return this.window.location.href;
    }

    public get title(): string {
        return this.document.title;
    }

    public set title(value: string) {
        this.document.title = value;
    }

    public get window(): Window {
        return this.document.defaultView;
    }

    public get document(): Document {
        return this._document;
    }
}

export enum NativeWindowServiceEvent {
    LOADED = 'LOADED',
    FOCUS_CHANGED = 'FOCUS_CHANGED'
}
