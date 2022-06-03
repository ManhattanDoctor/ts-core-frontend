import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Loadable, LoadableStatus } from '@ts-core/common';
import { ObservableData } from '@ts-core/common/observer';

export class NativeWindowService extends Loadable<NativeWindowServiceEvent, void> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private timer: any;
    private _isFocused: boolean = true;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this.observer = new Subject();
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
        this.status = document.readyState === 'complete' ? LoadableStatus.LOADED : LoadableStatus.NOT_LOADED;
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
        window.open(url, target);
    }

    public focus(): void {
        window.focus();
    }

    public blur(): void {
        window.blur();
    }

    public getParam(name: string): string {
        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        let results: Array<string> = regex.exec(window.location.href);

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
            source = window.location.search;
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
        return window.location.href;
    }

    public get title(): string {
        return document.title;
    }

    public set title(value: string) {
        document.title = value;
    }

    public get window(): Window {
        return window;
    }
}

export enum NativeWindowServiceEvent {
    LOADED = 'LOADED',
    FOCUS_CHANGED = 'FOCUS_CHANGED'
}
