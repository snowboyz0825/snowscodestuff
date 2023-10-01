class SearchExtension {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'search',
            name: 'Search',
            color1: '#130f91',
            blocks: [
                {
                    opcode: 'searchInService',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'search in service [SERVICE] phrase [PHRASE]',
                    arguments: {
                        SERVICE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'searchServices',
                            defaultValue: 'google',
                        },
                        PHRASE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Scratch programming',
                        },
                    },
                },
            ],
            menus: {
                searchServices: [
                    {
                        value: 'google',
                        text: 'Google',
                    },
                    {
                        value: 'duckduckgo',
                        text: 'DuckDuckGo',
                    },
                    {
                        value: 'yahoo',
                        text: 'Yahoo',
                    },
                    {
                        value: 'bing',
                        text: 'Bing',
                    },
                    {
                        value: 'baidu',
                        text: 'Baidu',
                    },
                    {
                        value: 'yandex',
                        text: 'Yandex',
                    },
                ],
            },
        };
    }

    searchInService(args) {
        const service = args.SERVICE;
        const phrase = args.PHRASE;

        let searchURL = '';

        switch (service) {
            case 'google':
                searchURL = `https://www.google.com/search?q=${encodeURIComponent(phrase)}`;
                break;
            case 'duckduckgo':
                searchURL = `https://duckduckgo.com/?q=${encodeURIComponent(phrase)}`;
                break;
            case 'yahoo':
                searchURL = `https://search.yahoo.com/search?p=${encodeURIComponent(phrase)}`;
                break;
            case 'bing':
                searchURL = `https://www.bing.com/search?q=${encodeURIComponent(phrase)}`;
                break;
            case 'baidu':
                searchURL = `https://www.baidu.com/s?wd=${encodeURIComponent(phrase)}`;
                break;
            case 'yandex':
                searchURL = `https://yandex.com/search/?text=${encodeURIComponent(phrase)}`;
                break;
            default:
                break;
        }

        if (searchURL !== '') {
            window.open(searchURL, '_blank');
        }
    }
}

Scratch.extensions.register(new SearchExtension());
