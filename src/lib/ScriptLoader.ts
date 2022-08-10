import { ObservableData, PromiseHandler, Loadable, LoadableEvent, LoadableStatus } from '@ts-core/common';
import * as _ from 'lodash';
import { NativeWindowService } from '../service/NativeWindowService';

export class ScriptLoader extends Loadable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private url: string;
    private _document: Document;
    private promise: PromiseHandler<void>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(url: string, item?: Document) {
        super();
        this.url = url;
        this._document = !_.isNil(item) ? item : document;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async load(): Promise<void> {
        if (!_.isNil(this.promise)) {
            return this.promise.promise;
        }

        let script = this.document.createElement('script');
        this.document.documentElement.firstChild.appendChild(script);

        script.onload = () => {
            this.status = LoadableStatus.LOADED;
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE));
            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
            this.promise.resolve();
        }
        script.onerror = (event) => {
            this.status = LoadableStatus.ERROR;
            this.observer.next(new ObservableData(LoadableEvent.ERROR));
            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
            this.promise.reject(event.toString());
        };

        this.promise = PromiseHandler.create<void>();
        script.src = this.url;
        return this.promise.promise;
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