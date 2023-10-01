(function (Scratch) {
  'use strict';

  class WebSocketExtension {
    constructor () {
      this.socket = null;
    }

    getInfo () {
      return {
        id: 'webSocket',
        name: 'Shell',
        blocks: [
          {
            opcode: 'connect',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Connect to [url]',
            arguments: {
              url: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'ws://localhost:8765'
              }
            }
          },
          {
            opcode: 'send',
            blockType: Scratch.BlockType.COMMAND,
            text: 'execute [message]',
            arguments: {
              message: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'echo Hello World'
              }
            }
          },
          {
            opcode: 'disconnect',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Disconnect from WebSocket server'
          }
        ]
      };
    }

    connect (args) {
      if (this.socket) {
        this.disconnect();
      }
      this.socket = new WebSocket(args.url);
      this.socket.onopen = () => console.log('WebSocket connection opened.');
      this.socket.onclose = () => {
        console.log('WebSocket connection closed.');
        this.socket = null;
      };
      this.socket.onerror = (error) => console.error('WebSocket error:', error);
    }

    send (args) {
      if (this.socket) {
        this.socket.send(args.message);
      }
    }

    disconnect () {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  }

  Scratch.extensions.register(new WebSocketExtension());
})(Scratch);
