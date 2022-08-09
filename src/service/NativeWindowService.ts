import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Loadable, ObservableData, LoadableStatus } from '@ts-core/common';

export class NativeWindowService extends Loadable<NativeWindowServiceEvent, void> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected timer: any;
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

        this.checkLoadState();
        if (!this.isLoaded) {
            this.timer = setInterval(this.checkLoadState, 500);
        }

        this.window.addEventListener('blur', this.blurHandler);
        this.window.addEventListener('focus', this.focusHandler);
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    private setFocus(value: boolean) {
        if (value === this._isFocused) {
            return;
        }
        this._isFocused = value;
        this.observer.next(new ObservableData(NativeWindowServiceEvent.FOCUS_CHANGED));
    }

    // --------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    // --------------------------------------------------------------------------

    private checkLoadState = (): void => {
        if (this.isLoaded) {
            return;
        }
        this.status = this.document.readyState === 'complete' ? LoadableStatus.LOADED : LoadableStatus.NOT_LOADED;
        if (this.isLoaded) {
            clearInterval(this.timer);
            this.observer.next(new ObservableData(NativeWindowServiceEvent.LOADED));
        }
    };

    private blurHandler = (): void => this.setFocus(false);

    private focusHandler = (): void => this.setFocus(true);

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
