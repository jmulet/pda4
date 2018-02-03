const HOLIDAYS = [
    '22-09-2017',
    '01-11-2017',
    '06-12-2017', '08-12-2017',
    ['23-12-2017', '07-01-2018'],
    '02-03-2018',
    '05-03-2018',
    ['29-03-2018', '06-04-2018'],
    ['30-04-2018', '01-05-2018']
];


export class DateUtils {
    date: Date;

    public static DateParser(str: string): Date {
        let delim = '-';
        if (str.indexOf('/') >= 0) {
            delim = '/';
        }
        const s = str.split(delim);

        const day = parseInt(s[0], 10);
        const month = parseInt(s[1], 10);
        const fullyear = parseInt(s[2], 10);

        return new Date(fullyear, month - 1, day, 0, 0, 0, 0);
    }

    /**
     * Compares neglecting the time part
     * @param d1 is date1 string or Date
     * @param d2 id date2 string or date
     * Returns negative if d1<d2, zero if d1=d2, positive if d2>d1
     */
    public static compareDates(d1: (string | Date), d2: (string | Date)): number {
        let date1, date2;
        if (typeof (d1) === 'string') {
            date1 = DateUtils.DateParser(d1);
        } else {
            date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0, 0);
        }
        if (typeof (d2) === 'string') {
            date2 = DateUtils.DateParser(d2);
        } else {
            date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 0, 0, 0, 0);
        }
        //console.log('compare dates orig ', d1, d2, ' by ', date1, date2, ' = ', date1-date2);
        return date1 - date2;
    }

    constructor(date: Date) {
        this.date = date;
    }
    toMysql(): string {
        return this.date.getFullYear() + '-' + (this.date.getMonth() + 1) + '-' + this.date.getDate();
    }

    isHoliday() {
        const dow = this.date.getDay();
        if (dow === 0 || dow === 6) {
            return true;
        }
        let holiday = false;
        for (let interval of HOLIDAYS) {
            if (typeof (interval) === 'string') {
                if (DateUtils.compareDates(interval, this.date) === 0) {
                    holiday = true;
                    break;
                }
            } else if (Array.isArray(interval)) {
                const d0 = interval[0];
                const d1 = interval[1];
                if (DateUtils.compareDates(d0, this.date) <= 0 && DateUtils.compareDates(this.date, d1) <= 0) {
                    holiday = true;
                    break;
                }
            }
        }

        return holiday;
    }


}
