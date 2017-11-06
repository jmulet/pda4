import { BADGES_TYPES } from '../list/badge.logic';
import { SCORES } from '../list/badgebutton.component';

export class FormulaContext {
    static _badges: any;

    static create() {
        const context: any = {};

        context.AVERAGE = function (...args: any[]) {
            const n = args.length;
            let sum = 0;
            let total = 0;
            for (let i = 0; i < n; i++)  {
                if (!isNaN(args[i])) {
                    let num = parseFloat(args[i]);
                    if (num < 0 && num !== -1) {
                        num = 0;
                    }
                    if (num >= 0)  {
                        sum += num;
                        total += 1;
                    }
                }
            }

            if (total > 0) {
                return sum / total;
            } else {
                return '';
            }
        };

        context.MAX = function (...args) {
            const n = args.length;
            let maxim = 0;
            let total = 0;
            for (let i = 0; i < n; i++)  {
                if (!isNaN(args[i])) {
                    let num = parseFloat(args[i]);
                    if (num < 0 && num !== -1) {
                        num = 0;
                    }
                    if (num >= 0 && num > maxim)  {
                        maxim = num;
                        total += 1;
                    }
                }
            }
            if (total > 0) {
                return maxim;
            } else {
                return '';
            }
        };

        context.MIN = function (...args) {
            const n = args.length;
            let minim = Number.MAX_VALUE;
            let total = 0;
            for (let i = 0; i < n; i++)  {
                if (!isNaN(args[i])) {
                    let num = parseFloat(args[i]);
                    if (num < 0 && num !== -1) {
                        num = 0;
                    }
                    if (num >= 0 && num < minim)  {
                        minim = num;
                        total += 1;
                    }
                }
            }
            if (total > 0) {
                return minim;
            } else {
                return '';
            }
        };

        context.IF = function (condition, trueExpr, falseExpr) {
             if (condition) {
                return trueExpr;
             } else {
                return falseExpr;
             }
        };

        context.COUNT = function (...args) {
            const n = args.length;
            let total = 0;
            for (let i = 0; i < n; i++)  {
                if (!isNaN(args[i])) {
                    let num = parseFloat(args[i]);
                    if (num < 0 && num !== -1) {
                        num = 0;
                    }
                    if (num >= 0)  {
                        total += 1;
                    }
                }
            }
            return total;
       };


       context.SUM = function (...args) {
        const n = args.length;
        let total = 0;
        for (let i = 0; i < n; i++)  {
            if (!isNaN(args[i])) {
                let num = parseFloat(args[i]);
                if (num < 0 && num !== -1) {
                    num = 0;
                }
                if (num >= 0)  {
                    total += num;
                }
            }
        }
        return total;
    };

    context.NORM = function(x) {
        if  (typeof(x) === 'number' ) {
            if (x < 0 && x !== -1) {
                return 0;
            } else if (x > 10) {
                return 10;
            }
        }
        return x;
    };

    /**
     * Gets the automatic grade from badges of type type
     * and considers +-1 point a scale factor
     */
    context.BADGES = function(type: string, scale?: number){
        context._badges = context._badges || [];
        context._idUser = context._idUser || 0;
        context._SESSIONS = context._SESSIONS || 1;
        context._HOMEWORK_SESSIONS = context._HOMEWORK_SESSIONS || 1;

        if (!scale) {
            if (type === 'HOMEWORK' || type === 'CLASSWORK') {
                scale = 1.25;
            } else if (type === 'BEHAVIOUR') {
                scale = 1 / 5;
            } else {
                scale = 1;
            }
        }

        const row = context._badges.filter((e) => e.id === context._idUser)[0];
        if (row) {
            let options = BADGES_TYPES[(type || '').toUpperCase().trim()];
            if (!options) {
                console.log('UNKNOWN BADGE TYPE ', type);
                options = [];
            }
            const badges = row.badges.filter( (b) => options.indexOf(b.type) >= 0 );

            if (type === 'HOMEWORK') {
                let total = 0;
                badges.forEach( (x) => {
                    switch (x.type) {
                        case 201: total += 1; break;
                        case 200: total += 1; break;
                        case 300: total -= 0.25; break;
                    }
                } );
                return scale * 10 * total / context._HOMEWORK_SESSIONS;

            }  else if (type === 'CLASSWORK') {

                let total = 0;
                badges.forEach( (x) => {
                    switch (x.type) {
                        case 202: total += 1; break;
                        case 203: total += 1; break;
                        case 304: total -= 0.25; break;
                    }
                } );
                return 10 * scale * total / context._SESSIONS;

            } else {

                let total = 0;
                badges.forEach( (x) => total += x.rscore );
                return 5 * (1 + scale * total / context._SESSIONS);
            }

        } else {
            return '';
        }
    };

    context.DECIMALS = function(x, n) {
        if (typeof (x) === 'string') {
            return x;
        }
        const pow = Math.pow(10, n);
        return Math.floor(x * pow) / pow;
    };
    
    // Alias
        context.PROMEDIO = context.AVERAGE;
        context.PROMIG = context.AVERAGE;
        context.SI = context.IF;
        context.CONTAR = context.COUNT;
        context.COMPTA = context.COUNT;
        context.SUMA = context.SUM;

        return context;
    }

}

