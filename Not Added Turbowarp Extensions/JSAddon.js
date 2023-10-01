//Описание типов для удобной работы с кодом

/**
 * @typedef {string} Channel Канал с набором сигналов
 */

/**
 * @typedef {Array<string>} CustomSignals Набор пользовательских сигналов
 */

/**
 * @typedef {string} FuncName Имя функции
 */
/**
 * @typedef {string} JsonName Имя переменной JSON
 */
/**
 * @typedef {string} StyleName Имя стиля
 */
/**
 * @typedef {string} StyleContent CSS стиль (без классов)
/**
 * @typedef {string} MutantParentName Имя переменной родителя виджета
 */

/**
 * @typedef {Object} VarStruct Структура переменной для подставки значений в функции
 * @property {string} variable Идентификатор переменной
 * @property {number} index Номер подмены
 * @property {0|1} where 0 - Глобальная переменная, 1 - локальная переменная 
 */

/**
 * @typedef {Object} FuncStruct Структура функции для резервирования
 * @property {string} name Название функции для пользователя
 * @property {boolean} success Успешность инициализации функции
 * @property {boolean} isReturned Возвращает ли что-нибудь функция
 * @property {number} cArguments Кол-во аргументов
 * @property {Array<VarStruct>} variables Набор переменных для подставки значений
 * @property {string} textcode Код функции в виде текста
 */

/**
 * @typedef {Object} MutantWidget Мутировавший виджет
 * @property {number} id Идентификатор переменной родителя
 * @property {HTMLElement} element Сам элемент
 * @property {string} widget Тип виджета
 * @property {string} style Установленный стиль
 * @property {string} value Значение поля value
 * @property {string} source Источник данных в виде идентификатора массива для некоторых типов виджетов
 */

(function (Scratch) {
  'use strict';
  /*
   * JsAddon extension v1.2 by KhandamovA
   */

  /**
   * @type {Map<FuncName, FuncStruct>} Набор пользовательских функций
   */
  let functions = new Map;

  /**
   * @type {Map<JsonName, Object>} Набор переменных типа JSON
   */
  let jsons_values = new Map;

  /**
   * @type {Map<StyleName, StyleContent>} Набор пользовательских стилей (без классов)
   */
  let elements_styles = new Map;

  /**
   * @type {Map<MutantParentName, MutantWidget>} Набор пользовательских виджетов
   */
  let mutations = new Map;

  /**
   * @type {Map<Channel, CustomSignals>} Набор пользовательских каналов с сигналами
   */
  let custom_signals = new Map;

  /**
   * @type {HTMLElement} HTML элемент находящийся под курсором мыши
   */
  let focusElement;

  /**
   * Идентификатор расширения
   */
  const my_id = 'KhandamovA';

  /**
   * Флаг для оптимизации фокуса
   */
  let isThrottled = false;

  /**
   * Виртуальная машина скретча
   */
  let vm = Scratch.vm;

  /**
   * @type {JSAddon} Экспортируемое расширение
   */
  var addon;

  let labelblock = (text) => ({
    blockType: Scratch.BlockType.LABEL,
    text: text
  });

  let buttonblock = (text, method_name) => ({
    func: method_name,
    blockType: Scratch.BlockType.BUTTON,
    text: text
  });

  class JSAddon {
    getInfo() {
      let styleMonitors = document.createElement('style');

      styleMonitors.innerHTML =
        "[class^='monitor_monitor-container'] {" +
        "background-color: transparent !important;" +
        "border : none;" +
        "display: none;" +
        "}" +
        ".khandamovA-hidden {" +
        "display: none !important; }" +
        "[class^='sc-monitor-overlay'] {" +
        "display : none;" +
        "}";

      document.body.insertBefore(styleMonitors, document.body.firstChild);

      setTimeout(() => {
        this.init({ styleMonitors });
      }, 50);

      return {
        id: 'KhandamovA',
        name: 'JsAddon',
        color1: '#4d0092',
        blocks: [
          "---",
          labelblock('JS'),
          {
            opcode: 'js_exec_code',
            blockType: Scratch.BlockType.COMMAND,
            text: 'return result to [variable] from js code [js]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_vars'
              },
              js: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'let g = new GVar(\'my variable\'); let l = new LVar(\'my variable\'); return \'hello JavaScript! \' + g + \' \' + l;'
              },
            }
          },
          {
            opcode: 'js_exec_code_ret',
            blockType: Scratch.BlockType.REPORTER,
            text: 'return result from js code [js]',
            arguments: {
              js: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'let g = new GVar(\'my variable\'); let l = new LVar(\'my variable\'); return \'hello JavaScript! \' + g + \' \' + l;'
              },
            }
          },
          "---",
          {
            opcode: 'js_init_func',
            blockType: Scratch.BlockType.COMMAND,
            text: 'register function by name [name] from js code [js] reinit [quest]',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'TestFunction'
              },
              js: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'let g = new GVar(\'my variable\'); let l = new LVar(\'my variable\'); return \'hello JavaScript! \' + g + \' \' + l;'
              },
              quest: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_vals'
              },
            }
          },
          {
            opcode: 'js_remove_func',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete function by name [name]',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_funcs'
              }
            }
          },
          {
            opcode: 'js_func_is_init',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'function by name [name] is registered?',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'TestFunction'
              }
            }
          },
          {
            opcode: 'js_exec_code_from_func',
            blockType: Scratch.BlockType.COMMAND,
            text: 'return result to [variable] from js function by name [func]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_vars'
              },
              func: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_funcs'
              },
            }
          },
          {
            opcode: 'js_exec_code_from_func_ret',
            blockType: Scratch.BlockType.REPORTER,
            text: 'return result from js function by name [func]',
            arguments: {
              func: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_funcs'
              },
            }
          },
          "---",
          {
            opcode: 'js_ret_convert_var',
            blockType: Scratch.BlockType.REPORTER,
            text: 'return [variable] as js variable',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_vars'
              }
            }
          },
          {
            opcode: 'js_exec_ret_raw_code',
            blockType: Scratch.BlockType.REPORTER,
            text: 'return code by function [func]',
            arguments: {
              func: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_funcs'
              },
            }
          },
          {
            opcode: 'js_ret_all_functions',
            blockType: Scratch.BlockType.REPORTER,
            text: 'all functions'
          },
          "---",
          labelblock('JSON'),
          {
            opcode: 'js_json_create',
            blockType: Scratch.BlockType.COMMAND,
            text: 'create json var [name] with value [value]',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'myJson'
              },
              value: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '{ "age" : 27, "name" : "Json", "items" : ["mask", "water", "axe"] }'
              }
            }
          },
          {
            opcode: 'js_json_delete',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete json var [name]',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_jsons'
              }
            }
          },
          {
            opcode: 'js_json_exist',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'json var [name] exist?',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'myJson'
              }
            }
          },
          "---",
          {
            opcode: 'js_json_get_var',
            blockType: Scratch.BlockType.REPORTER,
            text: 'json var [variable]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_jsons'
              }
            }
          },
          {
            opcode: 'js_json_as_object',
            blockType: Scratch.BlockType.REPORTER,
            text: '[variable] as object param [param]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              },
              param: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_constr_json'
              }
            }
          },
          {
            opcode: 'js_json_as_value',
            blockType: Scratch.BlockType.REPORTER,
            text: '[variable] as value',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              }
            }
          },
          {
            opcode: 'js_json_set_new_key',
            blockType: Scratch.BlockType.COMMAND,
            text: 'key [variable] set param [key] with value [value]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              },
              value: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '0'
              },
              key: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'new_key'
              }
            }
          },
          {
            opcode: 'js_json_remove_key',
            blockType: Scratch.BlockType.COMMAND,
            text: 'key [variable] remove param [key]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              },
              key: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'new_key'
              }
            }
          },
          {
            opcode: 'js_json_set_value',
            blockType: Scratch.BlockType.COMMAND,
            text: 'key [variable] set value [value]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              },
              value: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '0'
              }
            }
          },
          {
            opcode: 'js_json_change_value',
            blockType: Scratch.BlockType.COMMAND,
            text: 'key [variable] change value [value]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              },
              value: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '1'
              }
            }
          },
          {
            opcode: 'js_json_add_item_to_array',
            blockType: Scratch.BlockType.COMMAND,
            text: 'key [variable] add item [item] to array',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              },
              item: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'new item'
              }
            }
          },
          {
            opcode: 'js_json_remove_item_index',
            blockType: Scratch.BlockType.COMMAND,
            text: 'key [variable] remove item #[item] in array',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              },
              item: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          {
            opcode: 'js_json_remove_item_name',
            blockType: Scratch.BlockType.COMMAND,
            text: 'key [variable] remove items with name [item] in array',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'key'
              },
              item: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'item'
              }
            }
          },
          "---",
          {
            opcode: 'js_json_remove_all_vars',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete all json vars from dataStorage',
            arguments: {
            }
          },
          {
            opcode: 'js_json_save_all_vars',
            blockType: Scratch.BlockType.COMMAND,
            text: 'save all json vars in dataStorage',
            arguments: {
            }
          },
          {
            opcode: 'js_ret_all_jsons',
            blockType: Scratch.BlockType.REPORTER,
            text: 'all json variables'
          },
          "---",
          labelblock('Extra widgets'),
          {
            opcode: 'js_widgets_signal',
            blockType: Scratch.BlockType.HAT,
            text: 'When i receive signal at [sender] widget',
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
            arguments: {
              sender: {
                type: Scratch.ArgumentType.STRING,
                menu: 'sender'
              },
            }
          },
          {
            opcode: 'js_widgets_set_main_style',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set main stylesheet [style]',
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
            arguments: {
              style: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
            }
          },
          {
            opcode: 'js_widgets_register_style',
            blockType: Scratch.BlockType.COMMAND,
            text: 'register css style [style] by name [name]',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'example-style'
              },
              style: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'color : black; background-color : transparent; border : none;'
              }
            }
          },
          {
            opcode: 'js_widgets_get_style',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get css style by name [name]',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_styles'
              }
            }
          },
          {
            opcode: 'js_widgets_remove_style',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete css style by name [name]',
            arguments: {
              name: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_styles'
              }
            }
          },
          {
            opcode: 'js_widgets_mutation',
            blockType: Scratch.BlockType.COMMAND,
            text: 'mutate [variable] to widget [widget] style [style] value [value]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_vars'
              },
              widget: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_widgets'
              },
              style: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_styles'
              },
              value: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
            }
          },
          {
            opcode: 'js_widgets_mutation2',
            blockType: Scratch.BlockType.COMMAND,
            text: 'mutate [variable] to widget [widget] style [style] source list [source]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_vars'
              },
              widget: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_widgets2'
              },
              style: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_styles'
              },
              source: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_lists'
              },
            }
          },
          {
            opcode: 'js_widgets_set_visible',
            blockType: Scratch.BlockType.COMMAND,
            text: 'widget [variable] set visible [visible]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_mutations'
              },
              visible: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_vals'
              },
            }
          },
          '---',
          {
            opcode: 'js_widgets_set_attribute',
            blockType: Scratch.BlockType.COMMAND,
            text: 'widget [variable] set attribute [attr] value [value]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_mutations'
              },
              attr: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
              value: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
            }
          },
          {
            opcode: 'js_widgets_get_attribute',
            blockType: Scratch.BlockType.REPORTER,
            text: 'widget [variable] get attribute [attr]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_mutations'
              },
              attr: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
            }
          },
          '---',
          {
            opcode: 'js_widgets_add_class',
            blockType: Scratch.BlockType.COMMAND,
            text: 'widget [variable] add class [class_]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_mutations'
              },
              class_: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
            }
          },
          {
            opcode: 'js_widgets_del_class',
            blockType: Scratch.BlockType.COMMAND,
            text: 'widget [variable] remove class [class_]',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_mutations'
              },
              class_: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
            }
          },
          {
            opcode: 'js_widgets_get_class',
            blockType: Scratch.BlockType.REPORTER,
            text: 'widget [variable] all classes',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_mutations'
              },
              class_: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              },
            }
          },
          '---',
          {
            opcode: 'js_widgets_is_mutation',
            blockType: Scratch.BlockType.REPORTER,
            text: 'variable [variable] is widget?',
            arguments: {
              variable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'get_vars'
              },
            }
          },
          {
            opcode: 'js_widgets_delete',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete mutant widgets from dataStorage',
            arguments: {
            }
          },
          {
            opcode: 'js_widgets_save',
            blockType: Scratch.BlockType.COMMAND,
            text: 'save mutant widgets in dataStorage',
            arguments: {
            }
          },
          {
            opcode: 'js_widgets_all',
            blockType: Scratch.BlockType.REPORTER,
            text: 'all widgets',
            arguments: {
            }
          },
          "---",
          labelblock('Custom signals'),
          {
            opcode: 'js_custom_signal_recieve',
            blockType: Scratch.BlockType.HAT,
            text: 'When i receive from [channel] channel signal [signal]',
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
            arguments: {
              channel: {
                type: Scratch.ArgumentType.STRING,
                menu: "channel"
              },
              signal: {
                type: Scratch.ArgumentType.STRING,
                menu: 'signal'
              },
            }
          },
          {
            opcode: 'js_custom_signal_send',
            blockType: Scratch.BlockType.COMMAND,
            text: 'send to [channel] channel [signal] signal',
            arguments: {
              channel: {
                type: Scratch.ArgumentType.STRING,
                menu: "channel"
              },
              signal: {
                type: Scratch.ArgumentType.STRING,
                menu: 'signal'
              },
            }
          },
          "---",
          "---",
          {
            opcode: 'js_custom_signal_create_channel',
            blockType: Scratch.BlockType.COMMAND,
            text: 'create channel [channel]',
            arguments: {
              channel: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "newChannel"
              },
            }
          },
          {
            opcode: 'js_custom_signal_delete_channel',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete channel [channel]',
            arguments: {
              channel: {
                type: Scratch.ArgumentType.STRING,
                menu: "channel"
              },
            }
          },
          "---",
          {
            opcode: 'js_custom_create_signal',
            blockType: Scratch.BlockType.COMMAND,
            text: 'create signal [signal] for [channel] channel',
            arguments: {
              signal: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "newSignal"
              },
              channel: {
                type: Scratch.ArgumentType.STRING,
                menu: "channel"
              },
            }
          },
          {
            opcode: 'js_custom_delete_signal',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete from channel [channel] signal [signal]',
            arguments: {
              signal: {
                type: Scratch.ArgumentType.STRING,
                menu: 'signal'
              },
              channel: {
                type: Scratch.ArgumentType.STRING,
                menu: "channel"
              },
            }
          },


        ],
        menus: {
          signal: {
            acceptReporters: true,
            items: 'getSignals'
          },
          channel: {
            acceptReporters: true,
            items: 'getChannels'
          },
          get_vars: {
            acceptReporters: true,
            items: 'getVars'
          },
          sender: {
            acceptReporters: true,
            items: 'getVars'
          },
          get_lists: {
            acceptReporters: true,
            items: 'getLists'
          },
          get_jsons: {
            acceptReporters: true,
            items: 'getJSONS'
          },
          get_funcs: {
            acceptReporters: true,
            items: 'getFuncs'
          },
          get_styles: {
            acceptReporters: true,
            items: 'getStyles'
          },
          get_mutations: {
            acceptReporters: true,
            items: 'getMutations'
          },
          get_widgets: {
            acceptReporters: true,
            items: [
              {
                text: 'textbox',
                value: 'text'
              },
              {
                text: 'button',
                value: 'button'
              },
              {
                text: 'checkbox',
                value: 'checkbox'
              }
            ]
          },
          get_widgets2: {
            acceptReporters: true,
            items: [
              {
                text: 'combobox',
                value: 'combobox'
              },
              {
                text: 'radio-buttons',
                value: 'radio-buttons'
              }
            ]
          },
          get_vals: {
            acceptReporters: true,
            items: [
              {
                text: 'no',
                value: 'no'
              },
              {
                text: 'yes',
                value: 'yes'
              },
            ]
          },

          get_constr_json: {
            acceptReporters: true,
            items: 'getJSONByConstruct'
          }
        }
      };
    }

    get dataStorage() {
      return vm.runtime.getTargetForStage().lookupOrCreateList('KhandamovADataStorage', 'JsAddon:Storage').value;
    }

    getChannels() {
      if (custom_signals.size == 0) {
        return [{
          text: "select a channel",
          value: "select a channel"
        }]
      } else {
        let ret = [];
        custom_signals.forEach((v, k) => {
          ret.push({
            text: k,
            value: k
          })
        });

        return ret;
      }
    }

    getSignals(targetid) {
      let id = this.getIdFocusBlock();
      let target = this.getTarget(targetid);
      if (target != null) {
        let blocks = target.blocks._blocks;
        if (id != null) {
          let block = this.getBlockId(blocks, id);

          let results = { array: [] };
          // this.helper(results, blocks, id);

          let variable;
          let key;
          if (block.success == true) {
            this.getBlockParams(results, blocks, id);
          }

          if(results.array.length == 2){
            if(custom_signals.has(results.array[1])){
              let ret = [];
              custom_signals.get(results.array[1]).forEach(x=>{
                ret.push({
                  text : x,
                  value : x
                });
              });

              if(ret.length == 0){
                return [{
                  text : "select a signal",
                  text : "select a signal"
                }];
              }

              return ret;
            }else{
              return [{
                text : "select a signal",
                text : "select a signal"
              }];
            }
          }else{
            return [{
              text : "select a signal",
              text : "select a signal"
            }];
          }
        }else{
          return [{
            text : "select a signal",
            text : "select a signal"
          }];
        }
      }else{
        return [{
          text : "select a signal",
          text : "select a signal"
        }];
      }
    }

    saveCustomSignals(){
      let e = 0;
      while (true) {
        let index = this.dataStorage.indexOf('$restore_custom_signals', e);
        e = index;
        if (index == -1) {
          break;
        } else {
          this.dataStorage.splice(index, 3);
        }
      }

      custom_signals.forEach((v, k) => {
        v.forEach(x=>{
          this.dataStorage.push('$restore_custom_signals');
          this.dataStorage.push(k);
          this.dataStorage.push(x);
        });
      });
    }

    js_custom_signal_create_channel({ channel }) {
      custom_signals.set(channel, []);
      this.saveCustomSignals();
    }

    js_custom_signal_delete_channel({ channel }) {
      custom_signals.delete(channel);
      this.saveCustomSignals();
    }

    js_custom_create_signal({ signal, channel }) {
      if (custom_signals.has(channel)) {
        if (!custom_signals.get(channel).includes(signal)) {
          custom_signals.get(channel).push(signal);
          this.saveCustomSignals();
        }
      }
    }

    js_custom_delete_signal({ signal, channel }) {
      if(custom_signals.has(channel)){
        if(custom_signals.get(channel).includes(signal)){
          let index = custom_signals.get(channel).indexOf(signal);
          custom_signals.get(channel).splice(index, 1);
          this.saveCustomSignals();
        }
      }
    }

    js_custom_signal_recieve({signal, channel}){

    }

    js_custom_signal_send({signal, channel}){
      if(custom_signals.has(channel) && custom_signals.get(channel).includes(signal)){
      vm.runtime.startHats('KhandamovA_js_custom_signal_recieve', {
        channel,
        signal
      });
    }
    }

    js_widgets_all() {
      this.getMutations();
      let res = '';
      mutations.forEach((v, k) => {
        res += k + ' ';
      })
      return res;
    }

    js_widgets_delete() {
      let e = 0;
      while (true) {
        let index = this.dataStorage.indexOf('$restore_widget', e);
        e = index;
        if (index == -1) {
          break;
        } else {
          this.dataStorage.splice(index, 7);
        }
      }
    }

    js_widgets_save() {
      this.js_widgets_delete();

      mutations.forEach((v, k) => {
        this.dataStorage.push('$restore_widget');
        this.dataStorage.push(v.id);
        this.dataStorage.push(v.widget);
        this.dataStorage.push(v.style);
        this.dataStorage.push(v.value);
        if (v.visible == undefined) {
          this.dataStorage.push('yes');
        } else {
          this.dataStorage.push(v.visible);
        }
        this.dataStorage.push(v.classes);
      });
    }

    js_widgets_is_mutation({ variable }) {
      let ret = false;
      mutations.forEach((v, k) => {
        if (v.id == variable) {
          ret = true;
          return;
        }
      });
      return ret;
    }

    js_widgets_set_visible({ variable, visible }) {
      this.getMutations();

      mutations.forEach((v, k) => {
        if (v.id == variable) {
          if (visible == 'yes') {
            v.element.classList.remove('khandamovA-hidden');
          } else {
            v.element.classList.add('khandamovA-hidden');
          }
          v.visible = visible;
        }
      });
      let res = document.querySelectorAll('[class^="monitor_monitor-container"]');
      for (let i = 0; i < res.length; i++) {
        let id = res[i].getAttribute('data-id');
        if (id == variable) {
          let mutation_element = res[i].querySelectorAll('[class^="khandamovA-mutation-"]');

          if (mutation_element.length > 0) {
            if (visible == 'yes') {
              mutation_element[0].classList.remove('khandamovA-hidden');
            } else {
              mutation_element[0].classList.add('khandamovA-hidden');
            }
            break;
          }

          break;
        }
      }
    }

    js_widgets_set_attribute({ variable, attr, value }) {
      this.getMutations();
      mutations.forEach((v, k) => {
        if (v.id == variable) {
          attr.replace(' ', '');
          if (value == undefined) {
            value = '';
          }
          if (attr != undefined && attr != '')
            v.element.setAttribute(attr, value);
          return;
        }
      });
    }

    js_widgets_get_attribute({ variable, attr }) {
      this.getMutations();
      let ret = 'is not a widget';
      mutations.forEach((v, k) => {
        if (v.id == variable) {
          ret = v.element.getAttribute(attr);
          return;
        }
      });
      return ret;
    }

    updateClassesWidget(widget, classList) {
      widget.classes = '';
      for (let i = 0; i < classList.length; i++) {
        if (i == 0) {
          widget.classes += classList[i];
        } else {
          widget.classes += ',' + classList[i];
        }
      }
    }

    js_widgets_add_class({ variable, class_ }) {
      this.getMutations();
      mutations.forEach((v, k) => {
        if (v.id == variable) {
          class_.replace(' ', '');
          if (class_ != undefined && class_ != '')
            v.element.classList.add(class_);
          this.updateClassesWidget(v, v.element.classList);
          return;
        }
      });
    }

    js_widgets_del_class({ variable, class_ }) {
      this.getMutations();
      mutations.forEach((v, k) => {
        if (v.id == variable) {
          class_.replace(' ', '');
          if (class_ != undefined && class_ != '')
            v.element.classList.remove(class_);
          this.updateClassesWidget(v, v.element.classList);
          return;
        }
      });
    }

    js_widgets_get_class({ variable, class_ }) {
      this.getMutations();
      let ret = 'is not a widget';
      mutations.forEach((v, k) => {
        if (v.id == variable) {
          let all = v.element.classList;
          ret = '';
          for (let i = 0; i < all.length; i++) {
            ret += all[i] + " ";
          }
          return;
        }
      });
      return ret;
    }

    js_widgets_signal(args, util) {
      // console.log('signal', args);
    }

    js_widgets_set_main_style({ style }) {
      let elem = document.querySelector('.khandanovA-main-style');
      if (elem == null) {
        elem = document.createElement('style');
        elem.classList.add('khandanovA-main-style');
        elem.innerHTML = style;
        document.body.insertBefore(elem, document.body.firstChild);
      } else {
        elem.innerHTML = style;
      }

      let e = 0;
      while (true) {
        let index = this.dataStorage.indexOf('$restore_main_style', e);
        e = index;
        if (index == -1) {
          break;
        } else {
          this.dataStorage.splice(index, 2);
        }
      }

      this.dataStorage.push('$restore_main_style');
      this.dataStorage.push(style);
    }

    js_widgets_mutation({ variable, widget, style, value }) {
      let res = document.querySelectorAll('[class^="monitor_monitor-container"]');

      let res_integration = document.querySelectorAll('[class^="sc-monitor-root"]');
      if (res_integration.length > 0) {
        res = res_integration;
      }
      for (let i = 0; i < res.length; i++) {
        let id = res[i].getAttribute('data-id');
        if (id == variable) {
          let mutation_element = res[i].querySelectorAll('.khandamovA-mutation-element');

          if (mutation_element.length > 0) {
            mutation_element[0].value = value;
            mutations.forEach((v, k) => {
              if (v.id == variable) {
                v.value = value;
                return;
              }
            });
            break;
          }

          let monitor_default = res[i].querySelectorAll('[class^="monitor_default"');
          let monitor_large = res[i].querySelectorAll('[class^="monitor_large"');
          let monitor_default_integration = res[i].querySelectorAll('[class^="sc-monitor-default"');
          let monitor_large_integration = res[i].querySelectorAll('[class^="sc-monitor-large"');

          if (monitor_default_integration.length > 0) {
            monitor_default = monitor_default_integration;
            monitor_default[0].style = monitor_default[0].parentElement.getAttribute('style') + "; color: white; display: none; background-color: transparent; border: none;";
            // console.log('monitor_default',monitor_default[0].parentElement.style);
          } else {
            if (monitor_default.length > 0) {
              monitor_default[0].style += "color: white; display: none; background-color: transparent; border: none;";
              monitor_default[0].parentElement.style += "color: white; display : none; background-color: transparent; border: none;";
            }
          }


          if (monitor_large_integration.length > 0) {
            monitor_large = monitor_large_integration;
            monitor_large[0].style = "color: white; display: none; background-color: transparent; border: none;";
            monitor_large[0].parentElement.style = monitor_large[0].parentElement.getAttribute('style') + "color: white; background-color: transparent; border: none;";
            // console.log('monitor_large',monitor_large[0].parentElement.style);
          } else {
            if (monitor_large.length > 0) {
              monitor_large[0].style = "color: white; display: none; background-color: transparent; border: none;";
              monitor_large[0].parentElement.style = "color: white; display : none; background-color: transparent; border: none;";
            }
          }






          let elem = document.createElement('input');
          elem.type = widget;
          elem.classList.add('khandamovA-mutation-element');
          elem.value = value;
          elem.id = 'm' + variable;

          if (elements_styles.has(style)) {
            elem.style = elements_styles.get(style);
          } else {
            elem.style = "";
          }

          if (widget == 'button') {
            let var_ = this.getVariableData(variable);
            var_.value = elem.value;
            elem.addEventListener('click', () => {
              vm.runtime.startHats('KhandamovA_js_widgets_signal', {
                sender: variable
              });
            });
            mutations.set(var_.name, {
              id: var_.id,
              element: elem,
              widget: widget,
              style: style,
              value: value
            })
          } else if (widget == 'text') {
            let var_ = this.getVariableData(variable);
            elem.addEventListener('keyup', (event) => {
              var_.value = elem.value;
              if (event.code === 'Enter') {
                vm.runtime.startHats('KhandamovA_js_widgets_signal', {
                  sender: variable
                });
                elem.value = '';
              }
            });
            mutations.set(var_.name, {
              id: var_.id,
              element: elem,
              widget: widget,
              style: style,
              value: value
            })
          } else if (widget == 'checkbox') {
            let var_ = this.getVariableData(variable);
            elem.addEventListener('click', () => {
              var_.value = elem.checked;
              vm.runtime.startHats('KhandamovA_js_widgets_signal', {
                sender: variable
              });
            });
            mutations.set(var_.name, {
              id: var_.id,
              element: elem,
              widget: widget,
              style: style,
              value: value
            });
          }

          res[i].appendChild(elem);

          break;
        }
      }
    }

    js_widgets_mutation2({ variable, widget, style, source }) {
      let res = document.querySelectorAll('[class^="monitor_monitor-container"]');

      let res_integration = document.querySelectorAll('[class^="sc-monitor-root"]');
      if (res_integration.length > 0) {
        res = res_integration;
      }

      for (let i = 0; i < res.length; i++) {
        let id = res[i].getAttribute('data-id');
        if (id == variable) {
          let mutation_element_combobox = res[i].querySelectorAll('.khandamovA-mutation-element-combobox');

          if (mutation_element_combobox.length > 0) {
            let list = this.getVariableData(source);
            if (typeof list !== 'object') {
              break;
            }

            if (list.value.length == 0) {
              break;
            }

            mutation_element_combobox.innerHTML = '';

            for (let i = 0; i < list.value.length; i++) {
              let e = document.createElement('option');
              e.value = list.value[i];
              e.textContent = list.value[i];
              mutation_element_combobox.appendChild(e);
            }

            mutations.forEach((v, k) => {
              if (v.id == variable) {
                v.value = value;
                return;
              }
            });
            break;
          }

          let mutation_element_radios = res[i].querySelectorAll('.khandamovA-mutation-element-radio-buttons');

          if (mutation_element_radios.length > 0) {
            let list = this.getVariableData(source);
            if (typeof list !== 'object') {
              break;
            }

            if (list.value.length == 0) {
              break;
            }

            mutation_element_radios.innerHTML = '';

            for (let i = 0; i < list.value.length; i++) {
              let e = document.createElement('input');
              let l = document.createElement('label');
              e.type = 'radio';
              e.name = 'cond';
              e.value = list.value[i];
              l.appendChild(e);
              l.innerHTML += '&nbsp;&nbsp;' + list.value[i];
              mutation_element_radios.appendChild(l);
            }

            mutations.forEach((v, k) => {
              if (v.id == variable) {
                v.value = value;
                return;
              }
            });

            break;
          }

          let monitor_default = res[i].querySelectorAll('[class^="monitor_default"');
          let monitor_large = res[i].querySelectorAll('[class^="monitor_large"');
          let monitor_default_integration = res[i].querySelectorAll('[class^="sc-monitor-default"');
          let monitor_large_integration = res[i].querySelectorAll('[class^="sc-monitor-large"');

          if (monitor_default_integration.length > 0) {
            monitor_default = monitor_default_integration;
            monitor_default[0].style = monitor_default[0].parentElement.getAttribute('style') + "; color: white; display: none; background-color: transparent; border: none;";
            // console.log('monitor_default',monitor_default[0].parentElement.style);
          } else {
            if (monitor_default.length > 0) {
              monitor_default[0].style += "color: white; display: none; background-color: transparent; border: none;";
              monitor_default[0].parentElement.style += "color: white; display : none; background-color: transparent; border: none;";
            }
          }


          if (monitor_large_integration.length > 0) {
            monitor_large = monitor_large_integration;
            monitor_large[0].style = "color: white; display: none; background-color: transparent; border: none;";
            monitor_large[0].parentElement.style = monitor_large[0].parentElement.getAttribute('style') + "color: white; background-color: transparent; border: none;";
            // console.log('monitor_large',monitor_large[0].parentElement.style);
          } else {
            if (monitor_large.length > 0) {
              monitor_large[0].style = "color: white; display: none; background-color: transparent; border: none;";
              monitor_large[0].parentElement.style = "color: white; display : none; background-color: transparent; border: none;";
            }
          }

          /**
           * @type {HTMLElement}
           */
          let elem;

          if (widget == 'combobox') {
            elem = document.createElement('select');
            elem.id = 'm' + variable;
            elem.classList.add('khandamovA-mutation-element-combobox');
            elem.style = style;
            let list = this.getVariableData(source);
            if (typeof list !== 'object') {
              break;
            }

            if (list.value.length == 0) {
              break;
            }

            for (let i = 0; i < list.value.length; i++) {
              let e = document.createElement('option');
              e.value = list.value[i];
              e.textContent = list.value[i];
              elem.appendChild(e);
            }

            let var_ = this.getVariableData(variable);
            elem.addEventListener('change', function (event) {
              var_.value = event.target.value;
              const selectedValue = event.target.value;
              vm.runtime.startHats('KhandamovA_js_widgets_signal', {
                sender: variable
              });
            });
            mutations.set(var_.name, {
              id: var_.id,
              element: elem,
              widget: widget,
              style: style,
              value: source
            })

          } else if (widget == 'radio-buttons') {
            elem = document.createElement('form');
            elem.id = 'm' + variable;
            elem.classList.add('khandamovA-mutation-element-radio-buttons');
            elem.style = "display: flex; flex-direction: column;" + style;

            let list = this.getVariableData(source);
            if (typeof list !== 'object') {
              break;
            }

            if (list.value.length == 0) {
              break;
            }

            for (let i = 0; i < list.value.length; i++) {
              let e = document.createElement('input');
              let l = document.createElement('label');
              e.type = 'radio';
              e.name = 'cond';
              e.value = list.value[i];
              l.appendChild(e);
              l.innerHTML += '&nbsp;&nbsp;' + list.value[i];
              elem.appendChild(l);
            }

            let var_ = this.getVariableData(variable);
            elem.addEventListener('change', function (event) {
              var_.value = event.target.value;
              const selectedValue = event.target.value;
              vm.runtime.startHats('KhandamovA_js_widgets_signal', {
                sender: variable
              });
            });

            mutations.set(var_.name, {
              id: var_.id,
              element: elem,
              widget: widget,
              style: style,
              value: source
            })
          }


          res[i].appendChild(elem);

          break;
        }
      }
    }

    js_widgets_get_style({ name }) {
      if (elements_styles.has(name)) {
        return elements_styles.get(name);
      } else {
        return "";
      }
    }

    js_widgets_register_style({ name, style }) {
      name = name.replace(' ', '');
      elements_styles.set(name, style);
      this.saveStyles();
    }

    js_widgets_remove_style({ name }) {
      elements_styles.delete(name);
      this.saveStyles();
    }

    getVariableData(id) {
      let idv1 = Object.values(vm.runtime.targets);

      for (let i = 0; i < idv1.length; i++) {
        let vals = Object.values(idv1[i].variables).filter(x => x.id == id);
        if (vals.length > 0) {
          return vals[0];
        }
      }
    }

    saveStyles() {
      let e = 0;
      while (true) {
        let index = this.dataStorage.indexOf('$restore_style', e);
        e = index;
        if (index == -1) {
          break;
        } else {
          this.dataStorage.splice(index, 3);
        }
      }

      elements_styles.forEach((v, k) => {
        this.dataStorage.push('$restore_style');
        this.dataStorage.push(k);
        this.dataStorage.push(v);
      });
    }

    testbutton() {
      // console.log('button');
    }

    js_json_remove_all_vars() {
      this.deleteAllJsons();
    }

    js_json_save_all_vars() {
      this.saveJsons();
    }

    js_json_remove_key({ variable, key }) {
      let keys = variable.split('|');
      if (keys.length >= 1 && jsons_values.has(keys[0])) {
        let json = jsons_values.get(keys[0]);
        for (let i = 1; i < keys.length - 1; i++) {
          if (typeof json[keys[i]] !== 'undefined') {
            json = json[keys[i]];
          } else {
            return "";
          }
        }

        let k = Object.keys(json);
        if (keys.length > 1 && k.includes(keys[keys.length - 1])) {
          delete json[keys[keys.length - 1]][key];
        } else if (keys.length == 1) {
          if (typeof json === 'object') {
            delete json[key];
          }
        }
      } else {
        return "";
      }
    }

    js_json_remove_item_index({ variable, item }) {
      let keys = variable.split('|');
      if (keys.length >= 1 && jsons_values.has(keys[0])) {
        let json = jsons_values.get(keys[0]);
        for (let i = 1; i < keys.length - 1; i++) {
          if (typeof json[keys[i]] !== 'undefined') {
            json = json[keys[i]];
          } else {
            return "";
          }
        }

        let k = Object.keys(json);
        if (keys.length > 1 && k.includes(keys[keys.length - 1])) {
          json[keys[keys.length - 1]].splice(item, 1);
        } else if (keys.length == 1) {
          if (typeof json === 'object') {
            json.splice(item, 1);
          }
        }
      } else {
        return "";
      }
    }

    js_json_remove_item_name({ variable, item }) {
      let keys = variable.split('|');
      if (keys.length >= 1 && jsons_values.has(keys[0])) {
        let json = jsons_values.get(keys[0]);
        for (let i = 1; i < keys.length - 1; i++) {
          if (typeof json[keys[i]] !== 'undefined') {
            json = json[keys[i]];
          } else {
            return "";
          }
        }

        let k = Object.keys(json);
        if (keys.length > 1 && k.includes(keys[keys.length - 1])) {
          json[keys[keys.length - 1]] = json[keys[keys.length - 1]].filter(x => x != item);
        } else if (keys.length == 1) {
          if (typeof json === 'object') {
            json = json.filter(x => x != item);
          }
        }
      } else {
        return "";
      }
    }

    js_json_set_new_key({ variable, value, key }) {
      let keys = variable.split('|');
      if (keys.length >= 1 && jsons_values.has(keys[0])) {
        let json = jsons_values.get(keys[0]);
        for (let i = 1; i < keys.length - 1; i++) {
          if (typeof json[keys[i]] !== 'undefined') {
            json = json[keys[i]];
          } else {
            return "";
          }
        }

        let k = Object.keys(json);
        if (keys.length > 1 && k.includes(keys[keys.length - 1])) {
          if (typeof json[keys[keys.length - 1]] === 'object') {
            json[keys[keys.length - 1]][key] = value;
          } else {
            json[keys[keys.length - 1]] = {};
            json[keys[keys.length - 1]][key] = value;
          }
        } else if (keys.length == 1) {
          json[key] = value;
        }
      } else {
        return "";
      }
    }

    js_json_as_object(args) {
      return args.variable + '|' + args.param;
    }

    js_json_as_value({ variable }) {
      let keys = variable.split('|');
      if (keys.length >= 1 && jsons_values.has(keys[0])) {
        let json = jsons_values.get(keys[0]);
        for (let i = 1; i < keys.length; i++) {
          if (typeof json[keys[i]] !== 'undefined') {
            json = json[keys[i]];
          } else {
            return "undefined";
          }
        }

        if (typeof json === 'string') {
          return json;
        } else {
          return JSON.stringify(json);;
        }
      } else {
        return "";
      }
    }

    js_json_set_value({ variable, value }) {
      let keys = variable.split('|');
      if (keys.length >= 1 && jsons_values.has(keys[0])) {
        let json = jsons_values.get(keys[0]);
        for (let i = 1; i < keys.length - 1; i++) {
          if (typeof json[keys[i]] !== 'undefined') {
            json = json[keys[i]];
          } else {
            return "";
          }
        }

        let k = Object.keys(json);
        if (keys.length > 1 && k.includes(keys[keys.length - 1])) {
          json[keys[keys.length - 1]] = value;
        } else if (keys.length == 1) {
          json = value;
        }
      } else {
        return "";
      }
    }

    js_json_change_value({ variable, value }) {
      let keys = variable.split('|');
      if (keys.length >= 1 && jsons_values.has(keys[0])) {
        let json = jsons_values.get(keys[0]);
        for (let i = 1; i < keys.length - 1; i++) {
          if (typeof json[keys[i]] !== 'undefined') {
            json = json[keys[i]];
          } else {
            return "";
          }
        }

        let k = Object.keys(json);
        if (k.includes(keys[keys.length - 1])) {
          if (keys.length > 1 && typeof json[keys[keys.length - 1]] === 'number' || isNaN(json[keys[keys.length - 1]])) {
            json[keys[keys.length - 1]] += value;
          }
        } else if (keys.length == 1) {
          if (typeof json === 'number' || isNaN(json)) {
            json += value;
          }
        }
      } else {
        return "";
      }
    }

    js_json_add_item_to_array({ variable, item }) {
      let keys = variable.split('|');
      if (keys.length >= 1 && jsons_values.has(keys[0])) {
        let json = jsons_values.get(keys[0]);
        for (let i = 1; i < keys.length - 1; i++) {
          if (typeof json[keys[i]] !== 'undefined') {
            json = json[keys[i]];
          } else {
            return "";
          }
        }

        let k = Object.keys(json);
        if (keys.length > 1 && k.includes(keys[keys.length - 1])) {
          if (typeof json[keys[keys.length - 1]] === 'object') {
            json[keys[keys.length - 1]].push(item);
          }
        } else if (keys.length == 1) {
          if (typeof json === 'object') {
            json.push(item);
          }
        }
      } else {
        return "";
      }
    }

    js_ret_all_jsons() {
      let ret = '';
      jsons_values.forEach((v, k) => {
        ret += k + ' ';
      });
      return ret;
    }

    isFloat(n) {
      let res1 = Number.isInteger(n);
      let res2 = Number(n) === n && n % 1 !== 0;
      return res1 || res2;
    }

    replaceSubstringByIndex(inputString, startIndex, endIndex, replacement) {
      if (startIndex < 0 || endIndex >= inputString.length || startIndex > endIndex) {
        return "";
      }

      const firstPart = inputString.slice(0, startIndex);
      const secondPart = inputString.slice(endIndex + 1);
      return firstPart + replacement + secondPart;
    }

    /**
     * Возвращает айди блока под фокусом
     * @returns id блока
     */
    getFocusBlock() {
      for (let i = 0; i < 6; i++) {
        if (focusElement == null) {
          return null;
        }
        if (typeof focusElement.classList !== 'undefined') {
          if (!focusElement.classList.contains('blocklyDraggable')) {
            focusElement = focusElement.parentElement;
          } else {
            return focusElement;
          }
        } else {
          return null;
        }
      }
    }

    getIdFocusBlock() {
      let r = this.getFocusBlock();
      return r == null ? null : r.getAttribute('data-id');
    }

    getFocusDropText() {
      let f = focusElement.querySelectorAll('.blocklyDropdownText')
      if (f.length > 0) {
        return f[0];
      } else {
        return null;
      }
    }

    /**
     * Входная точка где создаются нужные инструменты и ресурсы
     */
    init({ styleMonitors }) {
      /**
       * Событие для отслеживания элементов
       */
      document.addEventListener('mousemove', (event) => {
        if (!isThrottled) {
          isThrottled = true;
          focusElement = event.target;
          setTimeout(() => {
            isThrottled = false;
          }, 100);
        }
      });

      // Не работает в экспорте
      // let upmenu = document.querySelector('.stage-header_stage-menu-wrapper_15JJt');
      // upmenu.addEventListener('click', function (event) {
      //   setTimeout(() => {
      //     let scene = document.querySelector('.stage_stage_1fD7k');
      //     // console.log(scene);
      //   }, 50);
      // });

      //custom styles for monitors
      // let styleMonitors = document.createElement('style');
      // document.body.insertBefore(styleMonitors, document.body.firstChild);

      /**
       * Восстановление сохраненых Json-ов, функций и стилей
       */
      try {
        for (let i = 0; i < this.dataStorage.length; i++) {
          const v = this.dataStorage[i];
          if (v == '$restore_json') {
            let name = this.dataStorage[i + 1];
            let json = this.dataStorage[i + 2];
            i += 2;
            jsons_values.set(name, JSON.parse(json));
          } else if (v == '$restore_function') {
            let name = this.dataStorage[i + 1];
            let success = this.dataStorage[i + 2] == 'true' ? true : false;
            let isReturned = this.dataStorage[i + 3] == 'true' ? true : false;
            let cArguments = this.dataStorage[i + 4];
            let variables = JSON.parse(this.dataStorage[i + 5]);
            let textcode = this.dataStorage[i + 6];


            let js = textcode;
            let quest = 'yes';
            this.js_init_func({ name, js, quest });
            // let func = new Function('____0', '____1', '____2', '____3', '____4', '____5', '____6', '____7', '____8', '____9', '____10', '____11', '____12', '____13', '____14', '____15'
            //   , '____16', '____17', '____18', '____19', '____20', '____21', '____22', '____23', '____24', '____25', '____26', '____27', '____28', '____29', '____30', '____31', exec).bind(this);

            // functions.set(name, {
            //   success: success,
            //   exec: func,
            //   isReturned: isReturned,
            //   cArguments: cArguments,
            //   variables: variables,
            //   textcode : exec
            // });
            i += 6;
          } else if (v == '$restore_style') {
            elements_styles.set(this.dataStorage[i + 1], this.dataStorage[i + 2]);
            i += 2;
          } else if (v == '$restore_main_style') {
            let elem = document.querySelector('.khandanovA-main-style');
            if (elem == null) {
              elem = document.createElement('style');
              elem.classList.add('khandanovA-main-style');
              elem.innerHTML = this.dataStorage[i + 1];
              document.body.insertBefore(elem, document.body.firstChild);
            } else {
              elem.innerHTML = style;
            }
            i += 1;
          }else if(v == '$restore_custom_signals'){
            let channel = this.dataStorage[i + 1];
            let signal = this.dataStorage[i + 2];
            if(!custom_signals.has(channel)){
              custom_signals.set(channel, []);
            }
            if(!custom_signals.get(channel).includes(signal)){
              custom_signals.get(channel).push(signal);
            }
            i += 2;
          }
        }

        for (let i = 0; i < this.dataStorage.length; i++) {
          const v = this.dataStorage[i];
          if (v == '$restore_widget') {
            let variable = this.dataStorage[i + 1];
            let widget = this.dataStorage[i + 2];
            let style = this.dataStorage[i + 3];
            let value = this.dataStorage[i + 4];
            let visible = this.dataStorage[i + 5];
            let classes = this.dataStorage[i + 6];
            i += 5;
            if (widget == 'combobox' || widget == 'radio-buttons') {
              let source = value;
              this.js_widgets_mutation2({ variable, widget, style, source });
            } else {
              this.js_widgets_mutation({ variable, widget, style, value });
            }
            this.js_widgets_set_visible({ variable, visible });

            let clss = classes.split(',');
            for (let i = 0; i < clss.length; i++) {
              let class_ = clss[i].replace(' ', '');
              this.js_widgets_add_class({ variable, class_ });
            }

            if (i == this.dataStorage.length - 1) {
              mutations.forEach((v, k) => {
                if (v.id == variable) {
                  /**
                   * @type {HTMLElement}
                   */
                  let e = v.element;
                  let buf = e.value;
                  e.value = 'fuck';
                  e.value = buf;
                }
              })
            }
          }
        }
        console.log('JSAddon is loaded');
      } catch {
        console.error('JSAddon is not loaded. Fatal error');
      }

      styleMonitors.innerHTML =
        "[class^='monitor_monitor-container'] {" +
        "background-color: transparent !important;" +
        "border : none;" +
        // "display: none;" +
        "}" +
        ".khandamovA-hidden {" +
        "display: none !important;" +
        "}";
    }

    SaveFunctions() {
      let e = 0;
      while (true) {
        let index = this.dataStorage.indexOf('$restore_function', e);
        e = index;
        if (index == -1) {
          break;
        } else {
          this.dataStorage.splice(index, 7);
        }
      }

      functions.forEach((v, k) => {
        this.dataStorage.push('$restore_function');
        this.dataStorage.push(k);
        this.dataStorage.push(v.success);
        this.dataStorage.push(v.isReturned);
        this.dataStorage.push(v.cArguments);
        this.dataStorage.push(JSON.stringify(v.variables));
        this.dataStorage.push(v.textcode);
      });
    }

    deleteAllJsons() {
      let e = 0;
      while (true) {
        let index = this.dataStorage.indexOf('$restore_json', e);
        e = index;
        if (index == -1) {
          break;
        } else {
          this.dataStorage.splice(index, 3);
        }
      }
    }

    deleteOneJsons(key) {
      let e = 0;
      while (true) {
        let index = this.dataStorage.indexOf('$restore_json', e);
        e = index + 1;
        if (index == -1) {
          break;
        } else {
          if (this.dataStorage[index + 1] == key) {
            this.dataStorage.splice(index, 3);
            break;
          }
        }
      }
    }

    saveJsons() {
      this.deleteAllJsons();

      jsons_values.forEach((v, k) => {
        this.dataStorage.push('$restore_json');
        this.dataStorage.push(k);
        this.dataStorage.push(JSON.stringify(v));
      });
    }

    getBlocksOpcode(container, opcode) {
      opcode = my_id + "_" + opcode;
      const fblocks = Object.values(container).filter(x => x.opcode == opcode);

      /**
       * @type {Array<{opcode : text, inputs : Array<{name : text, id : text}, fields : Array<{name : text, value : text}}>}
       */
      let ret = new Array;
      for (let i = 0; i < fblocks.length; i++) {

        /**
         * @type {Array<{name : text, id : text}>}
         */
        let input_ = new Array;
        const inputs_ = Object.values(fblocks[i].inputs);
        inputs_.forEach(v => {
          input_.push({
            name: v.name,
            id: v.block
          });
        });

        /**
          * @type {Array<{name : text, value : text}>}
          */
        let field_ = new Array;
        const fields_ = Object.values(fblocks[i].fields);
        fields_.forEach(v => {
          field_.push({
            name: v.name,
            value: v.value
          });
        });

        ret.push({
          id: fblocks[i].id,
          opcode: fblocks[i].opcode,
          inputs: input_,
          fields: field_
        });
      }

      return ret;
    }

    getBlockId(container_, id_) {
      const fblocks = Object.values(container_).filter(x => x.id == id_);

      if (id_ == undefined || id_ == null) {
        return {
          success: false
        }
      }
      /**
       * @type {{opcode : text, inputs : Array<{name : text, id : text}>, fields : Array<{name : text, value : text}}}
       */
      let ret;
      if (fblocks.length > 0) {
        /**
          * @type {Array<{name : text, id : text}>}
          */
        let input_ = new Array;
        const inputs_ = Object.values(fblocks[0].inputs);
        inputs_.forEach(v => {
          input_.push({
            name: v.name,
            id: v.block
          });
        });

        /**
          * @type {Array<{name : text, value : text}>}
          */
        let field_ = new Array;
        const fields_ = Object.values(fblocks[0].fields);
        fields_.forEach(v => {
          field_.push({
            name: v.name,
            value: v.value
          });
        });

        ret = {
          success: true,
          opcode: fblocks[0].opcode,
          inputs: input_,
          fields: field_,
          id: id_
        };
        return ret;
      } else {
        ret = {
          success: false
        }
        return ret;
      }
    }

    getTarget(targetid) {
      let mytarget = null;
      const result = Object.values(vm.runtime.targets).filter(x => x.id == targetid);
      if (result.length > 0) {
        mytarget = result[0];
      }

      return mytarget;
    }

    getVars(targetid) {
      const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.type != 'list' && x.type != 'broadcast_msg');
      const localVars = Object.values(vm.editingTarget.variables).filter(x => x.type != 'list' != 'broadcast_msg');
      const uniqueVars = [...new Set([...globalVars, ...localVars])];
      if (uniqueVars.length === 0) {
        return [
          {
            text: 'select a variable',
            value: 'select a variable'
          }
        ];
      }

      return uniqueVars.map(i => ({
        text: i.name,
        value: i.id
      }));
    }

    getVarsV2(targetid) {
      const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.type != 'list');
      const localVars = Object.values(vm.editingTarget.variables).filter(x => x.type != 'list');
      const uniqueVars = [...new Set([...globalVars, ...localVars])];
      if (uniqueVars.length === 0) {
        return [
          {
            text: 'select a variable',
            value: 'select a variable'
          }
        ];
      }

      return uniqueVars.map(i => ({
        text: i.name,
        value: i.name
      }));
    }

    getLists() {
      const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.type == 'list');
      const localVars = Object.values(vm.editingTarget.variables).filter(x => x.type == 'list');
      const uniqueVars = [...new Set([...globalVars, ...localVars])];
      if (uniqueVars.length === 0) {
        return [
          {
            text: 'select a list',
            value: 'select a list'
          }
        ];
      }

      return uniqueVars.map(i => ({
        text: i.name,
        value: i.id
      }));
    }

    getJSONS() {
      let res = [];
      jsons_values.forEach((v, k) => {
        res.push({
          text: k,
          value: k
        })
      });

      if (res.length == 0) {
        return [{
          text: 'select a variable',
          value: 'select a variable'
        }]
      } else {
        return res;
      }
    }

    getMutations() {
      let res = [];
      // // console.log('mutations', mutations);
      let del = new Array;
      mutations.forEach((v, k) => {
        let f = document.querySelector('[id="' + v.element.id + '"]');

        if (f == null) {
          del.push(k);
        } else {
          res.push({
            text: k,
            value: v.id
          });
        }
      });

      del.forEach(x => {
        mutations.delete(x);
      })

      if (res.length == 0) {
        return [{
          text: 'select a variable',
          value: 'select a variable'
        }]
      } else {
        return res;
      }
    }

    getStyles() {
      if (elements_styles.size == 0) {
        return [{
          text: "select a style",
          value: "select a style"
        }];
      } else {
        let res = new Array;
        elements_styles.forEach((v, k) => {
          res.push({
            text: k,
            value: k
          });
        });
        return res;
      }
    }

    getBlockParams(res, blks, id) {
      let block = this.getBlockId(blks, id);
      if (block.success == false) {
        return;
      } else {
        if (block.fields.length > 0) {
          for (let i = 0; i < block.fields.length; i++) {
            let f = block.fields[block.fields.length - 1 - i];
            res.array.push(f.value);
          }
          return;
        } else if (block.inputs.length > 0) {
          for (let i = 0; i < block.inputs.length; i++) {
            let f = block.inputs[block.inputs.length - 1 - i];
            this.getBlockParams(res, blks, f.id);
          }
        } else {
          return;
        }
      }
    }

    getJSONByConstruct(targetid) {
      let id = this.getIdFocusBlock();
      let target = this.getTarget(targetid);
      if (target != null) {
        let blocks = target.blocks._blocks;
        if (id != null) {
          let block = this.getBlockId(blocks, id);

          let results = { array: [] };
          // this.helper(results, blocks, id);

          let variable;
          let key;
          if (block.success == true) {
            this.getBlockParams(results, blocks, id);
          }

          let json_var = null;
          let answer = [];

          if (results.array.length >= 2 && jsons_values.has(results.array[results.array.length - 1])) {
            json_var = jsons_values.get(results.array[results.array.length - 1]);
          }

          if (json_var != null) {
            for (let i = 1; i < results.array.length - 1; i++) {
              let value = results.array[results.array.length - 1 - i];
              if (typeof json_var[value] !== 'undefined') {
                json_var = json_var[value];
              } else {
                answer = [{
                  text: 'failed',
                  value: 'failed'
                }];
                return answer;
                break;
              }
            }

            if (typeof json_var === 'number') {
              answer = [{
                text: 'select a param',
                value: 'select a param'
              }];
            } else {
              let keys = Object.keys(json_var);
              for (let i = 0; i < keys.length; i++) {
                answer.push({
                  text: keys[i],
                  value: keys[i]
                });
              }

              if (keys.length == 0) {
                answer.push({
                  text: 'object haven\'t params',
                  value: 'object haven\'t params'
                });
              }

              return answer;
            }
          }

          // console.log('getJSONByConstruct', id, results, vm);

        }
      }
      return [
        {
          text: 'select a param',
          value: 'select a param'
        }
      ];
    }

    getFuncs() {
      let res = [];
      functions.forEach((v, k) => {
        res.push({
          text: k,
          value: k
        })
      });

      if (res.length == 0) {
        return [{
          text: 'select a function',
          value: 'select a function'
        }]
      } else {
        return res;
      }
    }

    js_exec_code(args) {
      // console.log(args.js);
      try {
        // console.log(args);
        let js = args.js + '';
        let n = 0; let e = 0;
        let className = '';
        let argument = '';
        let cond = -1;
        let scodeEnd = -1;
        while (true) {
          //let g = new GVar(\'my variable\'); let l = new LVar(\'my variable\'); return \'hello JavaScript! \' + g + \' \' + l;
          n = js.indexOf('new', e);
          e = n;
          // console.log('new find', n);
          if (n != -1) {
            let cls1 = js.indexOf('(');
            let cls2 = js.indexOf(';');
            let cls3 = js.indexOf(' ');
            let cls4 = js.length;

            if (cls1 != -1) {
              className = js.substring(n + 4, cls1);
              className = className.replace(' ', '');
              scodeEnd = js.indexOf(')', cls1);
              cond = cls1;
              if (scodeEnd == -1) {
                break;
              }
            } else if (cls2 != -1) {
              e = cls2;
              continue;
            } else if (cls3 != -1) {
              e = cls3;
              continue;
            } else {
              break;
            }
          } else {
            break;
          }

          // console.log('classname', className, 'new var', Scratch);

          if (cond != -1) {
            let begA = js.indexOf('\'', cond);
            let endA = js.indexOf('\'', begA + 1);
            let begA2 = js.indexOf('\"', cond);
            let endA2 = js.indexOf('\"', begA2 + 1);

            // console.log('find argument', begA, endA, scodeEnd)


            if (begA != -1 && endA != -1 && begA < scodeEnd && endA < scodeEnd) {
              argument = js.substring(begA + 1, endA);
            } else if (begA2 != -1 && endA2 != -1 && begA2 < scodeEnd && endA2 < scodeEnd) {
              argument = js.substring(begA2 + 1, endA2);
            } else {
              e = js.length;
            }

            if (className == 'GVar') {
              const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.name == argument);
              // console.log('setValue', globalVars);
              if (globalVars.length > 0) {
                js = this.replaceSubstringByIndex(js, n, scodeEnd, "\"" + globalVars[0].value + "\"")
              } else {
                js = this.replaceSubstringByIndex(js, n, scodeEnd, '\'\'');
              }
            } else if (className == 'LVar') {
              const localVars = Object.values(vm.editingTarget.variables).filter(x => x.name == argument);
              if (localVars.length > 0) {
                js = this.replaceSubstringByIndex(js, n, scodeEnd, "\"" + localVars[0].value + "\"")
              } else {
                js = this.replaceSubstringByIndex(js, n, scodeEnd, '\'\'');
              }
            }
            // console.log('argument', argument);

            className = '';
          }
        }
        // console.log('itog', js);

        let func = new Function(js);
        if (args.js.includes('return')) {
          const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.id == args.variable);
          // console.log('vars', vm.editingTarget.variables);
          let answer = func();
          if (!this.isFloat(answer)) {
            // answer = answer;
          }
          if (globalVars.length > 0) {
            vm.runtime.getTargetForStage().variables[args.variable].value = answer;
          } else {
            vm.editingTarget.variables[args.variable].value = answer;
          }
          return 'successful';
        } else {
          func();
        }
      } catch {
        return 'error';
      }
      return 'error';
    }

    js_exec_code_ret(args) {
      // console.log(args);
      try {
        // console.log(args);
        let js = args.js + '';
        let n = 0; let e = 0;
        let className = '';
        let argument = '';
        let cond = -1;
        let scodeEnd = -1;
        while (true) {
          //let g = new GVar(\'my variable\'); let l = new LVar(\'my variable\'); return \'hello JavaScript! \' + g + \' \' + l;
          n = js.indexOf('new', e);
          e = n;
          // console.log('new find', n);
          if (n != -1) {
            let cls1 = js.indexOf('(');
            let cls2 = js.indexOf(';');
            let cls3 = js.indexOf(' ');
            let cls4 = js.length;

            if (cls1 != -1) {
              className = js.substring(n + 4, cls1);
              className = className.replace(' ', '');
              scodeEnd = js.indexOf(')', cls1);
              cond = cls1;
              if (scodeEnd == -1) {
                break;
              }
            } else if (cls2 != -1) {
              e = cls2;
              continue;
            } else if (cls3 != -1) {
              e = cls3;
              continue;
            } else {
              break;
            }
          } else {
            break;
          }

          // console.log('classname', className, 'new var', Scratch);

          if (cond != -1) {
            let begA = js.indexOf('\'', cond);
            let endA = js.indexOf('\'', begA + 1);
            let begA2 = js.indexOf('\"', cond);
            let endA2 = js.indexOf('\"', begA2 + 1);

            // console.log('find argument', begA, endA, scodeEnd)


            if (begA != -1 && endA != -1 && begA < scodeEnd && endA < scodeEnd) {
              argument = js.substring(begA + 1, endA);
            } else if (begA2 != -1 && endA2 != -1 && begA2 < scodeEnd && endA2 < scodeEnd) {
              argument = js.substring(begA2 + 1, endA2);
            } else {
              e = js.length;
            }

            if (className == 'GVar') {
              const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.name == argument);
              // console.log('setValue', globalVars);
              if (globalVars.length > 0) {
                js = this.replaceSubstringByIndex(js, n, scodeEnd, "\"" + globalVars[0].value + "\"");
              } else {
                js = this.replaceSubstringByIndex(js, n, scodeEnd, '\'none\'');
              }
            } else if (className == 'LVar') {
              const localVars = Object.values(vm.editingTarget.variables).filter(x => x.name == argument);
              if (localVars.length > 0) {
                js = this.replaceSubstringByIndex(js, n, scodeEnd, "\"" + localVars[0].value + "\"");
              } else {
                js = this.replaceSubstringByIndex(js, n, scodeEnd, '\'none\'');
              }
            }
            // console.log('argument', argument);

            className = '';
          }
        }
        // console.log('itog', js);

        let func = new Function(js);
        if (args.js.includes('return')) {
          const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.id == args.variable);
          // console.log('vars', vm.editingTarget.variables);
          let answer = func();
          return answer;
        } else {
          func();
          return "function not returned";
        }
      } catch {
        return 'error';
      }
      return 'error';
    }

    js_init_func(args) {
      // console.log(args);
      let access = true;
      if (!functions.has(args.name)) {
        access = true;
      } else {
        if (args.quest == 'no') {
          access = false;
        }
      }

      if (access) {
        try {

          let vars_ = new Array;

          let js = args.js + '';
          let n = 0; let e = 0;
          let className = '';
          let argument = '';
          let cond = -1;
          let scodeEnd = -1;
          let counter = 0;
          while (true) {
            //let g = new GVar(\'my variable\'); let l = new LVar(\'my variable\'); return \'hello JavaScript! \' + g + \' \' + l;
            n = js.indexOf('new', e);
            e = n;
            // console.log('new find', n);
            if (n != -1) {
              let cls1 = js.indexOf('(');
              let cls2 = js.indexOf(';');
              let cls3 = js.indexOf(' ');
              let cls4 = js.length;

              if (cls1 != -1) {
                className = js.substring(n + 4, cls1);
                className = className.replace(' ', '');
                scodeEnd = js.indexOf(')', cls1);
                cond = cls1;
                if (scodeEnd == -1) {
                  break;
                }
              } else if (cls2 != -1) {
                e = cls2;
                continue;
              } else if (cls3 != -1) {
                e = cls3;
                continue;
              } else {
                break;
              }
            } else {
              break;
            }

            // console.log('classname', className, 'new var', Scratch);

            if (cond != -1) {
              let begA = js.indexOf('\'', cond);
              let endA = js.indexOf('\'', begA + 1);
              let begA2 = js.indexOf('\"', cond);
              let endA2 = js.indexOf('\"', begA2 + 1);

              // console.log('find argument', begA, endA, scodeEnd)


              if (begA != -1 && endA != -1 && begA < scodeEnd && endA < scodeEnd) {
                argument = js.substring(begA + 1, endA);
                js = this.replaceSubstringByIndex(js, n, scodeEnd, '____' + counter);
                counter++;
              } else if (begA2 != -1 && endA2 != -1 && begA2 < scodeEnd && endA2 < scodeEnd) {
                argument = js.substring(begA2 + 1, endA2);
                js = this.replaceSubstringByIndex(js, n, scodeEnd, '____' + counter);
                counter++;
              } else {
                e = js.length;
              }


              if (className == 'GVar') {
                const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.name == argument);
                vars_.push({
                  variable: globalVars.length > 0 ? globalVars[0].id : 'error',
                  index: counter - 1,
                  where: 0
                });


              } else if (className == 'LVar') {
                const localVars = Object.values(vm.editingTarget.variables).filter(x => x.name == argument);
                vars_.push({
                  variable: localVars.length > 0 ? localVars[0].id : 'error',
                  index: counter - 1,
                  where: 1
                });
              }
              // console.log('argument', argument);

              className = '';
            }
          }


          // console.log('itog', js);

          let func = new Function('____0', '____1', '____2', '____3', '____4', '____5', '____6', '____7', '____8', '____9', '____10', '____11', '____12', '____13', '____14', '____15'
            , '____16', '____17', '____18', '____19', '____20', '____21', '____22', '____23', '____24', '____25', '____26', '____27', '____28', '____29', '____30', '____31', js).bind(this);

          if (vars_.length > 32) {
            functions.set(args.name, {
              success: false,
              exec: () => { return 'error'; },
              isReturned: js.includes('return'),
              cArguments: vars_.length,
              variables: vars_,
              textcode: args.js
            });
          } else {
            functions.set(args.name, {
              success: true,
              exec: func,
              isReturned: js.includes('return'),
              cArguments: vars_.length,
              variables: vars_,
              textcode: args.js
            });
          }



        } catch {
          return 'failed';
        }
        this.SaveFunctions();
        return 'success';
      }
    }

    js_remove_func(args, util) {
      functions.delete(args.name);
      this.SaveFunctions();
    }

    js_exec_code_from_func_ret(args) {
      // console.log(args);

      if (functions.has(args.func)) {
        const e = functions.get(args.func);

        if (e.success) {
          let args_ = new Array;

          try {
            for (let i = 0; i < e.variables.length; i++) {
              let v;
              if (e.variables[i].where == 0) {
                v = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.id == e.variables[i].variable);
              } else {
                v = Object.values(vm.editingTarget.variables).filter(x => x.id == e.variables[i].variable);
              }

              if (v.length > 0) {
                args_.push(v[0].value);
              } else {
                args_.push("\"none\"");
              }
            }

            let ans = e.exec(...args_);

            if (e.isReturned) {
              return ans;
            } else {
              return "success";
            }

          } catch {
            return "error";
          }
          return "";
        }
      } else {
        return "error";
      }
    }

    js_exec_code_from_func(args) {
      // console.log(args);

      if (functions.has(args.func)) {
        const e = functions.get(args.func);

        if (e.success) {
          let args_ = new Array;

          try {
            for (let i = 0; i < e.variables.length; i++) {
              let v;
              if (e.variables[i].where == 0) {
                v = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.id == e.variables[i].variable);
              } else {
                v = Object.values(vm.editingTarget.variables).filter(x => x.id == e.variables[i].variable);
              }

              if (v.length > 0) {
                args_.push(v[0].value);
              } else {
                args_.push("\"none\"");
              }
            }

            let ans = e.exec(...args_);

            const v2 = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.id == args.variable);
            if (v2.length > 0) {
              if (e.isReturned) {
                vm.runtime.getTargetForStage().variables[args.variable].value = ans;
              } else {

              }
            } else {
              const v3 = Object.values(vm.editingTarget.variables).filter(x => x.id == args.variable);

              if (e.isReturned) {
                vm.editingTarget.variables[args.variable].value = ans;
              } else {

              }
            }
          } catch {

          }


        }
      }
    }

    js_ret_convert_var(args, until) {
      // const v = until.target.lookupVariableById(args.variable);
      try {
        const globalVars = Object.values(vm.runtime.getTargetForStage().variables).filter(x => x.id == args.variable);
        const localVars = Object.values(vm.editingTarget.variables).filter(x => x.id == args.variable);
        let v;
        let type;
        if (globalVars.length > 0) {
          v = globalVars[0];
          type = "GVar";
        } else {
          v = localVars[0];
          type = "LVar";
        }
        // console.log('until', until.target.lookupVariableById(args.variable), until);
        return "let any_name_var = new " + type + "('" + v.name + "');";
      } catch {
        return 'error';
      }
    }

    js_func_is_init(args) {
      return functions.has(args.name);
    }

    js_ret_all_functions(args) {
      let ret = '';
      let one = true;
      functions.forEach((v, k) => {
        if (one) {
          ret += k;
          one = false;
        } else {
          ret += ', ' + k;
        }
      });
      return ret;
    }

    js_exec_ret_raw_code({ func }) {
      if (functions.has(func)) {
        let v = functions.get(func);
        return v.textcode;
      }
      return "is not a function";
    }

    js_json_create({ name, value }) {
      try {
        let json = JSON.parse(value);
        jsons_values.set(name, json);
        return true;
      } catch {
        return false;
      }
      return false;
    }

    js_json_delete({ name }) {
      if (jsons_values.has(name)) {
        jsons_values.delete(name);
        return true;
      }
      return false;
    }

    js_json_get_var({ variable }) {
      if (variable == 'select a variable')
        return "";
      return variable;
    }

    js_json_exist({ name }) {
      return jsons_values.has(name);
    }
  }

  addon = new JSAddon();


  Scratch.extensions.register(addon);
})(Scratch);
