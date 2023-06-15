import { LoggerLevel, LoggerWrapper } from '@ts-core/common';

export class DefaultLogger extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(level: LoggerLevel, context?: any) {
        super(console, context, level);
        console['verbose'] = console.info;
        console['debug'] = console.info;
    }
}
