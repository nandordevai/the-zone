export class AudioModule {
    constructor(ctx, name) {
        this.name = name;
        this.ctx = ctx;
        this.input = null;
        this.output = this.ctx.createGain();
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
        console.log(`[Patch] ${this.name} → ${targetName}`);

        if (!destination) {
            console.warn(`[Error] ${this.name} tried to connect to a null destination`);
            return target;
        }

        try {
            if (targetName === 'AudioParam') {
                this.output.connect(destination, outputIndex);
            } else {
                this.output.connect(destination, outputIndex, inputIndex);
            }
        } catch (e) {
            console.error(`[Connection failed] Verify that ${this.name}.output is a valid AudioNode`);
        }

        return target;
    }
    disconnect() {
        this.output.disconnect();
    }
}