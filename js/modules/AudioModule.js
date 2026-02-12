export class AudioModule {
    constructor(ctx, name) {
        this.name = name;
        this.ctx = ctx;
        this.input = null;
        this.output = this.ctx.createGain();
        this.debug = false;
    }

    set gain(level) {
        this.output.gain.value = level;
    }

    connect(target, outputIndex = 0, inputIndex = 0) {
        const destination = target.input || target;

        let targetName = 'Unknown';
        if (target instanceof AudioModule) {
            targetName = target.name;
        } else if (target instanceof AudioParam) {
            targetName = 'AudioParam';
        } else if (target instanceof AudioNode) {
            targetName = target.constructor.name;
        }
        this.log(`[Patch] ${this.name} → ${targetName}`);

        if (!destination) {
            this.log(`[Error] ${this.name} tried to connect to a null destination`, 'warn');
            return target;
        }

        try {
            if (targetName === 'AudioParam') {
                this.output.connect(destination, outputIndex);
            } else {
                this.output.connect(destination, outputIndex, inputIndex);
            }
        } catch (e) {
            this.log(`[Connection failed] Verify that ${this.name}.output is a valid AudioNode`, 'error');
        }

        return target;
    }

    log(msg, level) {
        if (!this.debug) return;

        if (level === 'error') {
            console.error(msg);
        } else if (level === 'warn') {
            console.warn(msg);
        } else {
            console.log(msg);
        }
    }

    disconnect() {
        this.output.disconnect();
    }
}