import {dateKey} from './core.js';
// ISO timestamps are UTC; UI dates must be localized to the viewer's timezone.
export const localRecordDate=stamp=>stamp?dateKey(new Date(stamp)):'—';
