class YouTubeExtension {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'youtube',
            name: 'YouTube',
            color1: '#FF6347',
            blocks: [
                {
                    opcode: 'openChannel',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'open YouTube channel with nickname [ID]',
                    arguments: {
                        ID: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '@playerwictor',
                        },
                    },
                },
                {
                    opcode: 'subscribeChannel',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'subscribe to YouTube channel with nickname [ID]',
                    arguments: {
                        ID: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '@playerwictor',
                        },
                    },
                },
            ],
        };
    }

    openChannel(args) {
        const id = args.ID;
        const url = `https://youtube.com/${id}/`;
        window.open(url, '_blank');
    }

    subscribeChannel(args) {
        const id = args.ID;
        const url = `https://youtube.com/${id}/?sub_confirmation=1`;
        window.open(url, '_blank');
    }
}

Scratch.extensions.register(new YouTubeExtension());
