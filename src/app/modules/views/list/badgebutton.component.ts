import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SessionService } from '../../../services/session.service';
import { Color } from '../../shared/color.interpolator';

export const i18n_badges = {
    ca: {
        1: 'Comentaris',
        2: 'Regularitat',
        3: 'Millor de la setmana',
        4: 'Millor del mes',
        5: 'Repte de la setmana',
        50: 'Guanyador d\'un Kahoot',
        100: 'Especial de Nadal',
        101: 'Especial de Pasqua',
        200: 'Deures fets completament',
        201: 'Deures fets',
        202: 'Treballa a classe molt bé',
        203: 'Treballa a classe',
        204: 'Participa, presta atenció',
        205: 'Surt a la pissarra',
        300: 'No ha fet els deures',
        301: 'Xerra i/o molesta',
        302: 'No duu el material necessari',
        303: 'No obeix al professor',
        304: 'No treballa a classe',
        305: 'Passiu, no presta atenció',
        400: 'Falta a classe',
        401: 'Falta puntualitat'
    },
    es: {
        1: 'Comentarios',
        2: 'Regularidad',
        3: 'Mejor de la semana',
        4: 'Mejor del mes',
        5: 'Reto de la setmana',
        50: 'Ganador de un Kahoot',
        100: 'Especial de Navidad',
        101: 'Especial de Pascua',
        200: 'Deberes hechos completamente',
        201: 'Deberes hechos',
        202: 'Trabaja en clase muy bien',
        203: 'Trabaja en clase',
        204: 'Participa, presta atención',
        205: 'Sale a la pizarra',
        300: 'No ha hecho los deberes',
        301: 'Habla y/o molesta',
        302: 'No trae el material necesario',
        303: 'No obedece al profesor',
        304: 'No trabaja en clase',
        305: 'Passivo, no presta atención',
        400: 'Falta a clase',
        401: 'Falta de puntualidad'
    },
    en: {
        1: 'Comments',
        2: 'Regularity',
        3: 'Best of the week',
        4: 'Best of the month',
        5: 'Week challenge',
        50: 'Kahoot winner',
        100: 'Xmas special badge',
        101: 'Easter special badge',
        200: 'Homework totally done',
        201: 'Homework done',
        202: 'Work in class very well',
        203: 'Work in class',
        204: 'Participates, pays attention',
        205: 'Blackboard exercise',
        300: 'Homework not done',
        301: 'Speaks and / or annoys',
        302: 'Does not bring the required material',
        303: 'Does not obey the teacher',
        304: 'Does not work in class',
        305: 'Passive, does not pay attention',
        400: 'Missing class',
        401: 'Punctuality penalty'
    }
};

export const SCORES = {
    200: 25,
    201: 20,
    202: 25,
    203: 10,
    204: 15,
    205: 20,
    300: -10,
    301: -20,
    302: -5,
    303: -20,
    304: -15,
    305: -5,
    400: 0,
    401: -5
};

export const rainbow = function(type, score?) {
    if (type) {
        score = SCORES[type] || score || 0;
    }
    if (score < -100) {
        score = -100;
    } else if (score > 50) {
        score = 50;
    }

    if (score === 0) {
        return '255,255,0';
    } else if (score > 0) {
        return Color.interpolateColor([255, 255, 0], [0, 255, 0], score / 100).join(',');
    } else {
        return Color.interpolateColor([255, 0, 0], [255, 255, 0], -score / 100).join(',');
    }
};

 
@Component({
    selector: 'app-badge-button',
    template: `<button class="btn-badge" [ngStyle]="{border: btnBorder, 'background-color': btnBg}"
          title="{{badgeDescription}}"
          appLongPress
          [timeout]="1500"
          (onShortPress)="handleShortPress($event)"
          (onLongPress)="handleLongPress($event)"><span class="noselect">{{symbol}}</span></button>
          `,
    styles: [
        `
        .btn-badge{
            width: 42px;
            height: 42px;
            font-size: 90%;
            background: white;
            border-radius: 4px;
        }

        .noselect {
            -webkit-touch-callout: none; /* iOS Safari */
              -webkit-user-select: none; /* Safari */
               -khtml-user-select: none; /* Konqueror HTML */
                 -moz-user-select: none; /* Firefox */
                  -ms-user-select: none; /* Internet Explorer/Edge */
                      user-select: none; /* Non-prefixed version, currently
                                            supported by Chrome and Opera */
          }
        `
    ]
})


export class BadgeButtonComponent implements OnInit {
    _state = 0; // Holds the id of the badge
    btnBg = 'white';
    badgeDescription: any;
    btnBorder: string;
    symbol: any;
    scores = SCORES;

    type: number;
    @Output() changed = new EventEmitter<any>();
    @Input() set badgeType(type) {
        this.type = type;

        this.btnBorder = '3px solid rgba(' + rainbow(this.type) + ',1)';

        const lang = this.session.getLang();
        const desc = 'Badge';
        this.badgeDescription = (i18n_badges[lang] || {})[type] || desc;
    }

    @Input() set id(state) {
        this._state = state;
        this.formatBtn();
    }

    @Input() set badgeSymbol(sym) {
        this.symbol = sym;
    }
    constructor(private session: SessionService) { }
 

    formatter = (s: any) => s.fullname;

    ngOnInit() {}

    handleShortPress(evt) {
        evt.badge = evt.badge || {};
        evt.badge.type = this.type;
        // console.log('Click: Badge button has recieved this evt ', evt, ' and emits it to botonera');
        this.changed.emit(evt);
    }

    handleLongPress(evt) {
        evt.badge = evt.badge || {};
        evt.badge.type = this.type;
        evt.badge.idBadge = this._state;
        // console.log('LongPress: Badge button has recieved this evt ', evt, ' and emits it to botonera');
        this.changed.emit(evt);
    }

    formatBtn() {
        if (this._state) {
            this.btnBg = 'rgba(' + rainbow(this.type) + ', 0.8)';
        } else {
            this.btnBg = 'white';
        }
        // console.log('this._state', this._state, this.btnBg);
    }
}
