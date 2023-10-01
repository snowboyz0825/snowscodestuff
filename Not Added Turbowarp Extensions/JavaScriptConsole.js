(function (Scratch) {
    'use strict';

    class JavaScriptConsole {
        getInfo() {
            return {
                id: 'javascriptConsole',
                name: 'JavaScript Console',
                blocks: [
                    {
                        opcode: 'runJavaScriptCode',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Run JavaScript code [code]',
                        arguments: {
                            code: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'console.log("Hello, World!");'
                            }
                        }
                    }
                ]
            };
        }

        runJavaScriptCode(args) {
            const code = args.code || '';

            try {
                eval(code);
            } catch (error) {
                console.error('Error executing JavaScript code:', error);
            }
        }
    }

    Scratch.extensions.register(new JavaScriptConsole());
})(Scratch);