export class Script {
    globals: string[];
    wExecScript: any;
    wEval: any;
    win: any;
    iframe: HTMLIFrameElement;
    context: any;

constructor(context) {
    this.context = context;
    const iframe = document.createElement('iframe');
    this.iframe = iframe;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const win: any = iframe.contentWindow;
    this.win = win;

    this.win.onbeforeunload = function () {
        iframe.src = 'about:blank';
    };


    this.wEval = win.eval;
    this.wExecScript = win.execScript;

    if (!this.wEval && this.wExecScript) {
        // win.eval() magically appears when this is called in IE:
        this.wExecScript.call(win, 'null');
        this.wEval = win.eval;
    }

    const contextKeys = Object.keys(this.context);
    const n = contextKeys.length;
    for (let i = 0; i < n; i++) {
        const key = contextKeys[i];
        win[key] = context[key];
    }

    this.globals = Object.keys(win);
}

setProperty(key: string, value: any) {
    this.context[key] = value;
    this.win[key] = value;
}

runInContext(code) {
    let res;
    try {
        res = this.wEval.call(this.win, code);
    } catch (Ex) {
        console.log(':-( ', Ex, code);
        throw(Ex);
    }
    const winKeys = Object.keys(this.win);

    const n = winKeys.length;
    for (let i = 0; i < n; i++) {
        const key = winKeys[i];
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (this.globals.indexOf(key) < 0) {
            this.context[key] = this.win[key];
        }
    }

    return res;
}


destroy() {
    document.body.removeChild(this.iframe);
    this.wEval = null;
    this.wExecScript = null;
    this.win = null;
}

}

