import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

/**
* Generated class for the LongPressDirective directive.
*
* See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
* for more info on Angular Directives.
*/
@Directive({
    selector: '[appLongPress]'
})
export class LongPressDirective {
    lastTimeUp: number;
    lastTime: number;

    private timeoutId: number = null;
    private intervalId: number = null;

    private isLongPressing: boolean;
    private isPressing: boolean;

    @Output() onShortPress = new EventEmitter();
    @Output() onLongPress = new EventEmitter();
    @Output() onLongPressing = new EventEmitter();

    @Input() timeout = 1500;

    @HostBinding('class.press')
    get press() {
        return this.isPressing;
    }

    @HostBinding('class.long-press')
    get longPress() {
        return this.isLongPressing;
    }

    @HostListener('touchstart', ['$event'])
    @HostListener('mousedown', ['$event'])
    public onMouseDown(event) {
        if (this.isPressing) {
            return;
        }
        // Discard too near in time touches
        const now = new Date().getTime();
        if (this.lastTime && now - this.lastTime < 500) {
            return;
        }
        this.lastTime = now;
        this.isPressing = true;
        this.isLongPressing = false;

        this.timeoutId = (<any>window).setTimeout(() => {
            this.isLongPressing = true;
            event.badge = {isLong: true};
            this.onLongPress.emit(event);

            /*
            this.intervalId = (<any>window).setInterval(() => {
                this.onLongPressing.emit(event);
                console.log('long press event');
            }, 30);
            */
        }, this.timeout);
    }

    @HostListener('touchend', ['$event'])
    @HostListener('mouseup', ['$event'])
    public onMouseUp(event) {
         // Discard too near in time touches
         const now = new Date().getTime();
         if (this.lastTimeUp && now - this.lastTimeUp < 500) {
             return;
         }
         this.lastTimeUp = now;
         if (!this.isLongPressing) {
            event.badge = {isLong: false};
            this.onShortPress.emit(event);
        }
        this.endPress();
    }

    @HostListener('mouseleave')
    public onMouseLeave(event) {
        this.endPress();
    }

    private endPress() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }

        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
        }

        this.isLongPressing = false;
        this.isPressing = false;
    }

}
