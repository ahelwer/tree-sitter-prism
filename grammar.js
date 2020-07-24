module.exports = grammar({
  name: 'prism',

  /*extras: $ => [],*/

  rules: {
    source_file: $ => repeat(
      choice(
        $.model_type,
        $.constant,
        $.legacy_constant,
        $.module,
        $.renamed_module,
        $.multiple_initial_states,
        $.global_variable,
        $.formula,
        $.label,
        $.rewards,
        $.process_algebra_operators,
      ),
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
      field('value', $._expression),
      ';',
    ),

    legacy_constant: $ => seq(
      field('type', choice('const', 'rate', 'prob')),
      field('name', $.identifier),
      '=',
      field('value', $._expression),
      ';',
    ),

    module: $ => seq(
      'module',
      field('name', $.identifier),
      repeat($.variable),
      repeat($.command),
      'endmodule',
    ),

    renamed_module: $ => seq(
      'module',
      field('name', $.identifier),
      '=',
      field('source_module', $.identifier),
      '[',
      repeat(seq($.rename, ',')),
      $.rename,
      ']',
      'endmodule',
    ),

    rename: $ => seq(
      field('old_name', $.identifier),
      '=',
      field('new_name', $.identifier),
    ),

    variable: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', choice($.range, $.type)),
      field('init', optional(seq('init', $._expression))),
      ';'
    ),

    command: $ => seq(
      '[',
      field('action', optional($.identifier)),
      ']',
      $.guard,
      '->',
      choice(
        $.probabilistic_updates,
        $.updates,
      ),
      ';',
    ),

    guard: $ => $._expression,

    probabilistic_updates: $ => seq(
      repeat(seq($.probabilistic_update, '+')),
      $.probabilistic_update,
    ),

    probabilistic_update: $ => seq(
      $._expression,
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
      field('value', $._expression),
      ')'
    ),

    multiple_initial_states: $ => seq(
      'init',
      field('predicate', $._expression),
      'endinit',
    ),

    global_variable: $ => seq(
      'global',
      field('name', $.identifier),
      ':',
      field('type', choice($.range, $.int_type, $.bool_type)),
      field('init', optional(seq('init', $._expression))),
      ';'
    ),

    formula: $ => seq(
      'formula',
      field('name', $.identifier),
      '=',
      field('value', $._expression),
      ';',
    ),

    label: $ => seq(
      'label',
      field('name', $.label_identifier),
      '=',
      field('predicate', $._expression),
      ';',
    ),

    rewards: $ => seq(
      'rewards',
      optional($.label_identifier),
      repeat(choice($.state_reward, $.transition_reward)),
      'endrewards'
    ),

    state_reward: $ => seq(
      field('predicate', $._expression),
      ':',
      field('reward', $._expression),
      ';',
    ),

    transition_reward: $ => seq(
      '[',
      field('action', optional($.identifier)),
      ']',
      field('predicate', $._expression),
      ':',
      field('reward', $._expression),
      ';',
    ),

    process_algebra_operators: $ => seq(
      'system',
      'endsystem',
    ),

    _expression: $ => choice(
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

    parentheses:    $ => prec.left(12, seq('(', $._expression, ')')),

    // Infix functions
    ternary:        $ => prec.left(1, seq($._expression, '?', $._expression, ':', $._expression)),
    implication:    $ => prec.left(2, seq($._expression, '=>', $._expression)),
    iff:            $ => prec.left(3, seq($._expression, '<=>', $._expression)),
    logical_or:     $ => prec.left(4, seq($._expression, '|', $._expression)),
    logical_and:    $ => prec.left(5, seq($._expression, '&', $._expression)),
    logical_neg:    $ => prec.left(6, seq('!', $._expression)),
    equality:       $ => prec.left(7, seq($._expression, '=', $._expression)),
    inequality:     $ => prec.left(7, seq($._expression, '!=', $._expression)),
    lt:             $ => prec.left(8, seq($._expression, '<', $._expression)),
    lte:            $ => prec.left(8, seq($._expression, '<=', $._expression)),
    gt:             $ => prec.left(8, seq($._expression, '>', $._expression)),
    gte:            $ => prec.left(8, seq($._expression, '>=', $._expression)),
    addition:       $ => prec.left(9, seq($._expression, '+', $._expression)),
    subtraction:    $ => prec.left(9, seq($._expression, '-', $._expression)),
    multiplication: $ => prec.left(10, seq($._expression, '*', $._expression)),
    division:       $ => prec.left(10, seq($._expression, '/', $._expression)),
    unary_minus:    $ => prec.left(11, seq('-', $._expression)),

    // Built-in functions
    /*
    min:    $ => seq('min(', repeat1(seq($._expression, ',')), $._expression, ')'),
    max:    $ => seq('max(', repeat1(seq($._expression, ',')), $._expression, ')'),
    floor:  $ => seq('floor(', $._expression, ')'),
    ceil:   $ => seq('ceil(', $._expression, ')'),
    round:  $ => seq('round(', $._expression, ')'),
    pow:    $ => seq('pow(', $._expression, ',', $._expression, ')'),
    mod:    $ => seq('mod(', $._expression, ',', $._expression, ')'),
    log:    $ => seq('log(', $._expression, ',', $._expression, ')'),
    */

    function:  $ => seq(
      field('name', $.function_identifier),
      field('parameter', optional(seq(repeat(seq($._expression, ',')), $._expression))),
      ')'
    ),

    range: $ => seq(
      '[',
      field('low', $._expression),
      '..',
      field('high', $._expression),
      ']',
    ),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    function_identifier: $ => /[A-Za-z_][A-Za-z0-9_]*\(/,

    label_identifier: $ => /\"[A-Za-z_][A-Za-z0-9_]*\"/,

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