declare module 'react-big-calendar' {
  import { ComponentType } from 'react';

  export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';
  export type Navigate = 'PREV' | 'NEXT' | 'TODAY' | 'DATE';

  export interface Event {
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
  }

  export interface CalendarProps {
    localizer: any;
    events: Event[];
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    titleAccessor?: string | ((event: Event) => string);
    allDayAccessor?: string | ((event: Event) => boolean);
    resourceAccessor?: string | ((event: Event) => any);
    view?: View;
    views?: View[] | { [key: string]: boolean | ComponentType };
    onView?: (view: View) => void;
    date?: Date;
    onNavigate?: (date: Date, view: View, action: Navigate) => void;
    onSelectEvent?: (event: Event) => void;
    onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick' }) => void;
    onDoubleClickEvent?: (event: Event) => void;
    onSelecting?: (range: { start: Date; end: Date }) => boolean | undefined;
    selectable?: boolean | 'ignoreEvents';
    toolbar?: boolean;
    popup?: boolean;
    popupOffset?: number | { x: number; y: number };
    style?: React.CSSProperties;
    className?: string;
    elementProps?: React.HTMLAttributes<HTMLDivElement>;
    formats?: any;
    messages?: any;
    components?: any;
    eventPropGetter?: (event: Event) => { className?: string; style?: React.CSSProperties };
    slotPropGetter?: (date: Date) => { className?: string; style?: React.CSSProperties };
    dayPropGetter?: (date: Date) => { className?: string; style?: React.CSSProperties };
    showMultiDayTimes?: boolean;
    step?: number;
    timeslots?: number;
    rtl?: boolean;
    defaultView?: View;
    defaultDate?: Date;
    length?: number;
    drilldownView?: View | null;
    getDrilldownView?: ((targetDate: Date, currentViewName: View, configuredViewNames: View[]) => View | null) | null;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export function momentLocalizer(moment: any): any;
  export function globalizeLocalizer(globalize: any): any;
  export function dateFnsLocalizer(config: any): any;
}

