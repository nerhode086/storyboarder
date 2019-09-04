const { Machine } = require('xstate')

const { log } = require('../components/Log')

const machine = Machine({
  id: 'ui',
  strict: true,
  type: 'parallel',
  context: {},
  states: {
    controls: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            'TRIGGER_START': [
              {
                // ignore if no intersection
                cond: 'noHit'
              },
              {
                cond: 'wasButton',
                actions: 'onSelect'
              },
              {
                cond: 'wasSlider',
                target: 'dragging'
              }
            ]
          }
        },
        dragging: {
          onEntry: ['updateDraggingController', 'onDraggingEntry'],
          onExit: ['clearDraggingController', 'onDraggingExit'],
          on: {
            'TRIGGER_END': {
              target: 'idle'
            },
            'CONTROLLER_INTERSECTION': {
              actions: 'onDrag'
            }
          }
        }
      }
    }
  }
}, {
  guards: {
    noHit: (context, event) => event.canvasIntersection == null,
    wasButton: (context, event) => event.canvasIntersection.type == 'button',
    wasSlider: (context, event) => event.canvasIntersection.type == 'slider'
  }
})

module.exports = machine