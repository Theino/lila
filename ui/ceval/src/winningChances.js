var defined = require('common').defined;

function toPov(color, diff) {
  return color === 'white' ? diff : -diff;
}

/**
 * https://graphsketch.com/?eqn1_color=1&eqn1_eqn=100+*+%282+%2F+%281+%2B+exp%28-0.005+*+x%29%29+-+1%29&eqn2_color=2&eqn2_eqn=100+*+%282+%2F+%281+%2B+exp%28-0.004+*+x%29%29+-+1%29&eqn3_color=3&eqn3_eqn=&eqn4_color=4&eqn4_eqn=&eqn5_color=5&eqn5_eqn=&eqn6_color=6&eqn6_eqn=&x_min=-1000&x_max=1000&y_min=-100&y_max=100&x_tick=100&y_tick=10&x_label_freq=2&y_label_freq=2&do_grid=0&do_grid=1&bold_labeled_lines=0&bold_labeled_lines=1&line_width=4&image_w=850&image_h=525
 */
function rawWinningChances(cp) {
  return 2 / (1 + Math.exp(-0.004 * cp)) - 1;
}

function cpWinningChances(cp) {
  return rawWinningChances(Math.min(Math.max(-1000, cp), 1000));
}

function mateWinningChances(mate) {
  var cp = (21 - Math.min(10, Math.abs(mate))) * 100;
  var signed = cp * (mate > 0 ? 1 : -1);
  return rawWinningChances(signed);
}

function evalWinningChances(eval) {
  return defined(eval.cp) ? cpWinningChances(eval.cp) : mateWinningChances(eval.mate);
}

function povChances(color, eval) {
  return toPov(color, evalWinningChances(eval));
}

module.exports = {
  // winning chances for a color
  // 1  infinitely winning
  // -1 infinitely losing
  povChances: povChances,
  // computes the difference, in winning chances, between two evaluations
  // 1  = e1 is infinately better than e2
  // -1 = e1 is infinately worse  than e2
  povDiff: function(color, e1, e2) {
    return (povChances(color, e1) - povChances(color, e2)) / 2;
  }
}
