class InternetExtension {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'internet',
            name: 'Internet',
            color1: '#000000',
            blocks: [
                {
                    opcode: 'openURL',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'open [URL] in [OPTION]',
                    arguments: {
                        URL: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'https://example.com/',
                        },
                        OPTION: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'tabOption',
                            defaultValue: 'new tab',
                        },
                    },
                },

                    opcode: 'requestAddContent',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'request adding content to [URL]',
                    arguments: {
                        URL: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'https://api.example.com/post',
                        },
                    },
                }
            ],
            menus: {
                tabOption: {
                    acceptReporters: true,
                    items: ['new tab', 'this tab'],
                },
            },
        };
    }

    openURL(args) {
        const url = args.URL;
        const option = args.OPTION;

        if (option === 'new tab') {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }

    requestContent(args) {
        const url = args.URL;
        return fetch(url)
            .then(response => response.text())
            .catch(error => error.toString());
    }

    requestAddContent(args) {
        const url = args.URL;
        const data = { key: 'value' };
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => response.text())
            .catch(error => error.toString());
    }
}

Scratch.extensions.register(new InternetExtension());
