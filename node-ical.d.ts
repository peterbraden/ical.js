declare module 'node-ical' {
    import { CoreOptions } from 'request';

    /**
     * Methods (Sync)
     */
    export interface NodeICalSync {
        parseICS(body: string): CalendarResponse;

        fromFile(file: string): CalendarResponse;
    }

    export const sync: NodeICalSync;

    /**
     * Methods (Async)
     */
    export interface NodeICalAsync {
        fromURL(url: string, callback: NodeIcalCallback): void;

        fromURL(url: string, options: CoreOptions | NodeIcalCallback, callback?: NodeIcalCallback): void;

        fromURL(url: string): Promise<CalendarResponse>;

        parseICS(body: string, callback: NodeIcalCallback): void;

        parseICS(body: string): Promise<CalendarResponse>;

        fromFile(file: string, callback: NodeIcalCallback): void;

        fromFile(file: string): Promise<CalendarResponse>;
    }

    export const async: NodeICalAsync;

    /**
     * Methods (Autodetect)
     */
    export function fromURL(url: string, callback: NodeIcalCallback): void;

    export function fromURL(url: string, options: CoreOptions | NodeIcalCallback, callback?: NodeIcalCallback): void;

    export function fromURL(url: string): Promise<CalendarResponse>;

    export function parseICS(body: string, callback: NodeIcalCallback): void;

    export function parseICS(body: string): CalendarResponse;

    export function fromFile(file: string, callback: NodeIcalCallback): void;

    export function fromFile(file: string): CalendarResponse;

    /**
     * Response objects
     */
    export type NodeIcalCallback = (err: any, data: CalendarResponse) => void;

    export interface CalendarResponse {
        [key: string]: CalendarComponent;
    }

    export type CalendarComponent = VTimeZone | VEvent;

    export type VTimeZone = TimeZoneProps & TimeZoneDictionary;

    interface TimeZoneProps extends BaseComponent {
        type: 'VTIMEZONE';
        tzid: string;
        tzurl: string;
    }

    interface TimeZoneDictionary {
        [key: string]: TimeZoneDef | undefined;
    }

    export interface VEvent extends BaseComponent {
        type: 'VEVENT';
        dtstamp: DateWithTimeZone;
        uid: string;
        sequence: string;
        transparency: Transparency;
        class: Class;
        summary: string;
        start: DateWithTimeZone;
        datetype: DateType;
        end: DateWithTimeZone;
        location: string;
        description: string;
        url: string;
        completion: string;
        created: DateWithTimeZone;
        lastmodified: DateWithTimeZone;

        // I am not entirely sure about these, leave them as any for now..
        organizer: any;
        exdate: any;
        geo: any;
        recurrenceid: any;
    }

    export interface BaseComponent {
        params: any[];
    }

    export interface TimeZoneDef {
        type: 'DAYLIGHT' | 'STANDARD';
        params: any[];
        tzoffsetfrom: string;
        tzoffsetto: string;
        tzname: string;
        start: DateWithTimeZone;
        dateType: DateType;
        rrule: string;
        rdate: string | string[];
    }

    export type DateWithTimeZone = Date & { tz: string };
    export type DateType = 'date-time' | 'date';
    export type Transparency = 'TRANSPARENT' | 'OPAQUE';
    export type Class = 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL';
}
