module.exports = grammar({
  name: 'PRISM',

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
      field('value', $.value),
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
      field('init', optional(seq('init', $.value))),
      ';'
    ),

    command: $ => seq(
      '[]',
      $.guard,
      '->',
      choice(
        $.probabilistic_updates,
        $.updates,
      ),
      ';',
    ),

    // TODO
    guard: $ => choice(
      seq(
        $.identifier,
        $.binary_function,
        $.value,
      ),
    ),

    probabilistic_updates: $ => seq(
      repeat(seq($.probabilistic_update, '+')),
      $.probabilistic_update,
    ),

    probabilistic_update: $ => seq(
      $.probability,
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

    binary_function: $ => choice(
      '=',
      '!=',
      '>',
      '<',
      '>=',
      '<=',
    ),

    boolean_function: $ => choice(
      '&',
      '|',
    ),

    primitive_type: $ => choice(
      'bool',
      'int',
    ),

    range: $ => seq(
      '[',
      field('low', $.number),
      '..',
      field('high', $.number),
      ']',
    ),

    // TODO
    expression: $ => $.value,

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    value: $ => choice($.number, $.boolean),

    number: $ => /\d+/,

    boolean: $ => choice('true', 'false'),

    probability: $ => '0.5',
  }
});