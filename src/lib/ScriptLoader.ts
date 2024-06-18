import { ObservableData, PromiseHandler, Loadable, LoadableEvent, LoadableStatus } from '@ts-core/common';
import * as _ from 'lodash';

export class ScriptLoader extends Loadable {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private url: string;
    private promise: PromiseHandler<void>;

    protected document: Document;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(url: string, item?: Document) {
        super();
        this.url = url;
        this.document = !_.isNil(item) ? item : document;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async createScript(): Promise<HTMLScriptElement> {
        return this.document.createElement('script');
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

        let item = await this.createScript();
        this.document.documentElement.firstChild.appendChild(item);

        item.onload = () => {
            this.status = LoadableStatus.LOADED;
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE));
            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
            this.promise.resolve();
        }
        item.onerror = (event) => {
            this.status = LoadableStatus.ERROR;
            this.observer.next(new ObservableData(LoadableEvent.ERROR));
            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
            this.promise.reject(event.toString());
        };

        this.promise = PromiseHandler.create<void>();
        item.src = this.url;
        return this.promise.promise;
    }
}