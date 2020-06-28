module.exports = grammar({
  name: 'PRISM',

  /*extras: $ => [],*/

  rules: {
    source_file: $ =>
      seq(
        optional(choice($.model_type, $.legacy_model_type)),
        repeat($.constant),
        repeat1($.module),
      ),

    model_type: $ => choice(
      'mdp',
      'dtmc',
      'ctmc',
      'pta',
    ),

    legacy_model_type: $ => choice(
      'probabilistic',
      'stochastic',
      'nondeterministic',
    ),

    constant: $ => seq(
      'const',
      field('type', $.primitive_type),
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';',
    ),

    module: $ => seq(
      'module',
      field('name', $.identifier),
      repeat1($.variable),
      repeat1($.command),
      'endmodule',
    ),

    variable: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', choice($.range, $.primitive_type)),
      field('init', optional(seq('init', $.expression))),
      ';'
    ),

    command: $ => seq(
      '[',
      optional(field('action', $.identifier)),
      ']',
      $.guard,
      '->',
      choice(
        $.probabilistic_updates,
        $.updates,
      ),
      ';',
    ),

    // TODO: ensure boolean
    guard: $ => $.expression,

    probabilistic_updates: $ => seq(
      repeat(seq($.probabilistic_update, '+')),
      $.probabilistic_update,
    ),

    probabilistic_update: $ => seq(
      $.expression,
      ':',
      $.updates
    ),

    updates: $ => seq(
      repeat(seq($.update, '&')),
      $.update
    ),

    update: $ => seq(
      '(',
      $.identifier,
      '\'',
      '=',
      $.expression,
      ')'
    ),

    expression: $ => choice(
      $.value,
      $.identifier,
      $.infix_function,
      $.built_in_function,
    ),

    infix_function: $ => choice(
      prec.left(1, seq($.expression, '?', $.expression, ':', $.expression)),
      prec.left(2, seq($.expression, '=>', $.expression)),
      prec.left(3, seq($.expression, '<=>', $.expression)),
      prec.left(3, seq($.expression, '<=>', $.expression)),
      prec.left(4, seq($.expression, '|', $.expression)),
      prec.left(5, seq($.expression, '&', $.expression)),
      prec.left(6, seq('!', $.expression)),
      prec.left(7, seq($.expression, '=', $.expression)),
      prec.left(7, seq($.expression, '!=', $.expression)),
      prec.left(8, seq($.expression, '<', $.expression)),
      prec.left(8, seq($.expression, '<=', $.expression)),
      prec.left(8, seq($.expression, '>=', $.expression)),
      prec.left(8, seq($.expression, '>', $.expression)),
      prec.left(9, seq($.expression, '+', $.expression)),
      prec.left(9, seq($.expression, '-', $.expression)),
      prec.left(10, seq($.expression, '*', $.expression)),
      prec.left(10, seq($.expression, '/', $.expression)),
      prec.left(11, seq('-', $.expression)),
    ),

    built_in_function: $ => choice(
      seq('min(', repeat1(seq($.expression, ',')), $.expression, ')'),
      seq('max(', repeat1(seq($.expression, ',')), $.expression, ')'),
      seq('floor(', $.expression, ')'),
      seq('ceil(', $.expression, ')'),
      seq('round(', $.expression, ')'),
      seq('pow(', $.expression, ',', $.expression, ')'),
      seq('mod(', $.expression, ',', $.expression, ')'),
      seq('log(', $.expression, ',', $.expression, ')'),
    ),

    primitive_type: $ => choice(
      'bool',
      'int',
      'double'
    ),

    range: $ => seq(
      '[',
      field('low', $.expression),
      '..',
      field('high', $.expression),
      ']',
    ),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    value: $ => choice($.integer, $.boolean, $.double),

    probability: $ => $.double,

    rate: $ => $.integer,

    integer: $ => /\d+/,

    double: $ => /\d+(\/\d+|\.\d+)?/,

    boolean: $ => choice('true', 'false'),
  }
});