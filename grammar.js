module.exports = grammar({
  name: 'PRISM',

  /*extras: $ => [],*/

  rules: {
    source_file: $ =>
      seq(
        optional($.model_type),
        repeat(choice($.constant, $.legacy_constant)),
        repeat1($.module),
      ),

    model_type: $ => choice(
      $.dtmc_model_type,
      $.ctmc_model_type,
      $.mdp_model_type,
      $.pta_model_type,
    ),

    dtmc_model_type: $ => choice(
      'dtmc',
      'probabilistic',
    ),

    ctmc_model_type: $ => choice(
      'ctmc',
      'stochastic',
    ),

    mdp_model_type: $ => choice(
      'mdp',
      'nondeterministic',
    ),

    pta_model_type: $ => 'pta',

    constant: $ => seq(
      'const',
      field('type', $.type),
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';',
    ),

    legacy_constant: $ => seq(
      field('type', choice('const', 'rate', 'prob')),
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';',
    ),

    module: $ => seq(
      'module',
      field('name', $.identifier),
      choice($.explicit_module, $.renamed_module),
      'endmodule',
    ),

    explicit_module: $ => seq(
      repeat1($.variable),
      repeat1($.command),
    ),

    renamed_module: $ => seq(
      '=',
      field('source_module', $.identifier),
      '[',
      repeat(seq($.rename, ',')),
      $.rename,
      ']'
    ),

    rename: $ => seq(
      $.identifier,
      '=',
      $.identifier,
    ),

    variable: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', choice($.range, $.type)),
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
      field('variable', $.identifier),
      '\'',
      '=',
      field('value', $.expression),
      ')'
    ),

    expression: $ => choice(
      $.value,
      $.identifier,
      $.ternary,
      $.implication,
      $.iff,
      $.logical_or,
      $.logical_and,
      $.logical_neg,
      $.equality,
      $.inequality,
      $.lt,
      $.lte,
      $.gt,
      $.gte,
      $.addition,
      $.subtraction,
      $.multiplication,
      $.division,
      $.unary_minus,
      $.parentheses,
      /*
      $.min,
      $.max,
      $.floor,
      $.ceil,
      $.round,
      $.pow,
      $.mod,
      $.log,
      */
      $.function,
    ),

    parentheses:    $ => prec.left(12, seq('(', $.expression, ')')),

    // Infix functions
    ternary:        $ => prec.left(1, seq($.expression, '?', $.expression, ':', $.expression)),
    implication:    $ => prec.left(2, seq($.expression, '=>', $.expression)),
    iff:            $ => prec.left(3, seq($.expression, '<=>', $.expression)),
    logical_or:     $ => prec.left(4, seq($.expression, '|', $.expression)),
    logical_and:    $ => prec.left(5, seq($.expression, '&', $.expression)),
    logical_neg:    $ => prec.left(6, seq('!', $.expression)),
    equality:       $ => prec.left(7, seq($.expression, '=', $.expression)),
    inequality:     $ => prec.left(7, seq($.expression, '!=', $.expression)),
    lt:             $ => prec.left(8, seq($.expression, '<', $.expression)),
    lte:            $ => prec.left(8, seq($.expression, '<=', $.expression)),
    gt:             $ => prec.left(8, seq($.expression, '>', $.expression)),
    gte:            $ => prec.left(8, seq($.expression, '>=', $.expression)),
    addition:       $ => prec.left(9, seq($.expression, '+', $.expression)),
    subtraction:    $ => prec.left(9, seq($.expression, '-', $.expression)),
    multiplication: $ => prec.left(10, seq($.expression, '*', $.expression)),
    division:       $ => prec.left(10, seq($.expression, '/', $.expression)),
    unary_minus:    $ => prec.left(11, seq('-', $.expression)),

    // Built-in functions
    min:    $ => seq('min(', repeat1(seq($.expression, ',')), $.expression, ')'),
    max:    $ => seq('max(', repeat1(seq($.expression, ',')), $.expression, ')'),
    floor:  $ => seq('floor(', $.expression, ')'),
    ceil:   $ => seq('ceil(', $.expression, ')'),
    round:  $ => seq('round(', $.expression, ')'),
    pow:    $ => seq('pow(', $.expression, ',', $.expression, ')'),
    mod:    $ => seq('mod(', $.expression, ',', $.expression, ')'),
    log:    $ => seq('log(', $.expression, ',', $.expression, ')'),

    function:  $ => seq(
      field('name', $.function_identifier),
      field('parameter', optional(seq(repeat(seq($.expression, ',')), $.expression))),
      ')'
    ),

    range: $ => seq(
      '[',
      field('low', $.expression),
      '..',
      field('high', $.expression),
      ']',
    ),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    function_identifier: $ => /[A-Za-z_][A-Za-z0-9_]*\(/,

    type: $ => choice(
      $.bool_type,
      $.int_type,
      $.double_type,
    ),

    bool_type: $ => 'bool',

    int_type: $ => 'int',

    double_type: $ => 'double',

    value: $ => choice($.int_value, $.double_value, $.bool_value),

    int_value: $ => /\d+/,

    double_value: $ => /\d+(\/\d+|\.\d+)?/,

    bool_value: $ => choice('true', 'false'),
  }
});