var m = require('mithril');
var partial = require('chessground').util.partial;
var storedProp = require('common').storedProp;
var storedJsonProp = require('common').storedJsonProp;

module.exports = {
  controller: function(game, withGames, onClose) {
    var variant = (game.variant.key === 'fromPosition') ? 'standard' : game.variant.key;

    var available = ['lichess'];
    if (variant === 'standard') available.push('masters');
    else if (variant === 'antichess' && withGames && game.initialFen.indexOf('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w ') === 0) {
        available.push('watkins');
    }

    var data = {
      open: m.prop(false),
      db: {
        available: available,
        selected: available.length > 1 ? storedProp('explorer.db.' + variant, available[0]) : function() {
          return available[0];
        }
      },
      rating: {
        available: [1600, 1800, 2000, 2200, 2500],
        selected: storedJsonProp('explorer.rating', [1600, 1800, 2000, 2200, 2500])
      },
      speed: {
        available: ['bullet', 'blitz', 'classical'],
        selected: storedJsonProp('explorer.speed', ['bullet', 'blitz', 'classical'])
      }
    };

    var toggleMany = function(c, value) {
      if (c().indexOf(value) === -1) c(c().concat([value]));
      else if (c().length > 1) c(c().filter(function(v) {
        return v !== value;
      }));
    };

    return {
      data: data,
      toggleOpen: function() {
        data.open(!data.open());
        if (!data.open()) onClose();
      },
      toggleDb: function(db) {
        data.db.selected(db);
      },
      toggleRating: partial(toggleMany, data.rating.selected),
      toggleSpeed: partial(toggleMany, data.speed.selected),
      fullHouse: function() {
        return data.db.selected() === 'masters' || (
          data.rating.selected().length === data.rating.available.length &&
          data.speed.selected().length === data.speed.available.length
        );
      }
    };
  },
  view: function(ctrl) {
    var d = ctrl.data;
    return [
      m('section.db', [
        m('label', 'Database'),
        m('div.choices', d.db.available.map(function(s) {
          return m('span', {
            class: d.db.selected() === s ? 'selected' : '',
            onclick: partial(ctrl.toggleDb, s)
          }, s);
        }))
      ]),
      d.db.selected() === 'masters' ? m('div.masters.message', [
        m('i[data-icon=C]'),
        m('p', "Two million OTB games of 2200+ FIDE rated players from 1952 to 2016"),
      ]) : (d.db.selected() === 'watkins' ? m('div.masters.message', [
        m('i[data-icon=@]'),
        m('p', "Watkins antichess solution: 1. e3 is a win for white")
      ]) : m('div', [
        m('section.rating', [
          m('label', 'Players\' average rating'),
          m('div.choices',
            d.rating.available.map(function(r) {
              return m('span', {
                class: d.rating.selected().indexOf(r) > -1 ? 'selected' : '',
                onclick: partial(ctrl.toggleRating, r)
              }, r);
            })
          )
        ]),
        m('section.speed', [
          m('label', 'Game speed'),
          m('div.choices',
            d.speed.available.map(function(s) {
              return m('span', {
                class: d.speed.selected().indexOf(s) > -1 ? 'selected' : '',
                onclick: partial(ctrl.toggleSpeed, s)
              }, s);
            })
          )
        ])
      ])),
      m('section.save',
        m('button.button.text[data-icon=E]', {
          onclick: ctrl.toggleOpen
        }, 'All set!')
      )
    ];
  }
};
